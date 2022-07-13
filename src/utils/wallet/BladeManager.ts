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


import {computed} from "vue";
import {BladeSigner} from "@bladelabs/blade-web3.js";
import {HederaNetwork} from "@bladelabs/blade-web3.js/lib/src/models/blade";
import {WalletManager} from "@/utils/wallet/WalletManager";

export class BladeManager extends WalletManager {

    //
    // WalletManager
    //

    public async connect(): Promise<void> {
        if (this.signerRef.value === null && this.currentHederaNetwork.value != null) {
            const signer = new BladeSigner()
            await signer.createSession(this.currentHederaNetwork.value)
            this.signerRef.value = signer
            this.accountIdRef.value = signer.getAccountId().toString()
        }
    }

    public async disconnect(): Promise<void> {
        if (this.signerRef.value !== null) {
            await (this.signerRef.value as BladeSigner).killSession()
            this.signerRef.value = null
            this.accountIdRef.value = null
        }
    }

    //
    // Private
    //

    private currentHederaNetwork = computed(() => {
        let result: HederaNetwork | null
        switch (this.routeManager.currentNetwork.value) {
            case "mainnet":
                result = HederaNetwork.Mainnet
                break
            case "testnet":
                result = HederaNetwork.Testnet
                break
            default:
                result = null
                break
        }
        return result
    })

}
