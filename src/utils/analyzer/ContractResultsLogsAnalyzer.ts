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

import {Ref, WatchStopHandle, computed, ref, watch} from 'vue';
import {ContractResultsLogResponse} from '@/schemas/HederaSchemas'
import {ContractResultsLogsByContractIdCache} from '../cache/ContractResultsLogsByContractIdCache';

export class ContractResultsLogsAnalyzer {
    public readonly contractId: Ref<string | null>
    private readonly watchHandle: Ref<WatchStopHandle | null> = ref(null)
    private readonly contractResultsLogResponse: Ref<ContractResultsLogResponse | null> = ref(null)

    //
    // Public
    //
    public constructor(contractId: Ref<string | null>) {
        this.contractId = contractId
    }

    public mount(): void {
        this.watchHandle.value = watch(this.contractId, this.updateContractResultsLogs, {immediate: true});
    }

    public unmount(): void {
        if (this.watchHandle.value !== null) {
            this.watchHandle.value()
            this.watchHandle.value = null
        }
        this.contractResultsLogResponse.value = null
    }

    public readonly logs = computed(() => this.contractResultsLogResponse.value?.logs ?? undefined)
    public readonly cursorLinks = computed(() => this.contractResultsLogResponse.value?.links?.next ?? null)

    //
    // Private
    //
    private readonly updateContractResultsLogs = async () => {
        if (this.contractId.value !== null) {
            try {
                this.contractResultsLogResponse.value = await ContractResultsLogsByContractIdCache.instance.lookup(this.contractId.value)
            } catch {
                this.contractResultsLogResponse.value = null
            }
        } else {
            this.contractResultsLogResponse.value = null
        }
    }
}
