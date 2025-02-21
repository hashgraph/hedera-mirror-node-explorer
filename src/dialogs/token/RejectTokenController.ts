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
import {walletManager} from "@/router.ts";
import {TransactionController} from "@/dialogs/core/transaction/TransactionController.ts";
import {TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer.ts";
import {Transaction} from "@/schemas/MirrorNodeSchemas.ts";
import {waitForTransactionRefresh} from "@/schemas/MirrorNodeUtils.ts";
import {TokenId, TokenRejectTransaction} from "@hashgraph/sdk";

export class RejectTokenController extends TransactionController {

    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>, public readonly tokenAnalyzer: Ref<TokenInfoAnalyzer>) {
        super(showDialog)
    }

    public readonly tokenId = computed(() => this.tokenAnalyzer.value.tokenId.value)

    public readonly tokenType = computed(() => this.tokenAnalyzer.value.isFungible.value ? "token" : "NFT")

    //
    // TransactionController
    //

    public canBeExecuted(): boolean {
        return this.tokenAnalyzer.value.balance.value !== null
                && this.tokenAnalyzer.value.balance.value > 0
                && this.tokenAnalyzer.value.isFungible.value !== null
                && this.tokenAnalyzer.value.isFungible.value
    }


    protected async executeTransaction(): Promise<Transaction|string|null> {
        const transaction = new TokenRejectTransaction()
        transaction.addTokenId(TokenId.fromString(this.tokenId.value!))
        const tid = await walletManager.rejectTokens(transaction)
        const result = await waitForTransactionRefresh(tid)
        this.tokenAnalyzer.value.tokenAssociationDidChange()
        return Promise.resolve(result)
    }
}
