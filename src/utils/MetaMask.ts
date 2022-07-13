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
import { MetaMaskInpageProvider } from '@metamask/providers';

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
                    "decimals": decimals,
                    "image": HederaLogo
                },
            },
        }
        const onFullfilled = (provider: unknown) => {
            if (provider) {
                (provider as MetaMaskInpageProvider).request(requestParams).then(
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



export const HederaLogo =
    'data:image/svg+xml;utf8,<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
    '<path d="M20 0a20 20 0 1 0 20 20A20 20 0 0 0 20 0" fill="black"></path>' +
    '<path d="M28.13 28.65h-2.54v-5.4H14.41v5.4h-2.54V11.14h2.54v5.27h11.18v-5.27h2.54zm-13.6-7.42h11.18v-2.79H14.53z" fill="white"></path>' +
    '</svg>'
