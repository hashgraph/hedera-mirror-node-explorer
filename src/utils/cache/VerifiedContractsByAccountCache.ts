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

import {Contract, ContractsResponse} from "@/schemas/HederaSchemas";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios from "axios";

export class VerifiedContractsBuffer {

    private accountId: string

    public contracts: Contract[] = []

    public constructor(accountId: string) {
        this.accountId = accountId
    }

    public async update(): Promise<void> {
        const params = {
            limit: 5,
            order: 'desc',
        }
        const response = await axios.get<ContractsResponse>("api/v1/contracts", {params: params})
        this.contracts = response.data.contracts ?? []
        console.log(`VerifiedContractsBuffer.update - this.buffer.value: ${this.contracts}`)
    }
}

export class VerifiedContractsByAccountCache extends EntityCache<string, VerifiedContractsBuffer | null> {

    public static readonly instance = new VerifiedContractsByAccountCache()

    protected async load(key: string): Promise<VerifiedContractsBuffer | null> {
        const buffer = new VerifiedContractsBuffer(key)
        await buffer.update()
        return Promise.resolve(buffer)
    }
}
