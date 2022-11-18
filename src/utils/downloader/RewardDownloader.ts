/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

import {Reward, RewardResponse, TransactionResponse} from "@/schemas/HederaSchemas";
import {Ref, watch} from "vue";
import {dateToTimestamp, EntityDownloader} from "@/utils/downloader/EntityDownloader";
import axios, {AxiosResponse} from "axios";
import {CSVEncoder} from "@/utils/CSVEncoder";
import {RewardsTransactionTableController} from "@/components/staking/RewardsTransactionTableController";

export class RewardDownloader extends EntityDownloader<Reward, RewardResponse> {

    public readonly accountId: Ref<string|null>

    private readonly wrongSetupError = new Error("this.accountId or this.startDate not set")

    //
    // Public
    //

    public constructor(accountId: Ref<string|null>,
                       startDate: Ref<Date|null>,
                       endDate: Ref<Date|null>,
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

    protected async loadNext(nextURL: string|null): Promise<AxiosResponse<RewardResponse>> {
        let result: AxiosResponse<RewardResponse>

        try {
            result = await this.loadNextReal(nextURL)
        } catch (error) {
            if (axios.isAxiosError(error) && error?.response?.status == 404) {
                result = await this.loadNextEmulated(nextURL)
            } else {
                throw error
            }
        }

        return Promise.resolve(result)
    }

    protected fetchEntities(response: RewardResponse): Reward[] {
        return response.rewards ?? []
    }

    protected nextURL(response: RewardResponse): string | null {
        return response.links?.next ?? null
    }

    protected entityTimestamp(entity: Reward): string | null {
        return entity.timestamp ?? null
    }

    protected makeCSVEncoder(dateFormat: Intl.DateTimeFormat): CSVEncoder<Reward> {
        let result: CSVEncoder<Reward>
        if (this.accountId.value !== null) {
            result = new RewardEncoder(this.getEntities(), this.accountId.value, dateFormat)
        } else {
            throw this.wrongSetupError
        }
        return result
    }

    protected makeOutputPrefix(): string {
        return this.accountId.value !== null ? "Hedera Rewards " + this.accountId.value : ""
    }

    //
    // Private
    //


    private async loadNextReal(nextURL: string|null): Promise<AxiosResponse<RewardResponse>> {

        if (nextURL == null) {
            if (this.accountId.value !== null && this.startDate.value !== null){
                const startTimestamp = dateToTimestamp(this.startDate.value)
                const endTimestamp = this.endDate.value !== null ? dateToTimestamp(this.endDate.value) : null

                nextURL = "api/v1/accounts/" + this.accountId.value + "/rewards"
                    + "?timestamp=gte:" + startTimestamp
                if (endTimestamp !== null) {
                    nextURL += "&timestamp=lt:" + endTimestamp
                }
                nextURL += "&limit=100"
            } else {
                throw this.wrongSetupError
            }
        }

        return axios.get<RewardResponse>(nextURL)
    }


    private async loadNextEmulated(nextURL: string|null): Promise<AxiosResponse<RewardResponse>> {

        if (nextURL == null) {
            if (this.accountId.value !== null && this.startDate.value !== null){
                const startTimestamp = dateToTimestamp(this.startDate.value)
                const endTimestamp = this.endDate.value !== null ? dateToTimestamp(this.endDate.value) : null

                nextURL = "api/v1/transactions"
                    + "?account.id=" + this.accountId.value
                    + "&timestamp=gte:" + startTimestamp
                if (endTimestamp !== null) {
                    nextURL += "&timestamp=lt:" + endTimestamp
                }
                nextURL += "&limit=100"
            } else {
                throw this.wrongSetupError
            }
        }
        const transactionResponse = await axios.get<TransactionResponse>(nextURL)

        return Promise.resolve(this.makeRewardResponse(transactionResponse))
    }

    private makeRewardResponse(transactionResponse: AxiosResponse<TransactionResponse>): AxiosResponse<RewardResponse> {
        const rewards: Reward[] = []
        const accountId = this.accountId.value!
        for (const t of transactionResponse.data.transactions ?? []) {
            const amount = RewardsTransactionTableController.getAmountRewarded(t, accountId)
            if (amount > 0) {
                const newReward: Reward = {
                    account_id: this.accountId.value!,
                    amount: amount,
                    timestamp: t.consensus_timestamp ?? "0"
                }
                rewards.push(newReward)
            }
        }
        const rewardResponse: RewardResponse = {
            rewards: rewards,
            links: transactionResponse.data.links
        }
        return {
            data: rewardResponse,
            status: transactionResponse.status,
            statusText: transactionResponse.statusText,
            headers: transactionResponse.headers,
            config: transactionResponse.config,
            request: transactionResponse.request
        }
    }
}

export class RewardEncoder extends CSVEncoder<Reward> {

    private readonly accountId: string

    //
    // Public
    //

    constructor(rewards: Reward[], accountId: string, dateFormat: Intl.DateTimeFormat) {
        super(rewards, dateFormat)
        this.accountId = accountId
    }

    //
    // CSVEncoder
    //

    protected encodeEntity(t: Reward): string[][] {
        const timestamp = t.timestamp ? this.formatTimestamp(t.timestamp) : ""
        const reward = this.formatAmount(t.amount)
        return [[timestamp, reward]]
    }

    protected encodeHeaderRow(): string[] | null {
        return ["#date","#reward_amount"]
    }
}
