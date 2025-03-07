// SPDX-License-Identifier: Apache-2.0

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