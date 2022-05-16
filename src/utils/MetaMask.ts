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

import detectEthereumProvider from "@metamask/detect-provider";

/*
    References:
        https://docs.metamask.io/guide/ethereum-provider.html#table-of-contents
        https://github.com/MetaMask/metamask-extension
        https://github.com/MetaMask/metamask-extension/pull/4606
        https://github.com/estebanmino/EIPs/blob/master/EIPS/eip-747.md

 */

export enum MetaMask_Status { metaMaskNotInstalled, watchDone, watchFailed}

export function MetaMask_watchAsset(address: string, symbol: string|undefined, decimals: string|undefined): Promise<MetaMask_Status> {

    const executor = (resolve: (r: MetaMask_Status) => void, reject: (reason: unknown) =>  void) => {
        const requestParams = {
            method: "metamask_watchAsset",
            params: {
                "type":"ERC20",
                "options":{
                    "address": address,
                    "symbol": symbol,
                    "decimals": decimals
                },
            },
        }
        const onFullfilled = (provider: unknown) => {
            if (provider) {
                (provider as any).request(requestParams).then(
                    () => {
                        resolve(MetaMask_Status.watchDone)
                    },
                    () => {
                        resolve(MetaMask_Status.watchFailed)
                    })
            } else {
                resolve(MetaMask_Status.metaMaskNotInstalled)
            }
        }
        const onReject = (reason: unknown) => {
            reject(reason)
        }
        const options = {mustBeMetaMask: true}

        detectEthereumProvider(options).then(onFullfilled, onReject)
    }

    return new Promise<MetaMask_Status>(executor)
}
