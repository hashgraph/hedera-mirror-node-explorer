/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

import {TableController} from "@/utils/table/TableController";
import {Contract, ContractsResponse} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";

export class ContractTableController extends TableController<Contract, string> {

    //
    // Public
    //

    public constructor(pageSize: Ref<number>) {
        super(pageSize, 10 * pageSize.value, 5000, 10, 100);
    }

    //
    // TableController
    //

    public async loadAfter(contractId: string | null, limit: number): Promise<Contract[] | null> {
        return this.load(contractId, "lt", limit)
    }

    public async loadBefore(contractId: string, limit: number): Promise<Contract[] | null> {
        return this.load(contractId, "gte", limit)
    }

    public keyFor(row: Contract): string {
        return row.contract_id ?? ""
    }

    //
    // Private
    //

    private load(contractId: string | null, operator: string, limit: number): Promise<Contract[] | null> {

        const params = {} as {
            limit: number
            "contract.id": string | undefined
            order: string
        }
        params.limit = limit
        params.order = 'desc'
        if (contractId !== null) {
            params["contract.id"] = operator + ":" + contractId
        }
        const cb = (r: AxiosResponse<ContractsResponse>): Promise<Contract[] | null> => {
            return Promise.resolve(r.data.contracts ?? [])
        }

        return  axios.get<ContractsResponse>("api/v1/contracts", {params: params}).then(cb)
    }
}
