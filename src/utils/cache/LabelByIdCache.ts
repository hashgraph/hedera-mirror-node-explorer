// SPDX-License-Identifier: Apache-2.0

import {EntityCache} from "@/utils/cache/base/EntityCache";

export class LabelByIdCache extends EntityCache<string, string | null> {

    public static readonly instance = new LabelByIdCache()

     
    protected async load(key: string): Promise<string | null> {
        // let label: string | null
        // const lastDigit = key.slice(-1)
        // if (lastDigit === '4' || lastDigit === '5' || lastDigit === '6' || lastDigit === '7' || lastDigit === '8') {
        //     label = LabelByIdCache.sampleLabel
        // } else {
        //     label = null
        // }
        // await sleep(800)
        // return Promise.resolve(label)
        return Promise.resolve(null)
    }
}

