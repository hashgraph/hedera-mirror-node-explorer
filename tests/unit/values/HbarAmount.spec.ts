/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

import {flushPromises, mount} from "@vue/test-utils";
import HbarAmount from "@/components/values/HbarAmount.vue";
import {SAMPLE_COINGECKO} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

const mock = new MockAdapter(axios);
const matcher = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
mock.onGet(matcher).reply(200, SAMPLE_COINGECKO);

describe("HbarAmount.vue ", () => {

    test("with amount set", async () => {

        const testTinybarAmount = 42
        const expectedHbarAmount = "0.00000042"

        const wrapper = mount(HbarAmount, {
            props: {
                amount: testTinybarAmount
            },
        });

        expect(wrapper.text()).toBe(expectedHbarAmount)
        expect(wrapper.get('.has-hbar').classes('has-text-grey')).toBe(false)
    });

    test("with amount set and showExtra", async () => {

        const testTinybarAmount = 42
        const expectedHbarAmount = "0.00000042"
        const expectedDollarAmount = "$0.0001"

        const wrapper = mount(HbarAmount, {
            props: {
                amount: testTinybarAmount,
                showExtra: true
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe(expectedHbarAmount + expectedDollarAmount)
        expect(wrapper.get(".h-is-extra-text").classes('h-is-smaller')).toBe(true)
        expect(wrapper.get(".h-is-extra-text").text()).toBe(expectedDollarAmount)
    });

    test("with amount set and showExtra and not smallExtra", async () => {

        const testTinybarAmount = 42
        const expectedHbarAmount = "0.00000042"
        const expectedDollarAmount = "$0.0001"

        const wrapper = mount(HbarAmount, {
            props: {
                amount: testTinybarAmount,
                showExtra: true,
                smallExtra: false
            },
        });

        await flushPromises()
        expect(wrapper.text()).toBe(expectedHbarAmount + expectedDollarAmount)
        expect(wrapper.get(".h-is-extra-text").classes('h-is-smaller')).toBe(false)
        expect(wrapper.get(".h-is-extra-text").text()).toBe(expectedDollarAmount)
    });

    test("with amount unset", async () => {

        const expectedHbarAmount = "None"

        const wrapper = mount(HbarAmount, {
            props: {
            },
        });

        expect(wrapper.text()).toBe(expectedHbarAmount)
        expect(wrapper.find('.has-hbar').exists()).toBe(false)
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
    });

});
