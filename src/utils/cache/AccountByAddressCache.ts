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
import {makeEthAddressForAccount} from "@/schemas/HederaUtils";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {AccountByAliasCache} from "@/utils/cache/AccountByAliasCache";

export class AccountByAddressCache extends EntityCache<string, AccountBalanceTransactions|null> {

    public static readonly instance = new AccountByAddressCache()

    //
    // Public
    //

    public updateWithAccountInfo(accountInfo: AccountBalanceTransactions): void {
        const address = makeEthAddressForAccount(accountInfo)
        if (address) {
            this.forget(address)
            this.promises.set(address, Promise.resolve(accountInfo))
        }
    }

    //
    // Cache
    //

    protected async load(accountAddress: string): Promise<AccountBalanceTransactions | null> {
        let result: Promise<AccountBalanceTransactions|null>
        try {
            const response = await axios.get<AccountBalanceTransactions>("api/v1/accounts/" + accountAddress)
            result = Promise.resolve(response.data)
            AccountByIdCache.instance.updateWithAccountInfo(response.data)
            AccountByAliasCache.instance.updateWithAccountInfo(response.data)
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
