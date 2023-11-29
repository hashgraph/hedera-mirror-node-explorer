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

import {routeManager} from "@/router";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import axios from "axios";

export class SourcifyUtils {


    //
    // Session verification
    //

    private static readonly withCredentials = true

    public static async sessionClear(): Promise<string> {
        let result: string

        const sourcifySetup = routeManager.currentNetworkEntry.value.sourcifySetup
        if (sourcifySetup !== null) {
            const url = sourcifySetup.serverURL + "session/clear"
            const config = { withCredentials: this.withCredentials }
            const response = await axios.post<string>(url, null, config)
            result = response.data
        } else {
            throw Error("No sourcify setup for network " + routeManager.currentNetworkEntry.value.name)
        }

        return Promise.resolve(result)
    }

    public static async sessionInputFiles(files: Map<string, string>): Promise<SourcifyInputFilesResponse> {
        let result: SourcifyInputFilesResponse

        const sourcifySetup = routeManager.currentNetworkEntry.value.sourcifySetup
        if (sourcifySetup !== null) {
            const body: SourcifyInputFilesBody = {
                files: {}
            }
            for (const [f, c] of files) {
                body.files[f] = c
            }
            const url = sourcifySetup.serverURL + "session/input-files"
            const config = {
                withCredentials: this.withCredentials ,
                headers: {'content-type': 'application/json'}
            }
            const response = await axios.post<SourcifyInputFilesResponse>(url, body, config)
            result = response.data
        } else {
            throw Error("No sourcify setup for network " + routeManager.currentNetworkEntry.value.name)
        }

        return Promise.resolve(result)
    }

    public static async sessionVerifyChecked(contractId: string,
                                             verificationIds: string[],
                                             store: boolean): Promise<SourcifyVerifyCheckedResponse> {
        let result: SourcifyVerifyCheckedResponse

        const contractResponse = await ContractByIdCache.instance.lookup(contractId)
        const address = contractResponse?.evm_address ?? null
        const sourcifySetup = routeManager.currentNetworkEntry.value.sourcifySetup
        if (address !== null && sourcifySetup !== null) {
            const chainId = sourcifySetup.chainID.toString()
            const body: SourcifyVerifyCheckedBody = {
                contracts: []
            }
            if (store) {
                body.storeResult = true
            }
            for (const vid of verificationIds) {
                body.contracts.push({
                    address: address,
                    chainId: chainId,
                    verificationId: vid,
                    creatorTxHash: null
                })
            }
            const url = sourcifySetup.serverURL + "session/verify-checked"
            const config = {
                withCredentials: this.withCredentials ,
                headers: {'content-type': 'application/json'},
                // params: { store }
            }
            const response = await axios.post<SourcifyVerifyCheckedResponse>(url, body, config)
            result = response.data
        } else {
            throw Error("No sourcify setup for network " + routeManager.currentNetworkEntry.value.name)
        }

        return Promise.resolve(result)
    }

    //
    // Tools
    //

    public static fetchMatchingContract(response: SourcifyVerifyCheckedResponse): SourcifyVerifyCheckedContract|null {
        let result: SourcifyVerifyCheckedContract|null = null
        for (const c of response.contracts) {
            if (c.status == "partial" || c.status == "perfect") {
                result = c
                break
            }
        }
        return result
    }

    public static fetchVerificationIds(response: SourcifyInputFilesResponse): string[] {
        const result : string[] = []
        for (const c of response.contracts) {
            result.push(c.verificationId)
        }
        return result
    }

    public static findCompiledPath(dropPath: string, contract: SourcifyVerifyCheckedContract): string|null {
        let result: string|null = null
        for (const compiledPath of contract.files.found) {
            if (this.pathEndsWith(dropPath, compiledPath)) {
                result = compiledPath
                break
            }
        }
        return result
    }

    private static pathEndsWith(path: string, suffix: string): boolean {
        let result: boolean
        if (path == suffix) {
            result = true
        } else if (path.length > suffix.length) {
            const ss1 = "/" + suffix
            const ss2 = path.substring(path.length - ss1.length)
            result = ss1 == ss2
        } else {
            result = false
        }
        return result
    }
}


export interface SourcifyInputFilesBody {
    files: Record<string, string> // filename x content
}

export interface SourcifyInputFilesResponse {
    contracts: {
        compiledPath: string
        name: string
        compilerVersion: string
        files: {
            found: string[]
            missing: string[]
        }
        verificationId: string
        status: string
    }[]
    files: string[]
    unused: string[]
}

export interface SourcifyVerifyCheckedBody {
    storeResult?: boolean,
    contracts: {
        address: string
        chainId: string
        creatorTxHash: string|null
        verificationId: string
    }[]
}


export interface SourcifyVerifyCheckedResponse {
    contracts: SourcifyVerifyCheckedContract[]
    files: string[]
    unused: string[]
}

export interface SourcifyVerifyCheckedContract {
    verificationId: string
    compiledPath: string
    name: string
    compilerVersion: string
    address: string
    chainId: string
    files: {
        found: string[]
        missing: string[]
    }
    status: string
    statusMessage?: string
    storageTimestamp: string
}
