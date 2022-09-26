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

import {KeyOperator, SortOrder, TableControllerV3} from "@/utils/table/TableControllerV3"
import {TopicMessage, TopicMessagesResponse} from "@/schemas/HederaSchemas"
import axios, {AxiosResponse} from "axios"
import {ComputedRef} from "vue"
import {Router} from "vue-router";

export class TopicMessageTableController extends TableControllerV3<TopicMessage, string> {

    public readonly topicId: ComputedRef<string|null>

    //
    // Public
    //

    public constructor(router: Router, topicId: ComputedRef<string|null>, pageSize: ComputedRef<number>) {
        super(router, pageSize, 10 * pageSize.value, 5000, 10, 100);
        this.topicId = topicId
        this.watchAndReload([this.topicId])
    }

    //
    // TableController
    //

    public async load(consensusTimestamp: string|null, operator: KeyOperator, order: SortOrder, limit: number): Promise<TopicMessage[]|null> {
        let result: Promise<TopicMessage[]|null>
        if (this.topicId.value !== null) {
            const params = {} as {
                limit: number
                timestamp: string | undefined
                order: string
            }
            params.limit = limit
            params.order = order
            if (consensusTimestamp != null) {
                params.timestamp = operator + ":" + consensusTimestamp
            }
            const cb = (r: AxiosResponse<TopicMessagesResponse>): Promise<TopicMessage[]|null> =>{
                return Promise.resolve(r.data.messages ?? [])
            }
            result = axios.get<TopicMessagesResponse>(
                "api/v1/topics/" + this.topicId.value + "/messages", { params: params} ).then(cb)
        } else {
            result = Promise.resolve(null)
        }

        return result
    }

    public keyFor(row: TopicMessage): string {
        return row.consensus_timestamp ?? ""
    }

    public stringFromKey(timestamp: string): string {
        return timestamp
    }

    public keyFromString(s: string): string|null {
        return s
    }

}
