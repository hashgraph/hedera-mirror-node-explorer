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

import {
    compareTransferByAccount,
    StakingRewardTransfer,
    Transaction,
} from "@/schemas/MirrorNodeSchemas";

export class RewardTransferLayout {

    public readonly transaction: Transaction | undefined
    public readonly destinations = Array<StakingRewardTransfer>()
    public readonly rewardAmount: number

    //
    // Public
    //

    public constructor(transaction: Transaction | undefined) {

        this.transaction = transaction
        this.rewardAmount = 0

        if (this.transaction?.staking_reward_transfers) {
            for (const t of this.transaction.staking_reward_transfers) {
                this.destinations.push(t)
                this.rewardAmount += t.amount
            }
            this.destinations.sort(compareTransferByAccount)
        }
    }
}
