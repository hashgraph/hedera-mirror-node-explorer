// SPDX-License-Identifier: Apache-2.0

import {Topic} from "@/schemas/MirrorNodeSchemas";
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
