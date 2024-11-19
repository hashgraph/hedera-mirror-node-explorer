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

import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {ContractResult, ContractResultsResponse} from "@/schemas/MirrorNodeSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {Router} from "vue-router";

export class ContractResultTableController extends TableController<ContractResult, string> {

    private readonly contractId: Ref<string | null>

    //
    // Public
    //

    public constructor(router: Router,
                       contractId: Ref<string | null>,
                       pageSize: Ref<number>,
                       pageParamName = "p", keyParamName = "k") {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.SLOW_REFRESH_PERIOD,
            TableController.SLOW_REFRESH_COUNT,
            100,
            pageParamName,
            keyParamName
        );
        this.contractId = contractId
        this.watchAndReload([this.contractId, this.pageSize])
    }

    //
    // TableController
    //

    public async load(consensusTimestamp: string | null, operator: KeyOperator,
                      order: SortOrder, limit: number): Promise<ContractResult[] | null> {
        let result: Promise<ContractResult[] | null>

        if (this.contractId.value === null) {
            result = Promise.resolve(null)
        } else {
            const params = {} as {
                limit: number
                order: string
                timestamp: string | undefined
            }
            params.limit = limit
            params.order = order
            if (consensusTimestamp !== null) {
                params.timestamp = operator + ":" + consensusTimestamp
            }
            const cb = (r: AxiosResponse<ContractResultsResponse>): Promise<ContractResult[] | null> => {
                return Promise.resolve(r.data.results ?? [])
            }
            result = axios.get<ContractResultsResponse>(
                "api/v1/contracts/" + this.contractId.value + "/results", {params: params})
                .then(cb)
        }

        return result
    }

    public keyFor(row: ContractResult): string {
        return row.timestamp ?? ""
    }

    public keyFromString(s: string): string | null {
        return s
    }

    public stringFromKey(key: string): string {
        return key
    }

}
