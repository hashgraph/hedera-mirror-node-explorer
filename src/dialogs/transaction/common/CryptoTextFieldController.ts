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
import {computed, ref, Ref} from "vue";
import {InputChangeController} from "@/components/utils/InputChangeController.ts";

export class CryptoTextFieldController {

    private readonly inputChangeController: InputChangeController

    //
    // Public
    //

    public constructor(private readonly rejectZero: boolean, public readonly input: Ref<string> = ref("")) {
        this.inputChangeController = new InputChangeController(input)
    }

    public readonly state = computed<HbarTextFieldState>(() => {
        let result: HbarTextFieldState
        const trimmedValue = this.inputChangeController.outputText.value.trim()
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

    public readonly userAmount = computed<string|null>(() => {
        let result: string|null
        if (this.tinyAmount.value !== null) {
            result = ethers.formatUnits(this.tinyAmount.value, 8)
        } else {
            result = null
        }
        return result
    })

    public readonly tinyAmount = computed<bigint|null>(() => {
        let result: bigint|null
        if (this.state.value === HbarTextFieldState.ok) {
            const trimmedValue = this.inputChangeController.outputText.value.trim()
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
}

export enum HbarTextFieldState {
    empty,
    invalidSyntax, // Invalid float syntax
    unexpectedZero, // Amount is zero and props.rejectZero is true
    unexpectedNegative, // Amount is negative
    ok
}

