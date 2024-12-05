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

import {EntityCache} from "@/utils/cache/base/EntityCache";
import {TopicMessagesResponse} from "@/schemas/MirrorNodeSchemas";
import axios, {AxiosResponse} from "axios";
import {HCSAsset} from "@/utils/cache/HCSAsset.ts";

export class HCSAssetCache extends EntityCache<string, HCSAsset | null> {

    public static readonly instance = new HCSAssetCache()

    public static readonly MESSAGE_LIMIT_PER_ASSET = 100

    //
    // Cache
    //
    protected async load(topicId: string): Promise<HCSAsset | null> {
        let result: Promise<HCSAsset | null>

        const url: string | null = `api/v1/topics/${topicId}/messages?limit=${HCSAssetCache.MESSAGE_LIMIT_PER_ASSET}&order=asc`
        const response: AxiosResponse<TopicMessagesResponse> = await axios.get<TopicMessagesResponse>(url)
        const assetComplete = response.data.links.next === null

        if (response.data.messages.length >= 1) {
            const asset = await HCSAsset.reassemble(response.data.messages, assetComplete)
            if (asset != null) {
                result = Promise.resolve(asset)
            } else {
                result = Promise.resolve(null)
            }
        } else {
            result = Promise.resolve(null)
        }
        return result
    }

}
