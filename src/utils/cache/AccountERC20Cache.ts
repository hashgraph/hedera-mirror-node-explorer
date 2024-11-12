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

import {ContractCallRequest, ContractCallResponse} from "@/schemas/HederaSchemas";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios from "axios";
import {ERC20Cache, ERC20Token} from "@/utils/cache/ERC20Cache";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {ethers} from "ethers";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";

export class AccountERC20Cache extends EntityCache<string, AccountERC20[]> {

    public static readonly instance = new AccountERC20Cache()

    //
    // Cache
    //

    protected async load(accountId: string): Promise<AccountERC20[]> {
        let result: AccountERC20[] = []

        const erc20tokens = await ERC20Cache.instance.lookup()
        for (const t of erc20tokens) {
            const balance = await this.getBalance(t.contractId, accountId)
            if (balance > 0) {
                result.push( { balance: balance.toString(), erc20: t })
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
    erc20: ERC20Token
}

