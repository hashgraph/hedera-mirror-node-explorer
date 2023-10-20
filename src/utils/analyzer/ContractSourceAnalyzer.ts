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

import {computed, ref, Ref, watch, WatchStopHandle} from 'vue';
import {ByteCodeAnalyzer} from "@/utils/analyzer/ByteCodeAnalyzer";
import {ContractRecord, SolcUtils} from "@/utils/solc/SolcUtils";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import {SolcInput} from "@/utils/solc/SolcInput";
import {SolcIndexCache} from "@/utils/cache/SolcIndexCache";

export class ContractSourceAnalyzer {

    public readonly byteCodeAnalyzer: ByteCodeAnalyzer
    public readonly inputFiles: Ref<Map<string, string|SolcMetadata>>

    private readonly analyzingRef = ref(false)
    private readonly contractRecordRef = ref<ContractRecord|null>(null)
    private readonly longCompilerVersionRef = ref<string|null>(null)
    private watchHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(byteCodeAnalyzer: ByteCodeAnalyzer, inputFiles: Ref<Map<string, string|SolcMetadata>>) {
        this.byteCodeAnalyzer = byteCodeAnalyzer
        this.inputFiles = inputFiles
    }


    public mount(): void {
        this.watchHandle = watch([
            this.solcInput,
            this.byteCodeAnalyzer.byteCode,
            this.byteCodeAnalyzer.solcVersion], this.updateContractRecord)
    }

    public unmount(): void {
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
        this.contractRecordRef.value = null
    }

    //
    // Public (computed)
    //

    public readonly analyzing = computed(
        () => this.analyzingRef.value)

    public readonly longCompilerVersion = computed(
        () => this.longCompilerVersionRef.value)

    public readonly contractRecord = computed(
        () =>  this.contractRecordRef.value)

    public readonly sourceFiles = computed(() => {
        return new Map<string, string>()
    })

    public readonly resolvedMetadataFile = computed(() => {
        let result: [string, SolcMetadata]|null = null

        if (this.contractRecord.value !== null) {
            for (const [f, m] of this.metadataFiles.value.entries()) {
                if (this.contractRecord.value.sourceFileName in m.sources) {
                    result = [f, m]
                    break
                }
            }
        }

        return result
    })

    public readonly solcInput = computed(() => {
        let result: SolcInput|null
        if (this.inputFiles.value.size >= 1) {
            result = {
                language: "Solidity",
                sources: {},
                settings: {
                    outputSelection: {
                        '*': {
                            '*': [ "metadata", "evm.deployedBytecode.object" ],
                        },
                    },
                },
            }
            for (const [path, content] of this.inputFiles.value) {
                if (typeof content == "string") {
                    result.sources[path] = { content: content }
                }
            }
        } else {
            result = null
        }
        return result
    })


    //
    // Private
    //

    private readonly updateContractRecord = async () => {
        const solcInput = this.solcInput.value
        const byteCode = this.byteCodeAnalyzer.byteCode.value
        const shortCompilerVersion = this.byteCodeAnalyzer.solcVersion.value
        if (solcInput !== null && shortCompilerVersion !== null && byteCode !== null) {
            this.analyzingRef.value = true
            try {
                const longCompilerVersion = await SolcIndexCache.instance.fetchLongVersion(shortCompilerVersion)
                if (longCompilerVersion !== null) {
                    const sourcifyCompilerVersion = "v" + longCompilerVersion
                    const solcOutput = await SolcUtils.runAsWorker(sourcifyCompilerVersion, solcInput)
                    this.contractRecordRef.value = SolcUtils.findMatchingContract(byteCode, solcOutput)
                    this.longCompilerVersionRef.value = longCompilerVersion
                } else {
                    this.contractRecordRef.value = null
                    this.longCompilerVersionRef.value = null
                }
            } finally {
                this.analyzingRef.value = false
            }
        } else {
            this.contractRecordRef.value = null
            this.longCompilerVersionRef.value = null
        }
    }


    private readonly metadataFiles = computed<Map<string, SolcMetadata>>(() => {
        let result = new Map<string, SolcMetadata>()
        for (const [fileName, content] of this.inputFiles.value) {
            if (typeof content == "object") {
                result.set(fileName, content)
            }
        }
        return result
    })

}