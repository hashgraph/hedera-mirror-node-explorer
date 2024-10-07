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

import {computed, ComputedRef, ref, Ref, watch, WatchStopHandle} from "vue";
import {SystemContractEntry, systemContractRegistry} from "@/schemas/SystemContractRegistry";
import {ethers} from "ethers";
import {AssetCache} from "@/utils/cache/AssetCache";
import {SourcifyCache, SourcifyRecord, SourcifyResponseItem} from "@/utils/cache/SourcifyCache";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import {ByteCodeAnalyzer} from "@/utils/analyzer/ByteCodeAnalyzer";
import {ContractResponse, TokenInfo, TokenType} from "@/schemas/HederaSchemas";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {EntityID} from "@/utils/EntityID";

export class ContractAnalyzer {

    public readonly contractId: Ref<string | null>
    public readonly byteCodeAnalyzer: ByteCodeAnalyzer
    private readonly contractResponse: Ref<ContractResponse | null> = ref(null)
    public readonly tokenInfo: Ref<TokenInfo|null> = ref(null)
    public readonly systemContractEntry: Ref<SystemContractEntry | null> = ref(null)
    public readonly sourcifyRecord: Ref<SourcifyRecord | null> = ref(null)
    private readonly abi: Ref<ethers.Fragment[] | null> = ref(null)


    private watchHandles: WatchStopHandle[] = []

    //
    // Public
    //

    public constructor(contractId: Ref<string | null>) {
        this.contractId = contractId
        this.byteCodeAnalyzer = new ByteCodeAnalyzer(this.byteCode)
    }

    public mount(): void {
        this.watchHandles = [
            watch(this.contractId, this.contractIdDidChange, {immediate: true}),
            watch(this.contractResponse, this.contractResponseDidChange, {immediate: true}),
            watch([this.systemContractEntry, this.metadata, this.tokenInfo], this.updateABI, {immediate: true}),
        ]
    }

    public unmount(): void {
        for (const wh of this.watchHandles) wh()
        this.watchHandles = []
        this.contractResponse.value = null
        this.tokenInfo.value = null
        this.systemContractEntry.value = null
        this.sourcifyRecord.value = null
        this.abi.value = null
    }

    public readonly contractAddress: ComputedRef<string | null> = computed(() => {
        let result: string|null
        if (this.contractResponse.value !== null) {
            result = this.contractResponse.value.evm_address ?? null
        } else if (this.tokenInfo.value !== null) {
            const tokenId = this.tokenInfo.value.token_id
            const eid = tokenId ? EntityID.parse(tokenId) : null
            result = eid?.toAddress() ?? null
        } else {
            result = null
        }
        return result
    })

    public readonly globalState = computed<GlobalState | null>(() => {
        let result: GlobalState | null
        if (this.contractId.value !== null) {
            if (this.sourcifyRecord.value !== null) {
                result = this.sourcifyRecord.value.fullMatch ? GlobalState.FullMatch : GlobalState.PartialMatch
            } else {
                result = GlobalState.Unverified
            }
        } else {
            result = null
        }
        return result
    })

    public readonly metadata: ComputedRef<SolcMetadata | null> = computed(() => {
        let result: SolcMetadata | null
        if (this.sourcifyRecord.value !== null) {
            result = SourcifyCache.fetchMetadata(this.sourcifyRecord.value.response)
        } else {
            result = null
        }
        return result
    })

    public readonly interface: ComputedRef<ethers.Interface | null> = computed(() => {
        let result: ethers.Interface | null
        if (this.abi.value !== null) {
            try {
                const i = new ethers.Interface(this.abi.value)
                result = Object.preventExtensions(i)
            } catch {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

    public readonly sourceFileName: ComputedRef<string | null> = computed(() => {
        let result: string | null
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

    public readonly contractFileName = computed(() => {
        return this.sourceFileName.value?.substring(this.sourceFileName.value?.lastIndexOf('/') + 1)
    })

    public readonly contractName: ComputedRef<string | null> = computed(() => {
        let result: string | null
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

    public readonly solidityFiles = computed(() => {
        const result: Array<SourcifyResponseItem> = []
        if (this.sourcifyRecord.value !== null && this.sourcifyRecord.value?.response.files.length > 0) {
            const files = this.sourcifyRecord.value?.response.files
            files?.forEach((f) => {
                const parts = f.name.split('.')
                const suffix = parts[parts.length - 1].toLowerCase()
                if (suffix === "sol") {
                    result.push(f)
                }
            })
        }
        return result
    })

    public readonly sourceFiles = computed(
        () => this.sourcifyRecord.value?.response.files ?? [])

    //
    // public readonly sourceFileNames: ComputedRef<string[]> = computed(() => {
    //     let result: string[]
    //     if (this.systemContractEntry.value !== null) {
    //         result = []
    //     } else if (this.metadata.value !== null) {
    //         const sources = this.metadata.value.sources
    //         result = Object.keys(sources).sort()
    //     } else {
    //         result = []
    //     }
    //     return result
    // })

    //
    // Public (null if contractId is a system contract or a token)
    //

    public readonly byteCode: ComputedRef<string | null> = computed(() => {
        return this.contractResponse.value?.runtime_bytecode ?? null
    })

    //
    // Public (null if contractId is not on Sourcify)
    //

    public readonly fullMatch: ComputedRef<boolean | null> = computed(
        () => this.sourcifyRecord.value?.fullMatch ?? null)

    public readonly sourcifyURL: ComputedRef<string | null> = computed(
        () => this.sourcifyRecord.value?.folderURL ?? null)


    //
    // Public (user actions)
    //

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
                this.tokenInfo.value = null
            } else {
                this.systemContractEntry.value = null
                try {
                    this.contractResponse.value = await ContractByIdCache.instance.lookup(this.contractId.value)
                    if (this.contractResponse.value !== null) {
                        this.tokenInfo.value = null
                    } else {
                        this.tokenInfo.value = await TokenInfoCache.instance.lookup(this.contractId.value)
                    }
                } catch {
                    this.contractResponse.value = null
                    this.tokenInfo.value = null
                }
            }
        } else {
            this.systemContractEntry.value = null
            this.contractResponse.value = null
            this.tokenInfo.value = null
        }
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
                const asset = await AssetCache.instance.lookup(abiURL) as { abi: ethers.Fragment[] }
                this.abi.value = asset.abi
            } catch {
                this.abi.value = null
            }
        } else if (this.metadata.value !== null) {
            this.abi.value = this.metadata.value.output.abi as ethers.Fragment[] | null
        } else if (this.tokenInfo.value !== null) {
            let abiName: string|null
            switch(this.tokenInfo.value.type) {
                case TokenType.FUNGIBLE_COMMON:
                    abiName = "IERC20+IHRC"
                    break
                case TokenType.NON_FUNGIBLE_UNIQUE:
                    abiName = "IERC721+IHRC"
                    break
                default:
                    abiName = null
                    break
            }
            const abiURL = window.location.origin + "/abi/" + abiName + ".json"
            this.abi.value = await AssetCache.instance.lookup(abiURL) as ethers.Fragment[]
        } else {
            this.abi.value = null
        }
    }
}

export enum GlobalState {
    FullMatch, // Fully verified on sourcify
    PartialMatch, // Partially verified on sourcify
    Unverified // Unverified
}
