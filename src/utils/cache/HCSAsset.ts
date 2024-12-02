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

import {TopicMessage} from "@/schemas/MirrorNodeSchemas";
import {decompress, init} from "@bokuweb/zstd-wasm";
import {base64DecToArr} from "@/utils/B64Utils.ts";
import {HCSAssetFragment} from "@/utils/HCSAssetFragment.ts";
import {getDataURLType} from "@/utils/URLUtils.ts";

export class HCSAsset {
    protected constructor(
        public readonly type: string | null, // MIME type
        public readonly content: ArrayBuffer,
        public readonly hash: string, // SHA-256 in hexa
    ) {
    }

    public getDataURL(): string | null {
        let result: string | null
        if (this.type !== null) {
            const dataPrefix = `data:${this.type};base64,`
            const urlContent = Buffer.from(this.content).toString("base64")
            result = dataPrefix + urlContent
        } else {
            result = null
        }
        return result
    }

    public static async reassemble(messages: TopicMessage[]): Promise<HCSAsset | null> {
        let result: HCSAsset | null

        const fragments: HCSAssetFragment[] = []
        for (const m of messages) {
            const fragment = HCSAssetFragment.parse(m)
            if (fragment !== null) {
                fragments.push(fragment)
            }
        }
        if (fragments.length >= 1) {
            fragments.sort((a, b) => a.index - b.index)
            let assembledContent = ""
            for (const f of fragments) {
                assembledContent += f.content
            }
            // Extract the mime type
            const assetType = getDataURLType(assembledContent)
            // Skip the data prefix
            assembledContent = assembledContent.substring(assembledContent.indexOf(',') + 1)
            // Decode from Base64
            const compressedContent = base64DecToArr(assembledContent)
            // Decompress (zstd)
            if (!this.isInitialized) {
                await init()
                this.isInitialized = true
            }
            const assetContent = decompress(Buffer.from(compressedContent))
            const assetHash = await window.crypto.subtle.digest("SHA-256", assetContent);
            result = new HCSAsset(assetType, assetContent, Buffer.from(assetHash).toString('hex'))
        } else {
            result = null
        }
        return Promise.resolve(result)
    }

    private static isInitialized = false
}
