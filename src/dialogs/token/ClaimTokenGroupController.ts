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

import {computed, Ref} from "vue";
import {TransactionGroupController} from "@/dialogs/core/transaction/TransactionGroupController.ts";
import {TokenAirdrop, Transaction} from "@/schemas/MirrorNodeSchemas.ts";
import {walletManager} from "@/router.ts";
import {PendingAirdropCache} from "@/utils/cache/PendingAirdropCache.ts";

export class ClaimTokenGroupController extends TransactionGroupController {

    public static readonly MAX_AIRDROPS_PER_CLAIM = 10

    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>, public readonly airdrops: Ref<TokenAirdrop[]>) {
        super(showDialog)
    }

    public readonly airdropCount = computed(() => this.airdrops.value?.length ?? 0)

    //
    // TransactionGroupController
    //

    public getTransactionCount(): number {
        return Math.ceil(this.airdropCount.value / ClaimTokenGroupController.MAX_AIRDROPS_PER_CLAIM)
    }

    protected async executeTransaction(index: number): Promise<Transaction | string | null> {

        const airdrops = this.airdrops.value!
        PendingAirdropCache.instance.forgetTokenAirdrops(airdrops)

        const start = index * ClaimTokenGroupController.MAX_AIRDROPS_PER_CLAIM
        const end = Math.min(airdrops.length, start + ClaimTokenGroupController.MAX_AIRDROPS_PER_CLAIM)
        return walletManager.claimTokenAirdrops(airdrops.slice(start, end))
    }

}
