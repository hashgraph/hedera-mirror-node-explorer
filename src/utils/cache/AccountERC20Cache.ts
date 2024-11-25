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

import {EntityCache} from "@/utils/cache/base/EntityCache";
import {ERC20Cache} from "@/utils/cache/ERC20Cache";
import {ERC20Info, ERC20InfoCache} from "@/utils/cache/ERC20InfoCache.ts";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {ERCUtils} from "@/utils/ERCUtils.ts";

export class AccountERC20Cache extends EntityCache<string, AccountERC20[]> {

    public static readonly instance = new AccountERC20Cache()

    //
    // Public
    //

    public async forgetContract(accountId: string, contractId: string) {
        if (this.contains(accountId)) {
            let newPromise: Promise<AccountERC20[]>
            try {
                const accountAddress = await AccountByIdCache.instance.findAccountAddress(accountId)
                const contractAddress = await ContractByIdCache.instance.findContractAddress(contractId)
                if (accountAddress !== null && contractAddress !== null) {
                    const accountERC20s = await this.lookup(accountId)
                    const newAccountERC20s: AccountERC20[] = []
                    for (const accountERC20 of accountERC20s) {
                        let newAccountERC20: AccountERC20|null
                        if (accountERC20.erc20Info.contractId === contractId) {
                            const newBalance = await ERCUtils.loadBalance(contractAddress, accountAddress)
                            if (newBalance !== null) {
                                newAccountERC20 = { balance: newBalance.toString(), erc20Info: accountERC20.erc20Info}
                            } else {
                                newAccountERC20 = null
                            }
                        } else {
                            newAccountERC20 = accountERC20
                        }
                        if (newAccountERC20 !== null) {
                            newAccountERC20s.push(newAccountERC20)
                        }
                    }
                    newPromise = Promise.resolve(newAccountERC20s)
                } else {
                    newPromise = Promise.resolve([])
                }
            } catch(reason) {
                newPromise = Promise.reject(reason)
            }
            this.mutate(accountId, newPromise)
        }
    }

    //
    // Cache
    //

    protected async load(accountId: string): Promise<AccountERC20[]> {
        const result: AccountERC20[] = []

        const accountAddress = await AccountByIdCache.instance.findAccountAddress(accountId)
        if (accountAddress !== null) {
            const erc20Contracts = await ERC20Cache.instance.lookup()
            for (const c of erc20Contracts) {
                const contractAddress = await ContractByIdCache.instance.findContractAddress(c.contractId)
                if (contractAddress !== null) {
                    const erc20info = await ERC20InfoCache.instance.lookup(c.contractId)
                    const balance = await ERCUtils.loadBalance(contractAddress, accountAddress)
                    if (erc20info !== null && balance !== null && balance > 0) {
                        result.push( { balance: balance.toString(), erc20Info: erc20info })
                    }
                }
            }
        }
        return Promise.resolve(result)
    }

    //
    // Private
    //
}

export interface AccountERC20 {
    balance: string
    erc20Info: ERC20Info
}

