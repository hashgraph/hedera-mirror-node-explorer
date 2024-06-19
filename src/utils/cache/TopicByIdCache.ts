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

import {Topic} from "@/schemas/HederaSchemas";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios from "axios";

export class TopicByIdCache extends EntityCache<string, Topic | null> {

    public static readonly instance = new TopicByIdCache()

    //
    // Public
    //

    public updateWithTopic(topic: Topic): void {
        if (topic.topic_id) {
            this.forget(topic.topic_id)
            this.mutate(topic.topic_id, Promise.resolve(topic))
        }
    }

    //
    // Cache
    //

    protected async load(key: string): Promise<Topic | null> {
        let result: Promise<Topic | null>
        try {
            const response = await axios.get<Topic>("api/v1/topics/" + key)
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
}
