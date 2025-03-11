// SPDX-License-Identifier: Apache-2.0

import {describe, expect, it} from 'vitest'
import {mount} from "@vue/test-utils"
import router from "@/router";
import BlockLink from "@/components/values/BlockLink.vue";

describe("BlockLink.vue", () => {

    it("should construct a valid BlockLink to block #12", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const testBlockNumber = 12
        const wrapper = mount(BlockLink, {
            global: {
                plugins: [router]
            },
            props: {
                blockNumber: testBlockNumber
            },
        });

        expect(wrapper.text()).toBe(testBlockNumber.toString())
        expect(wrapper.findComponent("a").attributes("href")).toMatch(
            RegExp("/block/" + testBlockNumber + "$")
        )

        wrapper.unmount()
    });

    it("should construct an empty BlockLink", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(BlockLink, {
            global: {
                plugins: [router]
            },
            props: {},
        });

        expect(wrapper.text()).toBe("")
        expect(wrapper.findComponent("a").exists()).toBe(false)

        wrapper.unmount()
    });
});
