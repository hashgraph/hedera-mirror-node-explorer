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

import axios, {AxiosError} from "axios";
import {VerifiedContractsBuffer} from "@/utils/cache/VerifiedContractsBuffer";
import {SingletonCache} from "@/utils/cache/base/SingletonCache";

export class VerifiedContractsCache extends SingletonCache<VerifiedContractsBuffer> {

    public static readonly instance = new VerifiedContractsCache()

    protected async load(): Promise<VerifiedContractsBuffer> {
        const buffer = new VerifiedContractsBuffer(null, 500)
        await buffer.update().catch(this.errorHandler)
        return Promise.resolve(buffer)
    }

    private readonly errorHandler = (reason: unknown): void => {
        console.log("reason=" + reason)
        if (axios.isAxiosError(reason)) {
            const axiosError = reason as AxiosError
            console.log("url=" + axiosError.config?.url)
        }
    }
}
