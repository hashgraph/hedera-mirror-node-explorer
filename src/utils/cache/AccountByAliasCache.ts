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

import {AccountBalanceTransactions} from "@/schemas/HederaSchemas";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios from "axios";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";

export class AccountByAliasCache extends EntityCache<string, AccountBalanceTransactions|null> {

    public static readonly instance = new AccountByAliasCache()

    //
    // Public
    //

    public updateWithAccountInfo(accountInfo: AccountBalanceTransactions): void {
        if (accountInfo.account) {
            this.forget(accountInfo.account)
            this.promises.set(accountInfo.account, Promise.resolve(accountInfo))
        }
    }

    //
    // Cache
    //

    protected async load(alias: string): Promise<AccountBalanceTransactions | null> {
        let result: Promise<AccountBalanceTransactions|null>
        try {
            const response = await axios.get<AccountBalanceTransactions>("api/v1/accounts/" + alias)
            result = Promise.resolve(response.data)
            AccountByIdCache.instance.updateWithAccountInfo(response.data)
            AccountByAddressCache.instance.updateWithAccountInfo(response.data)
        } catch(error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = Promise.resolve(null)
            } else {
                throw error
            }
        }
        return result
    }
}
