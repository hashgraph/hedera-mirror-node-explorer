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

import {RouteManager} from "@/utils/RouteManager";
import {computed, ref, watch} from "vue";
import {AccountUpdateTransaction, Signer, TransactionResponse} from "@hashgraph/sdk";

export abstract class WalletManager {

    protected readonly routeManager: RouteManager

    //
    // Public
    //

    public constructor(routeManager: RouteManager) {
        this.routeManager = routeManager
        watch(this.routeManager.currentNetwork, () => this.disconnect())
    }

    public connected = computed(() => this.signerRef.value != null)

    public accountId = computed(() => this.accountIdRef.value)

    public walletName = computed(() => this.walletNameRef.value)

    public walletIconURL = computed(() => this.walletIconURLRef.value)

    public async connect(): Promise<void> {
        return Promise.reject<void>(new WalletUnexpectedError("Not yet implemented"))
    }

    public async disconnect(): Promise<void> {
        return Promise.reject<void>(new WalletUnexpectedError("Not yet implemented"))
    }

    public async changeStaking(nodeId: number|null, accountId: string|null, declineReward: boolean|null): Promise<TransactionResponse> {

        console.log("changeStaking - nodeId:        " + nodeId)
        console.log("                accountId:     " + accountId)
        console.log("                declineReward: " + declineReward)

        let result: Promise<TransactionResponse>

        // Connects if needed
        await this.connect()

        // Updates account's stakeNodeId
        if (this.signerRef.value !== null && this.accountId.value !== null) {
            const trans = await new AccountUpdateTransaction()
            trans.setAccountId(this.accountId.value)
            if (nodeId !== null) {
                trans.setStakedNodeId(nodeId)
                trans.setStakedAccountId("0.0.0")
            } else if (accountId !== null) {
                trans.setStakedNodeId(-1)
                trans.setStakedAccountId(accountId)
            } else {
                trans.setStakedNodeId(-1)
                trans.setStakedAccountId("0.0.0")
            }
            if (declineReward !== null) {
                trans.setDeclineStakingReward(declineReward)
            }
            result = this.signerRef.value.call(trans)

        } else {
            result = Promise.reject("Failed to connect to wallet")
        }

        return result;
    }

    //
    // Protected
    //

    protected readonly signerRef = ref<Signer|null>(null)

    protected readonly walletNameRef = ref<string|null>(null)

    protected readonly walletIconURLRef = ref<string|null>(null)

    protected readonly accountIdRef = ref<string|null>(null)

}

export class WalletUnexpectedError extends Error {
    constructor(message: string) {
        super(message)
    }
}
