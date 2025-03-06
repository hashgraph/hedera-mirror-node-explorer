// SPDX-License-Identifier: Apache-2.0

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
