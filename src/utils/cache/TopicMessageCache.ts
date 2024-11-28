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

import {EntityCache, EntityLookup} from "@/utils/cache/base/EntityCache";
import {TopicMessage} from "@/schemas/MirrorNodeSchemas";
import axios from "axios";
import {computed, Ref} from "vue";

export class TopicMessageCache extends EntityCache<string, TopicMessage | null> {

    public static readonly instance = new TopicMessageCache()

    //
    // Cache
    //

    protected async load(topicIdAndSeqNumber: string): Promise<TopicMessage | null> {
        let result: Promise<TopicMessage | null>
        const idAndSeqNumberArray = topicIdAndSeqNumber.split("---")
        try {
            const url = `api/v1/topics/${idAndSeqNumberArray[0]}/messages/${idAndSeqNumberArray[1]}`
            const response = await axios.get<TopicMessage>(url)
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

    public makeTopicMessageLookup(
        tokenId: Ref<string | null>,
        seqNumber: Ref<string | null>,
    ): EntityLookup<string, TopicMessage | null> {
        const key = computed(() => {
            let result: string | null
            if (tokenId.value !== null && seqNumber.value !== null) {
                result = tokenId.value + "---" + seqNumber.value
            } else {
                result = null
            }
            return result
        })
        return this.makeLookup(key)
    }
}
