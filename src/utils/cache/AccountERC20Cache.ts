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

import {ContractCallRequest, ContractCallResponse} from "@/schemas/MirrorNodeSchemas.ts";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios from "axios";
import {ERC20Cache} from "@/utils/cache/ERC20Cache";
import {ERC20Info, ERC20InfoCache} from "@/utils/cache/ERC20InfoCache.ts";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {ethers} from "ethers";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";

export class AccountERC20Cache extends EntityCache<string, AccountERC20[]> {

    public static readonly instance = new AccountERC20Cache()

    //
    // Public
    //

    public async forgetContract(accountId: string, contractId: string) {
        if (this.contains(accountId)) {
            let newPromise: Promise<AccountERC20[]>
            try {
                const accountERC20s = await this.lookup(accountId)
                const newAccountERC20s: AccountERC20[] = []
                for (const accountERC20 of accountERC20s) {
                    let newAccountERC20: AccountERC20
                    if (accountERC20.erc20Info.contractId === contractId) {
                        const newBalance = await this.getBalance(contractId, accountId)
                        newAccountERC20 = { balance: newBalance.toString(), erc20Info: accountERC20.erc20Info}
                    } else {
                        newAccountERC20 = accountERC20
                    }
                    newAccountERC20s.push(newAccountERC20)
                }
                newPromise = Promise.resolve(newAccountERC20s)
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
        let result: AccountERC20[] = []

        const erc20Contracts = await ERC20Cache.instance.lookup()
        for (const c of erc20Contracts) {
            const erc20info = await ERC20InfoCache.instance.lookup(c.contractId)
            const balance = await this.getBalance(c.contractId, accountId)
            if (erc20info !== null && balance > 0) {
                result.push( { balance: balance.toString(), erc20Info: erc20info })
            }
        }
        return Promise.resolve(result)
    }

    //
    // Private
    //

    private async getBalance(contractId: string, accountId: string): Promise<bigint> {
        const contractAddress = await ContractByIdCache.instance.findContractAddress(contractId) ?? contractId
        const accountAddress = await AccountByIdCache.instance.findAccountAddress(accountId) ?? accountId
        const abi = [
            "function balanceOf(address owner) view returns (uint256)",
        ]
        const itf = new ethers.Interface(abi)
        const functionData = itf.encodeFunctionData(abi[0], [accountAddress])

        const url = "api/v1/contracts/call"
        const body: ContractCallRequest = {
            data: functionData,
            to: contractAddress,
        }
        const response = await axios.post<ContractCallResponse>(url, body)
        return ethers.getBigInt(response.data.result)
    }
}

export interface AccountERC20 {
    balance: string
    erc20Info: ERC20Info
}

