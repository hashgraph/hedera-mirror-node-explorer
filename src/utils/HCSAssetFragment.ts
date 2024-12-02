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

import {TopicMessage} from "@/schemas/MirrorNodeSchemas.ts";

export class HCSAssetFragment {
    public constructor(
        public readonly index: number,
        public readonly content: string
    ) {
    }

    public static parse(topicMessage: TopicMessage): HCSAssetFragment | null {
        let result: HCSAssetFragment | null
        let chunk: any
        try {
            chunk = JSON.parse(atob(topicMessage.message))
        } catch {
            chunk = null
        }
        if (chunk !== null && chunk.o != undefined && chunk.c != undefined) {
            result = new HCSAssetFragment(
                chunk.o,
                chunk.c
            )
        } else {
            result = null
        }
        return result
    }
}