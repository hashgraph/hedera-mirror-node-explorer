/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

import {computed, Ref, ref, watch, WatchStopHandle} from "vue";
import {decode} from "@ethereum-sourcify/bytecode-utils";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import axios from "axios";

export class ByteCodeAnalyzer {

    public readonly byteCode = ref<string|undefined>(undefined)
    private readonly watchHandle: Ref<WatchStopHandle|null> = ref(null)
    public readonly ipfsLoading = ref<boolean>(false)
    public readonly ipfsMetadata: Ref<SolcMetadata|undefined> = ref(undefined)

    //
    // Public
    //

    public constructor(byteCode: Ref<string|undefined>) {
        this.byteCode = byteCode
    }

    public mount(): void {
        this.watchHandle.value = watch(this.ipfsURL,this.ipfsUrlDidChange, { immediate: true})
    }

    public unmount(): void {
        if (this.watchHandle.value !== null) {
            this.watchHandle.value()
            this.watchHandle.value = null
        }
        this.ipfsMetadata.value = undefined
    }

    public readonly solcVersion = computed(() => this.decodedObject.value?.solcVersion)

    public readonly ipfsHash = computed(() => this.decodedObject.value?.ipfs)

    public readonly swarmHash = computed(() => this.decodedObject.value?.bzzr1)

    public readonly ipfsURL = computed(() => {
        return this.ipfsHash.value ? "https://ipfs.io/ipfs/" + this.ipfsHash.value : undefined
    })

    //
    // Private
    //

    private readonly decodedObject = computed(() => {
        let result: DecodedObject|null
        if (this.byteCode.value) {
            try {
                result = decode(this.byteCode.value)
                console.log("result=" + JSON.stringify(result))
            } catch {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

    private readonly ipfsUrlDidChange = async () => {
        if (this.ipfsURL.value) {
            this.ipfsLoading.value = true
            try {
                const options = { timeout: 10000 }
                const stealthAxios = axios.create()
                this.ipfsMetadata.value = (await stealthAxios.get<SolcMetadata>(this.ipfsURL.value, options)).data
            } catch {
                this.ipfsMetadata.value = undefined
            } finally {
                this.ipfsLoading.value = false
            }
        } else {
            this.ipfsMetadata.value = undefined
        }
    }

}

type DecodedObject = {
    ipfs?: string
    bzzr1?: string
    solcVersion?: string
}
