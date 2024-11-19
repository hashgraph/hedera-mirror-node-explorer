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

import {Contract, ContractsResponse} from "@/schemas/MirrorNodeSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";

export class ContractTableController extends TableController<Contract, string> {

    //
    // Public
    //

    public constructor(router: Router, pageSize: Ref<number>) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.SLOW_REFRESH_PERIOD,
            TableController.SLOW_REFRESH_COUNT,
            100
        );
        this.watchAndReload([this.pageSize])
    }

    //
    // TableController
    //

    public async load(contractId: string | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<Contract[] | null> {

        const params = {} as {
            limit: number
            "contract.id": string | undefined
            order: string
        }
        params.limit = limit
        params.order = order
        if (contractId !== null) {
            params["contract.id"] = operator + ":" + contractId
        }
        const cb = (r: AxiosResponse<ContractsResponse>): Promise<Contract[] | null> => {
            return Promise.resolve(r.data.contracts ?? [])
        }

        return axios.get<ContractsResponse>("api/v1/contracts", {params: params}).then(cb)
    }

    public keyFor(row: Contract): string {
        return row.contract_id ?? ""
    }

    public stringFromKey(key: string): string {
        return key;
    }

    public keyFromString(s: string): string | null {
        return s;
    }
}
