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
import {CryptoTextFieldController, HbarTextFieldState} from "@/dialogs/transaction/common/CryptoTextFieldController.ts";
import {CryptoAllowance} from "@/schemas/MirrorNodeSchemas.ts";
import {TransactionController} from "@/dialogs/transaction/TransactionController.ts";
import {walletManager} from "@/router.ts";

export class UpdateCryptoAllowanceController extends TransactionController {

    public readonly inputText: Ref<string>
    private readonly hbarAllowance: Ref<CryptoAllowance | null>
    private readonly cryptoController: CryptoTextFieldController

    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>, hbarAllowance: Ref<CryptoAllowance | null>) {
        super(showDialog)
        this.hbarAllowance = hbarAllowance
        this.cryptoController = new CryptoTextFieldController(this.oldTinyAmount, true)
        this.inputText = this.cryptoController.inputText
    }

    public readonly spenderId = computed(() => this.hbarAllowance.value?.spender ?? null)

    public readonly oldTinyAmount = computed(() => {
        const a = this.hbarAllowance.value?.amount_granted
        return a ? BigInt(a) : null
    })

    public readonly newTinyAmount = computed(() => this.cryptoController.newTinyAmount.value)

    public readonly newUserAmount = computed(() => this.cryptoController.newUserAmount.value)

    public readonly feedbackMessage = computed(() => {
        let result: string|null
        switch(this.cryptoController.state.value) {
            case HbarTextFieldState.empty:
                result = null
                break
            case HbarTextFieldState.invalidSyntax:
                result = "Invalid HBAR amount"
                break
            case HbarTextFieldState.unexpectedNegative:
                result = "Positive amount is expected"
                break;
            case HbarTextFieldState.unexpectedZero:
                result = "Amount cannot be zero"
                break;
            case HbarTextFieldState.ok:
            default:
                result = null
                break
        }
        return result
    })

    //
    // TaskController
    //

    public canBeExecuted(): boolean {
        return this.spenderId.value !== null
            && this.newTinyAmount.value !== null
            && this.newTinyAmount.value !== this.oldTinyAmount.value
    }

    public async executeTransaction(): Promise<string|null> {
        const spenderId = this.spenderId.value!
        const newUserAmount = this.newUserAmount.value!
        return await walletManager.approveHbarAllowance(spenderId, Number(newUserAmount))
    }

}
