/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

import {WalletDriver_Ethereum} from "@/utils/wallet/WalletDriver_Ethereum";
import {BrowserProvider} from "ethers";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {WalletDriverCancelError} from "@/utils/wallet/WalletDriverError";
import {NetworkEntry} from "@/schemas/NetworkRegistry";

export class WalletDriver_Coinbase extends WalletDriver_Ethereum {

    //
    // https://docs.cloud.coinbase.com/wallet-sdk/docs/injected-provider
    //

    //
    // Public
    //

    public constructor() {
        super("Coinbase Wallet",
            "https://logodownload.org/wp-content/uploads/2021/04/coinbase-logo-1-2048x430.png",
            "https://logosarchive.com/wp-content/uploads/2021/12/Coinbase-icon-symbol-1.svg")
    }

    //
    // WalletDriver_Ethereum
    //

    public async isExpectedProvider(provider: object): Promise<boolean> {
        const result = "isCoinbaseWallet" in provider && provider.isCoinbaseWallet == true
        return Promise.resolve(result)
    }

    protected async fetchAccountIds(provider: BrowserProvider): Promise<string[]> {
        let result: string[] = []

        try {
            // Coinbase does not support wallet_requestPermissions request
            // => we run eth_requestAccounts only
            const accountResponse = await provider.send("eth_requestAccounts", [])

            // Fetches info for each return accounts
            for (const address of accountResponse ?? []) {
                const accountInfo = address ? await AccountByAddressCache.instance.lookup(address) : null
                if (accountInfo?.account) {
                    result.push(accountInfo.account)
                }
            }
        } catch (reason) {
            if (this.isCancelError(reason)) {
                throw new WalletDriverCancelError()
            } else {
                throw this.connectFailure("Check " + this.name + " extension for details")
            }
        }

        return Promise.resolve(result)
    }


}
