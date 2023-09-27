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

import {computed, ref, Ref, WatchStopHandle} from 'vue';
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import {Lookup} from "@/utils/cache/base/EntityCache";
import {IPFSCache} from "@/utils/cache/IPFSCache";
import {SolcUtils} from "@/utils/solc/SolcUtils";
import {SourcifyCache} from "@/utils/cache/SourcifyCache";
import {AppStorage} from "@/AppStorage";
import {ethers} from "ethers";

export class ContractSourceAnalyzer {

    public readonly sourceFileName: string
    public readonly contractAnalyzer: ContractAnalyzer
    public readonly ipfsLookup: Lookup<string, unknown|undefined>
    private readonly localStorageContent: Ref<string|null> = ref(null)
    private watchHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(sourceFileName: string, contractAnalyzer: ContractAnalyzer) {
        this.sourceFileName = sourceFileName
        this.contractAnalyzer = contractAnalyzer
        this.ipfsLookup = IPFSCache.instance.makeLookup(this.ipfsHash)
    }


    public mount(): void {
        this.ipfsLookup.mount()
        this.updateLocalStorageContent()
    }

    public unmount(): void {
        this.ipfsLookup.unmount()
        this.localStorageContent.value = null
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
    }

    //
    // Public (computed)
    //

    public readonly content = computed(
        () => this.sourcifyContent.value ?? this.localStorageContent.value ?? this.ipfsContent.value)

    public readonly fullMatch = computed(() => {
        let result: boolean
        if (this.content.value !== null && this.keccakHash.value !== null) {
            const contentBytes = ethers.utils.toUtf8Bytes(this.content.value)
            const contentHash = ethers.utils.keccak256(contentBytes)
            result = contentHash === this.keccakHash.value
        } else {
            result = false
        }
        return result
    })

    //
    // Public (user actions)
    //

    public userDidSelectContent(content: string): void {
        AppStorage.setSource(content, this.sourceFileName)
        this.updateLocalStorageContent()
    }

    public userRequestClear(): void {
        AppStorage.setSource(null, this.sourceFileName)
        this.updateLocalStorageContent()
    }

    //
    // Private
    //

    private readonly sourcifyContent = computed(() => {
        let result: string|null
        const response = this.contractAnalyzer.sourcifyRecord.value?.response ?? null
        if (response !== null) {
            result = SourcifyCache.fetchSource(this.sourceBaseName(), response)
        } else {
            result = null
        }
        return result
    })

    private readonly ipfsContent = computed(() => {
        let result: string|null
        const content = this.ipfsLookup.entity.value
        if (typeof content == "string") {
            result = content
        } else if (typeof content === "object" && content !== null) {
            result = JSON.stringify(content)
        } else {
            result = null
        }
        return result
    })

    private readonly ipfsHash = computed(() => {
        let result: string|null
        if (this.contractAnalyzer.metadata.value !== null) {
            result = SolcUtils.fetchIPFSHash(this.sourceFileName, this.contractAnalyzer.metadata.value)
        } else {
            result = null
        }
        return result
    })

    private readonly swarmHash = computed(() => {
        let result: string|null
        if (this.contractAnalyzer.metadata.value !== null) {
            result = SolcUtils.fetchSWARMHash(this.sourceFileName, this.contractAnalyzer.metadata.value)
        } else {
            result = null
        }
        return result
    })

    private readonly keccakHash = computed(() => {
        let result: string|null
        if (this.contractAnalyzer.metadata.value !== null) {
            result = SolcUtils.fetchKeccakHash(this.sourceFileName, this.contractAnalyzer.metadata.value)
        } else {
            result = null
        }
        return result
    })

    private readonly updateLocalStorageContent = () => {
        this.localStorageContent.value = AppStorage.getSource(this.sourceFileName)
    }

    private sourceBaseName(): string {
        const i = this.sourceFileName.lastIndexOf("/")
        return i != -1 ? this.sourceFileName.substring(i+1) : this.sourceFileName
    }
}