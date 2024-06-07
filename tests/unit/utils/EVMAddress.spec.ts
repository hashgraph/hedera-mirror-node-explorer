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

import {describe, test, expect} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils";
import EVMAddress from "@/components/values/EVMAddress.vue";
import router from "@/router";
import Oruga from "@oruga-ui/oruga-next";
import {SAMPLE_ACCOUNT_WITH_NATIVE_EVM_ADDRESS} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("EVMAddress", () => {

    const evmAddress = "0xe6d5514b8de7ef9e5f5c4cc2e8ca0207129deb65"
    const compactAddress = "0xe6…9deb65"
    const longZeroAddress = "0x00000000000000000000000000000000002d21e6"
    const entityId = "0.0.2957798"
    const systemContractAddress = "0x0000000000000000000000000000000000000167"
    const systemContractLabel = "Hedera Token Service System Contract"

    test("Constructing with EVM address and no Hedera ID", async () => {

        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/accounts/" + evmAddress
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT_WITH_NATIVE_EVM_ADDRESS);

        await router.push("/") // To avoid "missing required param 'network'" error
        const wrapper = mount(EVMAddress, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                address: evmAddress
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(`${evmAddress}Copy(${entityId})`)

        wrapper.unmount()
        await flushPromises()
        mock.restore()
    })

    test("Constructing a compact form with EVM address and no Hedera ID", async () => {

        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/accounts/" + evmAddress
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT_WITH_NATIVE_EVM_ADDRESS);

        await router.push("/") // To avoid "missing required param 'network'" error
        const wrapper = mount(EVMAddress, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                address: evmAddress,
                compact: true
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(`${compactAddress}Copy(${entityId})`)

        wrapper.unmount()
        await flushPromises()
        mock.restore()
    })

    test("Constructing with long-zero address and no Hedera ID", async () => {

        const mock = new MockAdapter(axios);
        const matcher2 = "/api/v1/accounts/" + longZeroAddress
        mock.onGet(matcher2).reply(200, SAMPLE_ACCOUNT_WITH_NATIVE_EVM_ADDRESS);

        await router.push("/") // To avoid "missing required param 'network'" error
        const wrapper = mount(EVMAddress, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                address: longZeroAddress
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(`${evmAddress}Copy(${entityId})`)

        wrapper.unmount()
        await flushPromises()
        mock.restore()
    })

    test("Constructing with Hedera ID and EVM address", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error
        const wrapper = mount(EVMAddress, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                address: evmAddress,
                id: entityId,
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(`${evmAddress}Copy(${entityId})`)

        wrapper.unmount()
        await flushPromises()
    })

    test("Constructing with Hedera ID and EVM address, not showing ID and showing type", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error
        const wrapper = mount(EVMAddress, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                address: evmAddress,
                id: entityId,
                showId: false,
                showType: true
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(`${evmAddress}Copy`)

        wrapper.unmount()
        await flushPromises()
    })

    test("Constructing with System Contract address", async () => {

        const abi = require('../../../public/abi/IHederaTokenService.json')
        const mock = new MockAdapter(axios);
        const matcher1 = "http://localhost:3000/abi/IHederaTokenService.json"
        mock.onGet(matcher1).reply(200, abi)

        await router.push("/") // To avoid "missing required param 'network'" error
        const wrapper = mount(EVMAddress, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                address: systemContractAddress,
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(`${systemContractAddress}Copy(${systemContractLabel})`)

        wrapper.unmount()
        await flushPromises()
        mock.restore()
    })

})
