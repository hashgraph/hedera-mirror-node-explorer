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

import axios, {AxiosResponse} from "axios";

export interface DecompiledResult {
    decompiled: string | null,
    error: string | null,
}

export class Decompiler {

/**
   * @dev decompile EVM bytecode into Solidity contract
   * @param bytecode: string
   * @return Promise<DecompiledResult>
   */
    public static async decompile(bytecode: string) {
        let result: DecompiledResult|null;

        try {
            const DECOMPILE_URL = `http://localhost:7639/api/decompile`
            const data = JSON.stringify({ bytecode })
            let config = {
                method: 'post',
                url: DECOMPILE_URL,
                headers: {
                    'Content-Type': 'application/json'
                },
                data
            }
            const decompiledResult = await axios.request<DecompiledResult>(config)
            result = decompiledResult.data
        } catch (error: any) {
            result = {
                decompiled: null,
                error: error.response.data.error
            }
        }

        return Promise.resolve(result)
    }
}
