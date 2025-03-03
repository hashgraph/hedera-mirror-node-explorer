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
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import AccountLink from "@/components/values/link/AccountLink.vue";
import {SAMPLE_NETWORK_NODES} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("AccountLink.vue", () => {

    it("props.accountId set ; no extra", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/network/nodes"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);

        const testAccountId = "0.0.42"
        const wrapper = mount(AccountLink, {
            global: {
                plugins: [router]
            },
            props: {
                accountId: testAccountId
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(testAccountId)
        expect(wrapper.findComponent("a").attributes("href")).toMatch(
            RegExp("/account/" + testAccountId)
        )

        wrapper.unmount()
        await flushPromises()
        mock.restore()
    });


    it("props.accountId unset, nullLabel unset", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(AccountLink, {
            global: {
                plugins: [router]
            },
            props: {},
        });

        expect(wrapper.text()).toBe("None")
        expect(wrapper.findComponent("a").exists()).toBe(false)

        wrapper.unmount()
        await flushPromises()
    });


    it("props.accountId unset, nullLabel set", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(AccountLink, {
            global: {
                plugins: [router]
            },
            props: {
                nullLabel: "MINT"
            },
        });

        expect(wrapper.text()).toBe("MINT")
        expect(wrapper.findComponent("a").exists()).toBe(false)

        wrapper.unmount()
        await flushPromises()
    });


    it("props.extra set", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/network/nodes"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);

        const testAccountId = "0.0.4"
        const testExtra = "Hosted by Hedera | East Coast, USA"
        const wrapper = mount(AccountLink, {
            global: {
                plugins: [router]
            },
            props: {
                accountId: testAccountId,
                showExtra: true
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe(testAccountId + testExtra)
        expect(wrapper.find(".h-is-extra-text").text()).toBe(testExtra)

        wrapper.unmount()
        await flushPromises()
        mock.restore()
    });


});
