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

import {SolcMetadata} from "@/utils/solc/SolcMetadata";

export class SolcUtils {

    public static fetchIPFSHash(sourceFileName: string, metadata: SolcMetadata): string|null {
        let result: string|null = null
        if (sourceFileName in metadata.sources) {
            const prefix = "dweb:/ipfs/"
            for (const url of metadata.sources[sourceFileName].urls ?? []) {
                if (url.startsWith(prefix)) {
                    result = url.slice(prefix.length)
                    break
                }
            }
        }
        return result
    }

    public static fetchSWARMHash(sourceFileName: string, metadata: SolcMetadata): string|null {
        let result: string|null = null
        if (sourceFileName in metadata.sources) {
            const prefix = "bzz-raw://"
            for (const url of metadata.sources[sourceFileName].urls ?? []) {
                if (url.startsWith(prefix)) {
                    result = url.slice(prefix.length)
                    break
                }
            }
        }
        return result
    }

    public static fetchKeccakHash(sourceFileName: string, metadata: SolcMetadata): string|null {
        let result: string|null
        if (sourceFileName in metadata.sources) {
            result = metadata.sources[sourceFileName].keccak256 ?? null
        } else {
            result = null
        }
        return result
    }

}
