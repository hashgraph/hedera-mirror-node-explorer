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

    public static parseSolcMetadata(content: string): SolcMetadata|null {
        let result: SolcMetadata|null
        try {
            const json = JSON.parse(content)
            /*
                // https://docs.soliditylang.org/en/latest/metadata.html#contract-metadata

                {
                    "compiler": {
                        "version": "0.8.17+commit.8df45f5f"
                    },
                    "language": "Solidity",
                    "output": {
                    },
                    "settings": {
                    },
                    "sources": {
                    },
                    "version": 1
                }
             */

            if (typeof json === "object" && json !== null) {
                const ok1 = "compiler" in json && typeof json.compiler == "object"
                const ok2 = "language" in json && json.language == "Solidity"
                const ok3 = "output" in json && typeof json.output == "object"
                const ok4 = "settings" in json && typeof json.output == "object"
                const ok5 = "sources" in json && typeof json.output == "object"
                const ok6 = "version" in json && json.version == "1"
                if (ok1 && ok2 && ok3 && ok4 && ok5 && ok6) {
                    result = json
                } else {
                    result = null
                }
            } else {
                result = null
            }
        } catch {
            result = null
        }
        return result
    }
}
