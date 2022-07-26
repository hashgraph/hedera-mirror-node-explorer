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

import {WalletDriver} from "@/utils/wallet/WalletDriver";
import {AccountUpdateTransaction} from "@hashgraph/sdk";

export class WalletDriver_Mock extends WalletDriver {

    private static WALLET_NAME = "WalletMock"

    private readonly accountID: string
    private readonly transactionId:string

    private connected = false
    private network: string|null = null

    public stakedNodeId: number|null = null
    public stakedAccountId: string|null = null
    public declineStakingRewards: boolean|null = null
    public updateAccountCounter = 0

    //
    // Public
    //

    public constructor(accountID: string, transactionId: string) {
        super(WalletDriver_Mock.WALLET_NAME, null)
        this.accountID = accountID
        this.transactionId = transactionId
    }


    //
    // WalletDriver
    //

    public async connect(network: string): Promise<void> {
        if (this.connected) {
            throw this.connectFailure("Already connected")
        } else {
            this.connected = true
            this.network = network
        }
    }

    public async disconnect(): Promise<void> {
        if (this.connected) {
            this.connected = false
            this.network = null
        } else {
            throw this.connectFailure("Not connected yet")
        }
    }

    public async updateAccount(request: AccountUpdateTransaction): Promise<string> {
        let result: string

        this.updateAccountCounter += 1
        console.log("WalletDriver_Mock.updateAccount()")
        if (this.connected) {
            const targetAccountID = request.accountId?.toString()
            if (this.accountID == targetAccountID) {
                this.stakedNodeId = request.stakedNodeId?.toNumber() ?? null
                this.stakedAccountId = request.stakedAccountId?.toString() ?? null
                this.declineStakingRewards = request.declineStakingRewards
                result = this.transactionId
            } else {
                throw this.callFailure("Unexpected account id: " + targetAccountID)
            }
        } else {
            throw this.callFailure("Not connected yet")
        }

        return Promise.resolve(result)
    }

    getAccountId(): string | null {
        return this.connected ? this.accountID : null
    }

    getNetwork(): string | null {
        return this.connected ? this.network : null
    }

    isConnected(): boolean {
        return this.connected
    }

}
