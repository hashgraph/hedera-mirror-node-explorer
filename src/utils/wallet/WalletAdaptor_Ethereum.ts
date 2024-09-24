// noinspection DuplicatedCode

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


import {WalletAdaptor} from "@/utils/wallet/WalletAdaptor";
import {EntityID} from "@/utils/EntityID";
import {ethers} from "ethers";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";

//
// https://docs.reown.com/advanced/multichain/rpc-reference/ethereum-rpc
// https://ethereum.stackexchange.com/questions/114146/how-do-i-manually-encode-and-send-transaction-data
//


export class WalletAdapter_Ethereum extends WalletAdaptor {

    //
    // WalletAdapter
    //

    public async associateToken(tokenId: string): Promise<string> {
        const abi = ["function associate()"]
        const iface = new ethers.Interface(abi)
        const callData = iface.encodeFunctionData("associate", [])
        const result = await this.executeCall(tokenId, callData)
        return Promise.resolve(result)
    }

    public async dissociateToken(tokenId: string): Promise<string> {
        const abi = ["function dissociate()"]
        const iface = new ethers.Interface(abi)
        const callData = iface.encodeFunctionData("dissociate", [])
        const result = await this.executeCall(tokenId, callData)
        return Promise.resolve(result)
    }

    //
    // Private
    //

    private async executeCall(targetId: string, callData: string): Promise<string> {
        let result: string

        const accountAddress = await this.findAccountAddress()
        const tokenAddress = EntityID.parse(targetId)?.toAddress() ?? null
        if (accountAddress !== null && tokenAddress !== null) {
            const ethParams = {
                from: accountAddress,
                to: "0x" + tokenAddress,
                data: callData,
                value: "0x0"
            }
            try {
                result = await this.signClient.signAndExecute_eip155(this.session, this.network, ethParams)
            } catch(reason) {
                throw this.callFailure(reason)
            }
        } else {
            throw this.callFailure("executeCall")
        }

        return result
    }

    private async findAccountAddress(): Promise<string|null> {
        const accountInfo = await AccountByIdCache.instance.lookup(this.accountId)
        return accountInfo?.evm_address ?? EntityID.parse(this.accountId)?.toAddress() ?? null
    }

}


