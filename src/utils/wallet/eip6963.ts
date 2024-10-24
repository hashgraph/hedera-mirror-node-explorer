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


//
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-6963.md
//

import {EIP1193Provider} from "@/utils/wallet/eip1193";

export interface EIP6963ProviderInfo {
    rdns: string
    uuid: string
    name: string
    icon: string
}

export interface EIP6963ProviderDetail {
    info: EIP6963ProviderInfo
    provider: EIP1193Provider
}

export type EIP6963AnnounceProviderEvent = {
    detail: {
        info: EIP6963ProviderInfo
        provider: Readonly<EIP1193Provider>
    }
}
