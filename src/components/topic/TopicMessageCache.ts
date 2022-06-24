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

import {EntityCacheV2} from "@/utils/EntityCacheV2";
import {TopicMessage, TopicMessagesResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, Ref, ref, watch} from "vue";

export class TopicMessageCache extends EntityCacheV2<TopicMessagesResponse> {

    public readonly topicId = ref<string|null>(null)
    private readonly limit: number

    //
    // Public
    //

    public constructor(limit = 100) {
        super(5000, 10)
        this.limit = limit
        watch(this.topicId, () => this.clear(), EntityCacheV2.WATCH_OPTIONS)
    }

    public readonly lastTimestamp = computed(() => {
        let result: string|null
        const messages = this.messages.value
        if (messages.length >= 1) {
            result = messages[0].consensus_timestamp ?? ""
        } else {
            result = null
        }
        return result
    })

    public readonly messages: Ref<Array<TopicMessage>> = computed(() => {
        return this.response.value?.data?.messages ?? []
    })


    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<TopicMessagesResponse>> {

        const params = {} as {
            limit: number
            timestamp: string | undefined
            order: string
        }
        params.limit = this.limit
        params.order = 'desc'
        if (this.lastTimestamp.value != null) {
            params.timestamp = "gt:" + this.lastTimestamp.value
        }
        return axios
            .get<TopicMessagesResponse>("api/v1/topics/" + this.topicId.value + "/messages", { params: params} )
            .then(response => this.mergeResponse(response, this.lastTimestamp.value))
    }

    //
    // EntityCache
    //

    private mergeResponse( next: AxiosResponse<TopicMessagesResponse>, lastTimestamp: string|null) :
        AxiosResponse<TopicMessagesResponse> {

        const prev = this.response.value
        if (prev != null && lastTimestamp != null) {
            const prevMessages = prev.data.messages ?? Array<TopicMessage>()
            const nextMessages = next.data.messages ?? Array<TopicMessage>()
            const survivorCount = Math.max(0, prevMessages.length - nextMessages.length)
            const survivors = prevMessages.slice(0, survivorCount)
            next.data.messages = nextMessages.concat(survivors)
        }

        return next
    }
}
