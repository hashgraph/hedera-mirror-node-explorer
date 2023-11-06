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

import {computed, ref, Ref, shallowRef, watch, WatchStopHandle} from 'vue';
import {ByteCodeAnalyzer} from "@/utils/analyzer/ByteCodeAnalyzer";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import {ContractSourceAudit} from "@/utils/analyzer/ContractSourceAudit";
import {HHMetadata} from "@/utils/hardhat/HHMetadata";

export class ContractSourceAnalyzer {

    public readonly byteCodeAnalyzer: ByteCodeAnalyzer
    public readonly inputFiles: Ref<Map<string, string|SolcMetadata|HHMetadata>>

    private readonly analyzingRef = ref(false)
    private readonly auditRef = shallowRef<ContractSourceAudit|null>(null)
    private watchHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(byteCodeAnalyzer: ByteCodeAnalyzer, inputFiles: Ref<Map<string, string|SolcMetadata|HHMetadata>>) {
        this.byteCodeAnalyzer = byteCodeAnalyzer
        this.inputFiles = inputFiles
    }


    public mount(): void {
        this.watchHandle = watch([
            this.inputFiles,
            this.byteCodeAnalyzer.byteCode,
            this.byteCodeAnalyzer.solcVersion], this.updateAudit)
    }

    public unmount(): void {
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
        this.auditRef.value = null
    }

    //
    // Public (computed)
    //

    public readonly analyzing = computed( () => this.analyzingRef.value)

    public readonly audit = computed(() => this.auditRef.value)

    //
    // Private
    //

    private readonly updateAudit = async () => {
        const solcVersion = this.byteCodeAnalyzer.solcVersion.value
        const byteCode = this.byteCodeAnalyzer.byteCode.value
        if (solcVersion !== null && byteCode !== null) {
            this.analyzingRef.value = true
            try {
                this.auditRef.value = await ContractSourceAudit.build(this.inputFiles.value, solcVersion, byteCode)
            } finally {
                this.analyzingRef.value = false
            }
        } else {
            this.auditRef.value = null
        }
    }

}

