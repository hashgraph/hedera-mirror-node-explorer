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

import {EntityCache} from "@/utils/EntityCache";
import {TopicMessage, TopicMessagesResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";

export class TopicMessageCache extends EntityCache<TopicMessagesResponse> {

    private topicId: string
    private readonly limit: number

    //
    // Public
    //

    public constructor(topicId: string, limit = 100) {
        super(5000, 10)
        this.topicId = topicId
        this.limit = limit
    }

    public setTopicId(topicId: string): void {
        this.topicId = topicId
        this.clear()
    }

    public getLastTimestamp(): string|null {
        let result: string|null
        const messages = this.getEntity()?.messages
        if (messages != null && messages.length >= 1) {
            result = messages[0].consensus_timestamp ?? null
        } else {
            result = null
        }
        return result
    }


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
        const lastTimestamp = this.getLastTimestamp()
        if (lastTimestamp != null) {
            params.timestamp = "gt:" + lastTimestamp
        }
        return axios
            .get<TopicMessagesResponse>("api/v1/topics/" + this.topicId + "/messages", { params: params} )
            .then(response => this.mergeResponse(response, lastTimestamp))
    }

    //
    // EntityCache
    //

    private mergeResponse( next: AxiosResponse<TopicMessagesResponse>, lastTimestamp: string|null) :
        AxiosResponse<TopicMessagesResponse> {

        const prev = this.getResponse()
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
