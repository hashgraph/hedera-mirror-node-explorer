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

import axios from 'axios';
import {EntityCache} from './base/EntityCache';
import {ContractLog} from '@/schemas/HederaSchemas';
import {drainContractResultsLogs} from "@/schemas/HederaUtils";

export class ContractResultsLogsByContractIdCache extends EntityCache<string, ContractLog[] | null> {

    public static readonly instance = new ContractResultsLogsByContractIdCache()

    //
    // Cache
    //
    protected async load(contractId: string): Promise<ContractLog[] | null> {
        let result: ContractLog[] | null
        const params = {
            limit: 100,
            order: "desc",
        }

        try {
            const response = await axios.get(`api/v1/contracts/${contractId}/results/logs`, {params});
            result = await drainContractResultsLogs(response.data, params.limit)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = null
            } else {
                throw error
            }
        }

        return result
    }
}
