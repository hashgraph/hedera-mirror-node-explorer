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

import {computed, Ref, ref} from "vue";
import {AuxdataStyle, decode} from "@ethereum-sourcify/bytecode-utils";

export class ByteCodeAnalyzer {

    public readonly byteCode = ref<string | null>(null)

    //
    // Public
    //

    public constructor(byteCode: Ref<string | null>) {
        this.byteCode = byteCode
    }

    public readonly solcVersion = computed(() => this.decodedObject.value?.solcVersion ?? null)

    //
    // Private
    //

    private readonly decodedObject = computed(() => {
        let result: DecodedObject | null
        if (this.byteCode.value) {
            try {
                result = decode(this.byteCode.value, AuxdataStyle.SOLIDITY)
            } catch {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

}

type DecodedObject = {
    ipfs?: string
    bzzr1?: string
    solcVersion?: string
}
