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

export class HCSTopicMemo {
    public constructor(
        public readonly hash: string,
        public readonly algo: string,
        public readonly encoding: string
    ) {
    }

    public static parse(memo: string): HCSTopicMemo | null {
        const SHA256_REGEX = /^[A-Fa-f0-9]{64}$/;

        let result: HCSTopicMemo | null
        if (memo !== "") {
            const parts = memo.split(':')
            if (
                parts.length === 3
                && parts[0].length > 0
                && parts[1].length > 0
                && parts[2].length > 0
                && parts[0].match(SHA256_REGEX)
            ) {
                result = new HCSTopicMemo(parts[0], parts[1], parts[2],)
            } else {
                result = null
            }
        } else {
            result = null
        }
        return result
    }
}
