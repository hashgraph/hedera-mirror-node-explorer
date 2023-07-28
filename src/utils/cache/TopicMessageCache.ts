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

import {EntityCache} from "@/utils/cache/base/EntityCache";
import {TopicMessage} from "@/schemas/HederaSchemas";
import axios from "axios";

export class TopicMessageCache extends EntityCache<string, TopicMessage|null> {

    public static readonly instance = new TopicMessageCache()

    //
    // Cache
    //

    protected async load(timestamp: string): Promise<TopicMessage|null> {
        let result: Promise<TopicMessage|null>
        try {
            const response = await axios.get<TopicMessage>("api/v1/topics/messages/" + timestamp)
            result = Promise.resolve(response.data)
        } catch(error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = Promise.resolve(null)
            } else {
                throw error
            }
        }
        return result
    }

}