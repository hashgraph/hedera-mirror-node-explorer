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

import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios from "axios";
import {ContractResponse, ContractStateResponse} from "@/schemas/HederaSchemas";
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";
import {ethers} from "ethers";

export class LogicContractCache extends EntityCache<string, ContractResponse|null> {

    public static readonly instance = new LogicContractCache()


    //
    // Cache
    //

    protected async load(contractId: string): Promise<ContractResponse|null> {
        let result: ContractResponse|null

        // See https://eips.ethereum.org/EIPS/eip-1967
        const logicContractSlotAddress = "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        const logicContractAddress = await LogicContractCache.fetchContractAddress(contractId, logicContractSlotAddress)
        if (logicContractAddress !== null) {
            result = await ContractByAddressCache.instance.lookup(logicContractAddress)
        } else {
            result = null
        }
        return Promise.resolve(result)
    }

    //
    // Private
    //

    public static async fetchContractAddress(contractId: string, slotAddress: string): Promise<string|null> {
        let result: string|null

        const slotValue = await this.fetchSlot(slotAddress, contractId)
        if (slotValue !== null && slotValue !== "0x") {
            const slotBytes = ethers.getBytes(slotValue)
            const addressBytes = slotBytes.length == 32 ? slotBytes.slice(12) : null
            result = addressBytes !== null ? ethers.hexlify(addressBytes) : null
        } else {
            result = null
        }
        // Address is the last 20 bytes of the slot value
       return Promise.resolve(result)
    }

    private static async fetchSlot(slotAddress: string, contractId: string): Promise<string|null> {
        const url = "api/v1/contracts/" + contractId + "/state?slot=" + slotAddress
        const response = await axios.get<ContractStateResponse>(url)
        const states = response.data.state ?? []
        const state = states.length >= 1 ? states[0] : null
        return Promise.resolve(state?.value ?? null)
    }
}
