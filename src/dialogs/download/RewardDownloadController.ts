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

import {DownloadController} from "@/dialogs/download/DownloadController.ts";
import {StakingReward, StakingRewardsResponse} from "@/schemas/MirrorNodeSchemas.ts";
import {computed, ref, Ref} from "vue";
import {RewardDownloader} from "@/utils/downloader/RewardDownloader.ts";

export enum Period { Day = 1, Week = 7, Month = 30, Year = 365 }

export class RewardDownloadController extends DownloadController<StakingReward, StakingRewardsResponse> {

    public readonly accountId: Ref<string|null>
    public readonly periodOption: Ref<Period> = ref(Period.Day)
    private readonly downloader: RewardDownloader

    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>, accountId: Ref<string|null>) {
        super(showDialog)
        this.accountId = accountId
        this.downloader = new RewardDownloader(
            this.accountId, this.startDate, ref(null), 1000)
    }

    public readonly startDate = computed(() => {
        const now = new Date()
        const result = new Date(now.getTime());
        result.setDate(now.getDate() - this.periodOption.value);
        return result
    })

    //
    // DownloadController
    //

    public getDownloader(): RewardDownloader {
        return this.downloader
    }

    //
    // TaskController
    //

    public canBeExecuted(): boolean {
        return true
    }

    public async execute(): Promise<void> {
        await this.downloader.run()
    }

}
