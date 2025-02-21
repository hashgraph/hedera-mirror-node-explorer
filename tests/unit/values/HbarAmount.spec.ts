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


/*
    Bookmarks
        https://test-utils.vuejs.org/api/

 */

import {afterAll, beforeAll, describe, expect, test} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils";
import HbarAmount from "@/components/values/HbarAmount.vue";
import {SAMPLE_NETWORK_EXCHANGERATE} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("HbarAmount.vue ", () => {

    const mock = new MockAdapter(axios);

    beforeAll(() => {
        const matcher = "api/v1/network/exchangerate"
        mock.onGet(matcher).reply(200, SAMPLE_NETWORK_EXCHANGERATE);
    })

    afterAll(() => {
        mock.restore()
    })

    test("with amount set", async () => {

        const testTinybarAmount = 42
        const expectedHbarAmount = "0.00000042ℏ"

        const wrapper = mount(HbarAmount, {
            props: {
                amount: testTinybarAmount
            },
        });

        expect(wrapper.text()).toBe(expectedHbarAmount)
        expect(wrapper.get('#hbar-amount').classes('h-is-low-contrast')).toBe(false)

        wrapper.unmount()
    });

    test.skip("with amount set and showExtra", async () => {

        const testTinybarAmount = 42
        const expectedHbarAmount = "0.00000042ℏ"
        const expectedDollarAmount = "$0.00001"

        const wrapper = mount(HbarAmount, {
            props: {
                amount: testTinybarAmount,
                showExtra: true,
                timestamp: "0"
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe(expectedHbarAmount + expectedDollarAmount)
        expect(wrapper.get(".h-is-extra-text").classes('h-is-smaller')).toBe(true)
        expect(wrapper.get(".h-is-extra-text").text()).toBe(expectedDollarAmount)

        wrapper.unmount()
        await flushPromises()
    });

    test.skip("with amount set and showExtra and not smallExtra", async () => {

        const testTinybarAmount = 42
        const expectedHbarAmount = "0.00000042ℏ"
        const expectedDollarAmount = "$0.00001"

        const wrapper = mount(HbarAmount, {
            props: {
                amount: testTinybarAmount,
                showExtra: true,
                smallExtra: false,
                timestamp: "0"
            },
        });

        await flushPromises()
        expect(wrapper.text()).toBe(expectedHbarAmount + expectedDollarAmount)
        expect(wrapper.get(".h-is-extra-text").classes('h-is-smaller')).toBe(false)
        expect(wrapper.get(".h-is-extra-text").text()).toBe(expectedDollarAmount)

        wrapper.unmount()
        await flushPromises()
    });

    test("with amount unset", async () => {

        const expectedHbarAmount = "None"

        const wrapper = mount(HbarAmount, {
            props: {},
        });

        expect(wrapper.text()).toBe(expectedHbarAmount)
        expect(wrapper.find('.has-hbar').exists()).toBe(false)

        wrapper.unmount()
    });

    test("with hideZero and showExtra", async () => {

        const wrapper = mount(HbarAmount, {
            props: {
                amount: 0,
                hideZero: true,
                showExtra: true
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe("")
        expect(() => wrapper.get('.h-is-extra-text')).toThrowError()

        wrapper.unmount()
        await flushPromises()
    });

});
