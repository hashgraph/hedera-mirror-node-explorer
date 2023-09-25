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

import axios from "axios";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {routeManager} from "@/router";

export class SourcifyCache extends EntityCache<string, SourcifyRecord|null> {

    public static readonly instance = new SourcifyCache()


    //
    // Public
    //

    public static fetchMetadata(response: SourcifyResponse): SolcMetadata|null {

        // https://docs.sourcify.dev/docs/api/server/get-source-files-all/

        let result: SolcMetadata|null
        try {
            result = null
            for (const i of response.files) {
                if (i.name === "metadata.json") {
                    result = JSON.parse(i.content)
                    break
                }
            }
        } catch {
            result = null
        }

        return result
    }

    public static fetchSource(sourceFileName: string, response: SourcifyResponse): string|null {

        // https://docs.sourcify.dev/docs/api/server/get-source-files-all/

        let result: string|null = null
        for (const f of response.files) {
            if (f.name === sourceFileName) {
                result = f.content
                break
            }
        }

        return result
    }

    //
    // Cache
    //

    protected async load(contractId: string): Promise<SourcifyRecord|null> {
        let result: SourcifyRecord|null
        const sourcifySetup = routeManager.currentNetworkEntry.value.sourcifySetup
        if (sourcifySetup !== null) {
            const contractResponse = await ContractByIdCache.instance.lookup(contractId)
            const contractAddress = contractResponse?.evm_address
            if (contractAddress) {
                const requestURL = sourcifySetup.makeRequestURL(contractAddress)
                try {
                    const response = await axios.get<SourcifyResponse>(requestURL)
                    const repoURL = sourcifySetup.makeContractLookupURL(contractAddress)
                    result = new SourcifyRecord(response.data, response.data.status === "full", repoURL)
                } catch(error) {
                    if (axios.isAxiosError(error) && error.response?.status == 404) {
                        result = null
                    } else {
                        throw error
                    }
                }
            } else {
                result = null
            }
        } else {
            result = null
        }
        return Promise.resolve(result)
    }
}

export class SourcifyRecord {
    public readonly response: SourcifyResponse
    public readonly fullMatch: boolean
    public readonly folderURL: string
    constructor(response: SourcifyResponse, fullMatch: boolean, folderURL: string) {
        this.response = response
        this.fullMatch = fullMatch
        this.folderURL = folderURL
    }
}

export interface SourcifyResponse {
    status: string,
    files: SourcifyResponseItem[]
}

export interface SourcifyResponseItem {
    name: string,
    path: string,
    content: string
}
