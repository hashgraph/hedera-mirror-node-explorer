// SPDX-License-Identifier: Apache-2.0

import {describe, expect, it} from 'vitest'
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
