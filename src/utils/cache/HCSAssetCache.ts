// SPDX-License-Identifier: Apache-2.0

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
