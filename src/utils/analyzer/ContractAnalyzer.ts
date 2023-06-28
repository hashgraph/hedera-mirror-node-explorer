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

import {computed, ComputedRef, ref, Ref, watch, WatchStopHandle} from "vue";
import {SystemContractEntry, systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {ethers} from "ethers";
import {AssetCache} from "@/utils/cache/AssetCache";
import {SourcifyCache, SourcifyRecord} from "@/utils/cache/SourcifyCache";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import {ByteCodeAnalyzer} from "@/utils/analyzer/ByteCodeAnalyzer";
import {ContractSourceAnalyzer} from "@/utils/analyzer/ContractSourceAnalyzer";
import {ContractResponse} from "@/schemas/HederaSchemas";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {AppStorage} from "@/AppStorage";

export class ContractAnalyzer {

    public readonly contractId: Ref<string|null>
    private readonly byteCodeAnalyzer: ByteCodeAnalyzer
    private readonly contractResponse: Ref<ContractResponse|null> = ref(null)
    private readonly systemContractEntry: Ref<SystemContractEntry|null> = ref(null)
    private readonly localStorageMetadata: Ref<SolcMetadata|null> = ref(null)
    public readonly sourcifyRecord: Ref<SourcifyRecord|null> = ref(null)
    public readonly missingSourceCount = ref<number>(0)
    private readonly abi: Ref<ethers.utils.Fragment[]|null> = ref(null)


    private watchHandles: WatchStopHandle[] = []

    //
    // Public
    //

    public constructor(contractId: Ref<string|null>) {
        this.contractId = contractId
        this.byteCodeAnalyzer = new ByteCodeAnalyzer(this.byteCode)
    }

    public mount(): void {
        this.byteCodeAnalyzer.mount()
        this.watchHandles = [
            watch(this.contractId, this.contractIdDidChange, { immediate: true}),
            watch(this.contractResponse, this.contractResponseDidChange, { immediate: true}),
            watch([this.systemContractEntry, this.metadata], this.updateABI, { immediate: true}),
            watch([this.metadata, this.sourceAnalyzers], this.updateMissingSourceCount, { immediate: true, deep: true}),
        ]
    }

    public unmount(): void {
        this.byteCodeAnalyzer.unmount()
        for (const wh of this.watchHandles) wh()
        this.watchHandles = []
        this.contractResponse.value = null
        this.systemContractEntry.value = null
        this.sourcifyRecord.value = null
        this.abi.value = null
    }

    public readonly globalState = computed<GlobalState|null>(() => {
        let result: GlobalState|null
        if (this.contractId.value !== null) {
            if (this.sourcifyRecord.value !== null) {
                result = this.sourcifyRecord.value.fullMatch ? GlobalState.FullMatch : GlobalState.PartialMatch
            } else if (this.metadata.value !== null) {
                result = this.missingSourceCount.value >= 1 ? GlobalState.MissingSources : GlobalState.ReadyToVerifiy
            } else {
                result = GlobalState.Unknown
            }
        } else {
            result = null
        }
        return result
    })

    public readonly metadata: ComputedRef<SolcMetadata|null> = computed(() => {
        let result: SolcMetadata|null
        if (this.sourcifyRecord.value !== null) {
            result = SourcifyCache.fetchMetadata(this.sourcifyRecord.value.response)
        } else if (this.localStorageMetadata.value !== null) {
            result = this.localStorageMetadata.value
        } else if (this.byteCodeAnalyzer.ipfsMetadata.value !== null) {
            result = this.byteCodeAnalyzer.ipfsMetadata.value
        } else {
            result = null
        }
        return result
    })

    public readonly metadataOrigin: ComputedRef<MetadataOrigin|null> = computed(() => {
        let result: MetadataOrigin|null
        if (this.systemContractEntry.value !== null) {
            result = MetadataOrigin.System
        } else if (this.sourcifyRecord.value !== null) {
            result = MetadataOrigin.Sourcify
        } else if (this.localStorageMetadata.value !== null) {
            result = MetadataOrigin.LocalStorage
        } else if (this.byteCodeAnalyzer.ipfsMetadata.value !==  null) {
            result = MetadataOrigin.IPFS
        } else {
            result = null
        }
        return result
    })

    public readonly isUnknownContract = computed(
        () => this.metadataOrigin.value === null)
    public readonly isSystemContract = computed(
        () => this.metadataOrigin.value === MetadataOrigin.System)
    public readonly isContractOnSourcify = computed(
        () => this.metadataOrigin.value === MetadataOrigin.Sourcify)
    public readonly isContractOnIPFS = computed(
        () => this.metadataOrigin.value === MetadataOrigin.IPFS)
    public readonly isContractOnLocalStorage = computed(
        () => this.metadataOrigin.value === MetadataOrigin.LocalStorage)

    public readonly interface: ComputedRef<ethers.utils.Interface|null> = computed(() => {
        let result: ethers.utils.Interface|null
        if (this.abi.value !== null) {
            try {
                const i = new ethers.utils.Interface(this.abi.value)
                result = Object.preventExtensions(i)
            } catch {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

    public readonly sourceFileName: ComputedRef<string|null> = computed(() => {
        let result: string|null
        if (this.systemContractEntry.value !== null) {
            result = this.systemContractEntry.value.abiFileName
        } else if (this.metadata.value !== null) {
            const target = this.metadata.value.settings.compilationTarget
            const keys = Object.keys(target)
            result = keys.length >= 1 ? keys[0] : null
        } else {
            result = null
        }
        return result
    })

    public readonly contractName: ComputedRef<string|null> = computed(() => {
        let result: string|null
        if (this.systemContractEntry.value !== null) {
            result = null
        } else if (this.metadata.value !== null) {
            const target = this.metadata.value.settings.compilationTarget
            const keys = Object.keys(target)
            result = keys.length >= 1 ? target[keys[0]] : null
        } else {
            result = null
        }
        return result
    })

    public readonly sourceFileNames: ComputedRef<string[]> = computed(() => {
        let result: string[]
        if (this.systemContractEntry.value !== null) {
            result = []
        } else if (this.metadata.value !== null) {
            const sources = this.metadata.value.sources
            result = Object.keys(sources)
        } else {
            result = []
        }
        return result
    })

    public readonly sourceContents: ComputedRef<Record<string, string>> = computed(() => {
        const result: Record<string, string> = {}
        for (const f of this.sourceAnalyzers.value) {
            if (f.content.value !== null) {
                result[f.sourceFileName] = f.content.value
            }
        }
        return result
    })

    public readonly sourceAnalyzers: ComputedRef<ContractSourceAnalyzer[]> = computed(() => {
        const result: ContractSourceAnalyzer[] = []
        for (const f of this.sourceFileNames.value) {
            result.push(new ContractSourceAnalyzer(f, this))
        }
        return result
    })

    //
    // Public (null if contractId is a system contract)
    //

    public readonly byteCode: ComputedRef<string|null> = computed(() => {
        return this.contractResponse.value?.runtime_bytecode ?? null
    })

    //
    // Public (null if contractId is not on Sourcify)
    //

    public readonly fullMatch: ComputedRef<boolean|null> = computed(
        () => this.sourcifyRecord.value?.fullMatch ?? null)

    public readonly sourcifyURL: ComputedRef<string|null> = computed(
        () => this.sourcifyRecord.value?.folderURL ?? null)


    //
    // Public (user actions)
    //

    public userDidSelectMetadata(metadata: SolcMetadata): void {
        if (this.contractId.value !== null) {
            AppStorage.setMetadata(metadata, this.contractId.value)
            this.updateLocalStorageMetadata()
        }
        // else should not happen
    }

    public userRequestClearMetadata(): void {
        if (this.contractId.value !== null) {
            AppStorage.setMetadata(null, this.contractId.value)
            this.updateLocalStorageMetadata()
        }
        // else should not happen
    }

    public verifyDidComplete(): void {
        if (this.contractId.value !== null) {
            SourcifyCache.instance.forget(this.contractId.value)
            this.contractResponseDidChange().finally()
        }
    }

    //
    // Private
    //

    private readonly contractIdDidChange = async () => {
        if (this.contractId.value !== null) {
            const e = systemContractRegistry.lookup(this.contractId.value)
            if (e !== null) {
                this.systemContractEntry.value = e
                this.contractResponse.value = null
            } else {
                this.systemContractEntry.value = null
                try {
                    this.contractResponse.value = await ContractByIdCache.instance.lookup(this.contractId.value)
                } catch {
                    this.contractResponse.value = null
                }
            }
        } else {
            this.systemContractEntry.value = null
            this.contractResponse.value = null
        }
        this.updateLocalStorageMetadata()
    }

    private contractResponseDidChange = async () => {
        if (this.contractResponse.value?.contract_id) {
            try {
                this.sourcifyRecord.value = await SourcifyCache.instance.lookup(this.contractResponse.value?.contract_id)
            } catch {
                this.sourcifyRecord.value = null
            }
        } else {
            this.sourcifyRecord.value = null
        }
    }

    private updateABI = async () => {
        if (this.systemContractEntry.value !== null) {
            try {
                const abiURL = this.systemContractEntry.value?.abiURL
                const asset = await AssetCache.instance.lookup(abiURL) as { abi: ethers.utils.Fragment[]}
                this.abi.value = asset.abi
            } catch {
                this.abi.value = null
            }
        } else if (this.metadata.value !== null) {
            this.abi.value = this.metadata.value.output.abi as ethers.utils.Fragment[]|null
        } else {
            this.abi.value = null
        }
    }

    private readonly updateMissingSourceCount = () => {
        if (this.metadata.value !== null) {
            let newValue = 0
            for (const a of this.sourceAnalyzers.value) {
                if (a.content.value === null) {
                    newValue += 1
                }
            }
            this.missingSourceCount.value = newValue
        } else {
            this.missingSourceCount.value = 0
        }
    }

    private updateLocalStorageMetadata(): void {
        this.localStorageMetadata.value = this.contractId.value != null ? AppStorage.getMetadata(this.contractId.value) : null
    }
 }

export enum MetadataOrigin {
    System = "System",
    Sourcify = "Sourcify",
    IPFS = "IPFS",
    LocalStorage = "Local Storage",
}

export enum GlobalState {
    Unknown, // Metadata file is missing
    MissingSources, // Metadata file is available but some/all sources are missing
    ReadyToVerifiy, // Metadata file and sources are available but are not verified
    FullMatch, // Fully verified on sourcify
    PartialMatch, // Partially verified on sourcify
}