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

import {SolcInput} from "@/utils/solc/SolcInput";
import {routeManager} from "@/router";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import axios from "axios";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";

export class SourcifyUtils {

    public static async verifyWithSolcInput(contractId: string,
                               contractName: string,
                               compilerVersion: string,
                               solcInput: SolcInput): Promise<SourcifyVerifyResponse|null> {
        let result: SourcifyVerifyResponse|null

        const contractResponse = await ContractByIdCache.instance.lookup(contractId)
        const address = contractResponse?.evm_address ?? null
        const sourcifySetup = routeManager.currentNetworkEntry.value.sourcifySetup
        if (address !== null && sourcifySetup !== null) {
            const requestBody: SourcifyVerifyBody = {
                address: address,
                chain: sourcifySetup.chainID.toString(),
                files: {
                    "SolcJsonInput.json": JSON.stringify(solcInput)
                },
                compilerVersion: compilerVersion,
                contractName: contractName
            }
            const url = sourcifySetup.serverURL + "/verify/solc-json"
            const sourcifyResponse = await axios.post<SourcifyVerifyResponse>(url, requestBody)
            result = sourcifyResponse.data
        } else {
            result = null
        }

        return Promise.resolve(result)
    }

    public static async verify(contractId: string,
                               inputFiles: Map<string, string|SolcMetadata>): Promise<SourcifyVerifyResponse|null> {
        let result: SourcifyVerifyResponse|null

        const contractResponse = await ContractByIdCache.instance.lookup(contractId)
        const address = contractResponse?.evm_address ?? null
        const sourcifySetup = routeManager.currentNetworkEntry.value.sourcifySetup
        if (address !== null && sourcifySetup !== null) {
            const requestBody: SourcifyVerifyBody = {
                address: address,
                chain: sourcifySetup.chainID.toString(),
                files: {}
            }
            for (const [fileName, content] of inputFiles.entries()) {
                if (typeof content == "string") { // Solidity sources
                    requestBody.files[fileName] = content
                } else { // metadata file
                    requestBody.files["metadata.json"] = JSON.stringify(content)
                }
            }
            const url = sourcifySetup.serverURL + "verify"
            const sourcifyResponse = await axios.post<SourcifyVerifyResponse>(url, requestBody)
            result = sourcifyResponse.data
        } else {
            result = null
        }

        return Promise.resolve(result)
    }


}


export interface SourcifyVerifyBody {
    address: string
    chain: string
    files: Record<string, string> // filename x content
    compilerVersion?: string
    contractName?: string
}

export interface SourcifyVerifyResponse {
    result: {
        address: string,
        chainId: string,
        status: string,
        library: Record<string, unknown>
    }
}
