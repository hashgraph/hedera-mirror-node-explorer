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

import {EntityID} from "@/utils/EntityID.ts";

export class HCSURI {
    protected constructor(
        public readonly version: string,
        public readonly topicId: string,
    ) {
    }

    public static parse(uri: string): HCSURI | null {
        let result: HCSURI | null
        const HCS1_REGEX = /^hcs:\/\/(\d+)\/(.+)$/;
        const match = uri.match(HCS1_REGEX)
        if (match) {
            const topicId = EntityID.parse(match[2])?.toString()
            if (topicId) {
                result = new HCSURI(match[1], topicId)
            } else {
                result = null
            }
        } else {
            result = null
        }
        return result
    }

}
