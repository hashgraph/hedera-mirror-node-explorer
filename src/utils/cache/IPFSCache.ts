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

import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios from "axios";

export class IPFSCache extends EntityCache<string, unknown|null> {

    public static readonly instance = new IPFSCache(10000)

    private readonly timeout: number
    public readonly privateAxios = axios.create()
    // We use our private axios instance to be undetected from AxiosMonitor interceptors

    //
    // Public
    //

    public constructor(timeout: number) {
        super()
        this.timeout = timeout
    }

    public static makeURL(hash: string): string {
        return "https://ipfs.io/ipfs/" + hash
    }

    //
    // EntityCache
    //

    /*
        We alter lookup logic of EntityCache.
        When EntityCache gets an error, it keeps it cache and never asks again.
        When this cache gets an error, next lookup() tries again.
        This behavior looks better in IPFS context where it's pretty common to get transient timeout, 503 …
     */

    public async lookup(hash: string, forceLoad = false): Promise<unknown|null> {
        let result: unknown|null

        const alreadyPresent = this.contains(hash, forceLoad)
        try {
            result = await super.lookup(hash, forceLoad)
        } catch(error) {
            if (alreadyPresent) {
                // hash has already been lookup and an error was detected => for IPFS, we forget and retry
                this.forget(hash)
                result = await super.lookup(hash, forceLoad)
            } else {
                throw error
            }
        }

        return result
    }

    //
    // Cache
    //

    protected async load(hash: string): Promise<unknown|null> {
        let result: Promise<unknown|null>
        try {
            const options = { timeout: this.timeout }
            const response = (await this.privateAxios.get(IPFSCache.makeURL(hash), options))
            result = Promise.resolve(response.data)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = Promise.resolve(null)
            } else {
                throw error
            }
        }
        return result
    }

}
