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

import {AccountInfo, AccountsResponse} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {drainAccounts} from "@/schemas/HederaUtils";
import {Router} from "vue-router";

export class AccountTableController extends TableController<AccountInfo, string> {

    private readonly pubKey: string | null

    //
    // Public
    //

    public constructor(router: Router, pageSize: Ref<number>, pubKey: string | null = null) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.SLOW_REFRESH_PERIOD,
            AccountTableController.SLOW_REFRESH_COUNT,
            100
        )
        this.pubKey = pubKey
        this.watchAndReload([this.pageSize])
    }

    //
    // TableController
    //

    public async load(accountId: string | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<AccountInfo[] | null> {

        const params = {} as {
            limit: number
            "account.id": string | undefined,
            "account.publickey": string | undefined,
            order: string
        }
        params.limit = limit
        params.order = order
        if (accountId !== null) {
            params["account.id"] = operator + ":" + accountId
        }
        if (this.pubKey !== null) {
            params["account.publickey"] = this.pubKey
        }
        const r = await axios.get<AccountsResponse>("api/v1/accounts", {params: params})
        const result = await drainAccounts(r.data, params.limit)

        return Promise.resolve(result)
    }

    public keyFor(row: AccountInfo): string {
        return row.account ?? ""
    }

    public stringFromKey(account: string): string {
        return account
    }

    public keyFromString(s: string): string | null {
        return s
    }
}
