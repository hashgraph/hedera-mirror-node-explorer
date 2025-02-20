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

        expect(wrapper.text()).toBe("0x000102030405060708090A0B0C0D0E0FCopy")

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

        expect(wrapper.text()).toBe("NoneThis should be displayed below None")

        wrapper.unmount()
    });
});
