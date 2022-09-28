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

import {AccountInfo, AccountsResponse} from "@/schemas/HederaSchemas";
import {ComputedRef} from "vue";
import axios, {AxiosResponse} from "axios";
import {KeyOperator, SortOrder, TableControllerV3} from "@/utils/table/TableControllerV3";
import {Router} from "vue-router";

export class AccountTableController extends TableControllerV3<AccountInfo, string> {

    //
    // Public
    //

    public constructor(router: Router, pageSize: ComputedRef<number>) {
        super(router, pageSize, 10 * pageSize.value, 5000, 10, 100);
    }

    //
    // TableController
    //

    public async load(accountId: string | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<AccountInfo[] | null> {

        const params = {} as {
            limit: number
            "account.id": string | undefined
            order: string
        }
        params.limit = limit
        params.order = order
        if (accountId !== null) {
            params["account.id"] = operator + ":" + accountId
        }
        const cb = (r: AxiosResponse<AccountsResponse>): Promise<AccountInfo[] | null> => {
            return Promise.resolve(r.data.accounts ?? [])
        }

        return  axios.get<AccountsResponse>("api/v1/accounts", {params: params}).then(cb)
    }

    public keyFor(row: AccountInfo): string {
        return row.account ?? ""
    }

    public stringFromKey(account: string): string {
        return account
    }

    public keyFromString(s: string): string|null {
        return s
    }
}
