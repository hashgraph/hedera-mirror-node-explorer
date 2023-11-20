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

import {HHMetadata} from "@/utils/hardhat/HHMetadata";
import {SolcInput} from "@/utils/solc/SolcInput";
import {SolcUtils} from "@/utils/solc/SolcUtils";

export class HHUtils {

    public static castMetadata(content: unknown): HHMetadata|null {
        let result: HHMetadata|null
        /*

            {
              "id": "759551f1ce3dc2f5642a2c18c92437f1",
              "_format": "hh-sol-build-info-1",
              "solcVersion": "0.8.19",
              "solcLongVersion": "0.8.19+commit.7dd6d404",
              "input": { ... },
              "output": { ... },
            }

         */

        if (typeof content === "object" && content !== null) {
            const ok1 = "id" in content && typeof content.id == "string"
            const ok2 = "_format" in content && content._format == "hh-sol-build-info-1"
            const ok3 = "solcVersion" in content && typeof content.solcVersion == "string"
            const ok4 = "solcLongVersion" in content && typeof content.solcLongVersion == "string"
            const ok5 = "input" in content && typeof content.input == "object"
            const ok6 = "output" in content && typeof content.output == "object"
            result = ok1 && ok2 && ok3 && ok4 && ok5 && ok6 ? content as HHMetadata : null
        } else {
            result = null
        }
        return result
    }

    public static parseMetadata(content: string): HHMetadata|null {
        let result: HHMetadata|null
        try {
            const json = JSON.parse(content)
            result = this.castMetadata(json)
        } catch {
            result = null
        }
        return result
    }


    public static match(deployedByteCode: string, metadataFiles: Map<string, HHMetadata>): HHMatch|null {
        let result: HHMatch|null = null
        for (const [file, content] of metadataFiles) {
            const record = SolcUtils.findMatchingContract(deployedByteCode, content.output)
            if (record !== null) {
                result = {
                    contractName: record.contractName,
                    metadataPath: file,
                    solcInput: content.input,
                    solcLongVersion: content.solcLongVersion
                }
                break
            }
        }
        return result
    }
}

export interface HHMatch {
    contractName: string
    metadataPath: string
    solcInput: SolcInput
    solcLongVersion: string
}
