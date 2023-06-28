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

import {computed, Ref, ref} from "vue";
import {decode} from "@ethereum-sourcify/bytecode-utils";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import {Lookup} from "@/utils/cache/base/EntityCache";
import {IPFSCache} from "@/utils/cache/IPFSCache";

export class ByteCodeAnalyzer {

    public readonly byteCode = ref<string|null>(null)
    public readonly ipfsLookup: Lookup<string, unknown|undefined>

    //
    // Public
    //

    public constructor(byteCode: Ref<string|null>) {
        this.byteCode = byteCode
        this.ipfsLookup = IPFSCache.instance.makeLookup(this.ipfsHash)
        // this.swarmLookup = SWARMCache.instance.makeLookup(computed(() => this.swarmHash.value ?? null))
    }

    public mount(): void {
        this.ipfsLookup.mount()
    }

    public unmount(): void {
        this.ipfsLookup.unmount()
    }

    public readonly solcVersion = computed(() => this.decodedObject.value?.solcVersion ?? null)

    public readonly ipfsHash = computed(() => this.decodedObject.value?.ipfs ?? null)

    public readonly swarmHash = computed(() => this.decodedObject.value?.bzzr1 ?? null)

    public readonly ipfsURL = computed(() => this.ipfsHash.value ? "https://ipfs.io/ipfs/" + this.ipfsHash.value : null)

    public readonly ipfsMetadata = computed(() => this.ipfsLookup.entity.value as SolcMetadata|null)


    //
    // Private
    //

    private readonly decodedObject = computed(() => {
        let result: DecodedObject|null
        if (this.byteCode.value) {
            try {
                result = decode(this.byteCode.value)
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
