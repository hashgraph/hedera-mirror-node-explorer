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
import {AccountInfo, AccountsResponse} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";

const DESCENDING = 'desc'

export class AccountTableController extends TableController<AccountInfo, string> {

    //
    // Public
    //

    public constructor(pageSize: Ref<number>) {
        super(pageSize, 10 * pageSize.value, 5000, 10, 100);
    }

    //
    // TableController
    //

    public async loadAfter(accountId: string | null, limit: number): Promise<AccountInfo[] | null> {
        return this.load(accountId, "lt", limit)
    }

    public async loadBefore(accountId: string, limit: number): Promise<AccountInfo[] | null> {
        return this.load(accountId, "gte", limit)
    }

    public keyFor(row: AccountInfo): string {
        return row.account ?? ""
    }

    //
    // Private
    //

    private load(accountId: string | null, operator: string, limit: number): Promise<AccountInfo[] | null> {
        let result: Promise<AccountInfo[] | null>

        const params = {} as {
            limit: number
            "account.id": string | undefined
            order: string
        }
        params.limit = limit
        params.order = DESCENDING
        if (accountId !== null) {
            params["account.id"] = operator + ":" + accountId
        }
        const cb = (r: AxiosResponse<AccountsResponse>): Promise<AccountInfo[] | null> => {
            return Promise.resolve(r.data.accounts ?? [])
        }
        result = axios.get<AccountsResponse>("api/v1/accounts", {params: params}).then(cb)

        return result
    }
}
