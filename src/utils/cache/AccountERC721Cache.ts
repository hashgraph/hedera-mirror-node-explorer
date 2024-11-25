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
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache.ts";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache.ts";
import {ERCUtils} from "@/utils/ERCUtils.ts";
import {ERC721Info, ERC721InfoCache} from "@/utils/cache/ERC721InfoCache.ts";
import {ERC721Cache} from "@/utils/cache/ERC721Cache.ts";

export class AccountERC721Cache extends EntityCache<string, AccountERC721[]> {

    public static readonly instance = new AccountERC721Cache()

    //
    // Public
    //

    public async forgetContract(accountId: string, contractId: string) {
        if (this.contains(accountId)) {
            let newPromise: Promise<AccountERC721[]>
            try {
                const accountAddress = await AccountByIdCache.instance.findAccountAddress(accountId)
                const contractAddress = await ContractByIdCache.instance.findContractAddress(contractId)
                if (accountAddress !== null && contractAddress !== null) {
                    const accountERC721s = await this.lookup(accountId)
                    const newAccountERC721s: AccountERC721[] = []
                    for (const accountERC721 of accountERC721s) {
                        let newAccountERC721: AccountERC721|null
                        if (accountERC721.erc721Info.contractId === contractId) {
                            const newBalance = await ERCUtils.loadBalance(contractAddress, accountAddress)
                            if (newBalance !== null) {
                                newAccountERC721 = { balance: newBalance.toString(), erc721Info: accountERC721.erc721Info}
                            } else {
                                newAccountERC721 = null
                            }
                        } else {
                            newAccountERC721 = accountERC721
                        }
                        if (newAccountERC721 !== null) {
                            newAccountERC721s.push(newAccountERC721)
                        }
                    }
                    newPromise = Promise.resolve(newAccountERC721s)
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

    protected async load(accountId: string): Promise<AccountERC721[]> {
        const result: AccountERC721[] = []

        const accountAddress = await AccountByIdCache.instance.findAccountAddress(accountId)
        if (accountAddress !== null) {
            const erc721Contracts = await ERC721Cache.instance.lookup()
            for (const c of erc721Contracts) {
                const contractAddress = await ContractByIdCache.instance.findContractAddress(c.contractId)
                if (contractAddress !== null) {
                    const info = await ERC721InfoCache.instance.lookup(c.contractId)
                    const balance = await ERCUtils.loadBalance(contractAddress, accountAddress)
                    if (info !== null && balance !== null && balance > 0) {
                        result.push( { balance: balance.toString(), erc721Info: info })
                    }
                }
            }
        }
        return Promise.resolve(result)
    }
}

export interface AccountERC721 {
    balance: string
    erc721Info: ERC721Info
}

