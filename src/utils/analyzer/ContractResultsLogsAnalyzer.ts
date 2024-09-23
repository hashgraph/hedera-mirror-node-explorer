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

import {computed, Ref} from 'vue';
import {ContractLog} from '@/schemas/HederaSchemas'
import {ContractResultsLogsByContractIdCache} from '../cache/ContractResultsLogsByContractIdCache';
import {EntityLookup} from "@/utils/cache/base/EntityCache";

export class ContractResultsLogsAnalyzer {
    public readonly contractId: Ref<string | null>
    public readonly contractResultsLookup: EntityLookup<string, ContractLog[]|null>

    //
    // Public
    //
    public constructor(contractId: Ref<string | null>) {
        this.contractId = contractId
        this.contractResultsLookup = ContractResultsLogsByContractIdCache.instance.makeLookup(this.contractId)
    }

    public mount(): void {
        this.contractResultsLookup.mount()
    }

    public unmount(): void {
        this.contractResultsLookup.unmount()
    }

    public readonly logs = computed(() => this.contractResultsLookup.entity.value ?? undefined)
}
