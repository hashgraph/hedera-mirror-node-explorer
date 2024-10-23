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

import {shallowRef} from "vue";
import {EIP6963AnnounceProviderEvent, EIP6963ProviderDetail} from "@/utils/wallet/eip6963";


export class EIP6963Agent {

    public static readonly instance = new EIP6963Agent()

    private readonly providers = shallowRef<EIP6963ProviderDetail[]>([])

    public findProviderDetails(rdns: string): EIP6963ProviderDetail|null {
        return this.providers.value.find((d: EIP6963ProviderDetail) => d.info.rdns === rdns) ?? null
    }


    //
    // Private
    //

    private constructor() {
        // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-6963.md#dapp-implementation
        window.addEventListener("eip6963:announceProvider", this.handleAnnounceProvider)
        window.dispatchEvent(new Event("eip6963:requestProvider"))
    }

    private readonly handleAnnounceProvider = (event: EIP6963AnnounceProviderEvent): void => {
        const newUUID = event.detail.info.uuid
        const found = this.providers.value.find((d: EIP6963ProviderDetail) => d.info.uuid == newUUID)
        if (!found) {
            this.providers.value.push(event.detail)
        }
    }
}
