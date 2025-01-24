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

import {ethers} from "ethers";
import {computed, Ref} from "vue";
import {BaseTextFieldController} from "@/dialogs/transaction/common/BaseTextFieldController.ts";

export class CryptoTextFieldController {

    public readonly oldTinyAmount: Ref<bigint|null>
    public readonly inputText: Ref<string>
    public readonly rejectZero: boolean
    private readonly baseTextFieldController: BaseTextFieldController

    //
    // Public
    //

    public constructor(oldTinyAmount: Ref<bigint|null>, rejectZero: boolean) {
        this.oldTinyAmount = oldTinyAmount
        this.rejectZero = rejectZero
        this.baseTextFieldController = new BaseTextFieldController(this.oldUserAmount)
        this.inputText = this.baseTextFieldController.inputText
    }

    public readonly oldUserAmount = computed(() => {
        return this.oldTinyAmount.value !== null ? ethers.formatUnits(this.oldTinyAmount.value, 8) : null
    })

    public readonly newUserAmount = computed<string|null>(() => {
        let result: string|null
        if (this.newTinyAmount.value !== null) {
            result = ethers.formatUnits(this.newTinyAmount.value, 8)
        } else {
            result = null
        }
        return result
    })

    public readonly newTinyAmount = computed<bigint|null>(() => {
        let result: bigint|null
        if (this.state.value === HbarTextFieldState.ok) {
            const trimmedValue = this.baseTextFieldController.newText.value.trim()
            try {
                result = ethers.parseUnits(trimmedValue, 8)
            } catch {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

    public readonly state = computed<HbarTextFieldState>(() => {
        let result: HbarTextFieldState
        const trimmedValue = this.baseTextFieldController.newText.value.trim()
        if (trimmedValue !== "") {
            const f = parseFloat(trimmedValue)
            if (isNaN(f)) {
                result = HbarTextFieldState.invalidSyntax
            } else if (f < 0) {
                result = HbarTextFieldState.unexpectedNegative
            } else if (f === 0 && this.rejectZero) {
                result = HbarTextFieldState.unexpectedZero
            } else {
                result = HbarTextFieldState.ok
            }
        } else {
            result = HbarTextFieldState.empty
        }
        return result
    })
}

export enum HbarTextFieldState {
    empty,
    invalidSyntax, // Invalid float syntax
    unexpectedZero, // Amount is zero and props.rejectZero is true
    unexpectedNegative, // Amount is negative
    ok
}

