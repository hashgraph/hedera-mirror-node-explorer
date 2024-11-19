/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {StakingReward, StakingRewardsResponse} from "@/schemas/MirrorNodeSchemas";
import {Ref, watch} from "vue";
import {dateToTimestamp, EntityDownloader} from "@/utils/downloader/EntityDownloader";
import axios, {AxiosResponse} from "axios";
import {CSVEncoder} from "@/utils/CSVEncoder";

export class RewardDownloader extends EntityDownloader<StakingReward, StakingRewardsResponse> {

    public readonly accountId: Ref<string | null>

    //
    // Public
    //

    public constructor(accountId: Ref<string | null>,
                       startDate: Ref<Date | null>,
                       endDate: Ref<Date | null>,
                       maxRewardCount: number) {
        super(startDate, endDate, maxRewardCount)
        this.accountId = accountId
        watch(this.accountId, () => {
            this.abort().then()
        })
    }

    //
    // EntityDownloader
    //

    protected async loadNext(nextURL: string | null): Promise<AxiosResponse<StakingRewardsResponse>> {

        if (nextURL == null) {

            const startTimestamp = dateToTimestamp(this.checkStartDate())
            const endTimestamp = this.endDate.value !== null ? dateToTimestamp(this.endDate.value) : null

            nextURL = "api/v1/accounts/" + this.checkAccountId() + "/rewards"
                + "?timestamp=gte:" + startTimestamp
            if (endTimestamp !== null) {
                nextURL += "&timestamp=lt:" + endTimestamp
            }
            nextURL += "&limit=100"
        }

        return axios.get<StakingRewardsResponse>(nextURL)
    }

    protected fetchEntities(response: StakingRewardsResponse): StakingReward[] {
        return response.rewards ?? []
    }

    protected nextURL(response: StakingRewardsResponse): string | null {
        return response.links?.next ?? null
    }

    protected entityTimestamp(entity: StakingReward): string | null {
        return entity.timestamp ?? null
    }

    protected makeCSVEncoder(dateFormat: Intl.DateTimeFormat): CSVEncoder<StakingReward> {
        return new RewardEncoder(this.entities.value, this.checkAccountId(), dateFormat)
    }

    protected makeOutputPrefix(): string {
        return "Hedera Rewards " + this.checkAccountId()
    }

    //
    // Private
    //

    private checkAccountId(): string {
        let result: string
        if (this.accountId.value !== null) {
            result = this.accountId.value
        } else {
            throw new Error("this.accountId is null")
        }
        return result
    }
}

export class RewardEncoder extends CSVEncoder<StakingReward> {

    private readonly accountId: string

    //
    // Public
    //

    constructor(rewards: StakingReward[], accountId: string, dateFormat: Intl.DateTimeFormat) {
        super(rewards, dateFormat)
        this.accountId = accountId
    }

    //
    // CSVEncoder
    //

    protected encodeEntity(t: StakingReward): string[][] {
        const timestamp = t.timestamp ? this.formatTimestamp(t.timestamp) : ""
        const reward = this.formatAmount(t.amount)
        return [[timestamp, reward]]
    }

    protected encodeHeaderRow(): string[] | null {
        return ["#date", "#reward_amount"]
    }
}
