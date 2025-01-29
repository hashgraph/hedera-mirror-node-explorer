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

import {computed, ref, Ref} from "vue";
import {InputChangeController} from "@/components/utils/InputChangeController.ts";
import {ethers} from "ethers";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache.ts";
import {EntityLookup} from "@/utils/cache/base/EntityCache.ts";
import {TokenInfo} from "@/schemas/MirrorNodeSchemas.ts";

export class TokenAmountTextFieldController {

    private readonly inputChangeController: InputChangeController
    private readonly tokenLookup: EntityLookup<string, TokenInfo|null>

    //
    // Public
    //

    public constructor(
        public readonly tokenId: Ref<string|null>,
        private readonly rejectZero: boolean,
        public readonly input: Ref<string> = ref("")) {
        this.inputChangeController = new InputChangeController(input)
        this.tokenLookup = TokenInfoCache.instance.makeLookup(this.tokenId)
    }

    public mount(): void {
        this.tokenLookup.mount()
    }

    public unmount(): void {
        this.tokenLookup.unmount()
    }

    public readonly state = computed(() => {
        let result: TokenAmountTextFieldState
        const trimmedValue = this.inputChangeController.outputText.value.trim()
        if (trimmedValue !== "") {
            const f = parseFloat(trimmedValue)
            if (isNaN(f)) {
                result = TokenAmountTextFieldState.invalidSyntax
            } else if (f < 0) {
                result = TokenAmountTextFieldState.unexpectedNegative
            } else if (f === 0 && this.rejectZero) {
                result = TokenAmountTextFieldState.unexpectedZero
            } else {
                result = TokenAmountTextFieldState.ok
            }
        } else {
            result = TokenAmountTextFieldState.empty
        }
        return result
    })

    public readonly userAmount = computed<string|null>(() => {
        let result: string|null
        if (this.tinyAmount.value !== null && this.decimals.value !== null) {
            result = ethers.formatUnits(this.tinyAmount.value, this.decimals.value)
        } else {
            result = null
        }
        return result
    })

    public readonly tinyAmount = computed<bigint|null>(() => {
        let result: bigint|null
        if (this.state.value === TokenAmountTextFieldState.ok && this.decimals.value !== null) {
            const trimmedValue = this.inputChangeController.outputText.value.trim()
            try {
                result = ethers.parseUnits(trimmedValue, this.decimals.value)
            } catch {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

    public readonly decimals = computed(() => {
        const d = this.tokenLookup.entity.value?.decimals
        return d ? Number(d) : null
    })
}

export enum TokenAmountTextFieldState {
    empty,
    invalidSyntax, // Invalid entity id syntax
    unexpectedZero, // Amount is zero and props.rejectZero is true
    unexpectedNegative, // Amount is negative
    ok
}
