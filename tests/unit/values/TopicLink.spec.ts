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

import {describe, it, expect} from 'vitest'
import {mount} from "@vue/test-utils"
import TopicLink from "@/components/values/link/TopicLink.vue"
import router from "@/router";

describe("TopicLink.vue", () => {

    it("props.topicId set", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const testTopicId = "0.0.42"
        const wrapper = mount(TopicLink, {
            global: {
                plugins: [router]
            },
            props: {
                topicId: testTopicId
            },
        });

        expect(wrapper.text()).toBe(testTopicId)
        expect(wrapper.findComponent("a").attributes("href")).toMatch(
            RegExp("/topic/" + testTopicId + "$")
        )

        wrapper.unmount()
    });

    it("props.topicId unset", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(TopicLink, {
            global: {
                plugins: [router]
            },
            props: {},
        });

        expect(wrapper.text()).toBe("None")
        expect(wrapper.findComponent("a").exists()).toBe(false)

        wrapper.unmount()
    });
});
