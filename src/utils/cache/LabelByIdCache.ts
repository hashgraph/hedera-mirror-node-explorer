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

import {EntityCache} from "@/utils/cache/base/EntityCache";

export class LabelByIdCache extends EntityCache<string, string | null> {

    public static readonly instance = new LabelByIdCache()

    private static sampleLabel : string | null = 'sample-label'

    protected async load(key: string): Promise<string | null> {
        let label: string | null
        const lastDigit = key.slice(-1)
        if (lastDigit === '4' || lastDigit === '5' || lastDigit === '6' || lastDigit === '7' || lastDigit === '8') {
            label = LabelByIdCache.sampleLabel
        } else {
            label = null
        }
        await sleep(800)
        // return Promise.resolve(label)
        return Promise.resolve(null)
    }
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

