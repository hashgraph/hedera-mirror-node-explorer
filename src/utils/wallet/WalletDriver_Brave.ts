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

import {EntityID} from "@/utils/EntityID";
import {BrowserProvider, ethers} from "ethers";
import {BaseProvider} from '@metamask/providers';
import {makeTokenSymbol} from "@/schemas/HederaUtils";
import {HederaLogo} from "@/utils/wallet/WalletDriver"
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {WalletDriver_Ethereum} from "@/utils/wallet/WalletDriver_Ethereum";

export class WalletDriver_Brave extends WalletDriver_Ethereum {

    private braveProvider: BaseProvider|null = null

    //
    // Public
    //

    public constructor() {
        super("Brave Wallet",
            "https://brave.com/static-assets/images/optimized/brave-branding-assets/images/brave-logo-color-RGB_reversed.png",
            "https://brave.com/static-assets/images/brave-logo-no-shadow.png")
    }

    public async watchToken(accountId: string, tokenId: string): Promise<void> {
        const tokenAddress = EntityID.parse(tokenId)?.toAddress() ?? null
        if (accountId !== null && tokenAddress !== null && this.provider !== null) {
            const tokenInfo = await TokenInfoCache.instance.lookup(tokenId)
            const symbol = makeTokenSymbol(tokenInfo, 11)
            const decimals = tokenInfo?.decimals
            const params = {
                "type": "ERC20",
                "options": {
                    "address": `0x${tokenAddress}`,
                    "symbol": symbol,
                    "decimals": decimals,
                    "image": HederaLogo
                }
            }
            try {
                await this.provider.send("wallet_watchAsset", params)
            } catch(reason) {
                throw this.makeCallFailure(reason, "watchToken")
            }
        } else {
            throw this.callFailure("Invalid arguments")
        }
        return Promise.resolve()
    }

    //
    // WalletDriver_Ethereum
    //

    public async makeProvider(): Promise<BrowserProvider|null> {
        if (this.braveProvider === null) {
           this.braveProvider = ((window as any).ethereum ?? null)
        }
        const result = this.braveProvider !== null ?  new ethers.BrowserProvider(this.braveProvider) : null
        return Promise.resolve(result)
    }

    public isCancelError(reason: unknown): boolean {
        return WalletDriver_Brave.fetchBraveErrorCode(reason) == 4001
    }

    public async connect(network: string): Promise<string[]> {
        const result = await super.connect(network)
        this.braveProvider?.on('chainChanged', this.handleDisconnect)
        return Promise.resolve(result)
    }

    public async disconnect(): Promise<void> {
        this.braveProvider?.on("chainChanged", this.handleDisconnect)
        this.braveProvider = null
        return super.disconnect()
    }

    //
    // Private
    //

    private readonly handleDisconnect = () => this.disconnect()

    private static fetchBraveErrorCode(reason: unknown): number|null {
        let result: number|null
        if (typeof reason == "object" && reason != null) {
            if ("code" in reason && typeof reason.code == "number") {
                result = reason.code
            } else {
                result = null
            }
        } else {
            result = null
        }
        return result
    }


}
