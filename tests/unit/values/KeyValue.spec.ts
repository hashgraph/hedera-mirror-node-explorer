// SPDX-License-Identifier: Apache-2.0

import {describe, expect, it} from 'vitest'
import {mount} from "@vue/test-utils"
import router from "@/router";
import KeyValue from "@/components/values/KeyValue.vue";

describe("KeyValue.vue", () => {

    it("props.keyBytes set", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const testBytes = "000102030405060708090A0B0C0D0E0F"
        const wrapper = mount(KeyValue, {
            global: {
                plugins: [router]
            },
            props: {
                keyBytes: testBytes
            },
        });

        expect(wrapper.text()).toBe("0x000102030405060708090A0B0C0D0E0F Copy")

        wrapper.unmount()
    });

    it("props.keyBytes unset, showNone=false", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(KeyValue, {
            global: {
                plugins: [router]
            },
            props: {},
        });

        expect(wrapper.text()).toBe("")

        wrapper.unmount()
    });

    it("props.keyBytes unset, showNone=true", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(KeyValue, {
            global: {
                plugins: [router]
            },
            props: {
                showNone: true
            },
        });

        expect(wrapper.text()).toBe("None")

        wrapper.unmount()
    });

    it("should display 'None' with a mention on the line below", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(KeyValue, {
            global: {
                plugins: [router]
            },
            props: {
                showNone: true,
                noneExtra: "This should be displayed below None"
            },
        });

        expect(wrapper.text()).toBe("None This should be displayed below None")

        wrapper.unmount()
    });
});
