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

import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {SAMPLE_COINGECKO, SAMPLE_CONTRACT, SAMPLE_CONTRACT_AS_ACCOUNT, SAMPLE_CONTRACT_DUDE} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import ContractDetails from "@/pages/ContractDetails.vue";
import {HMSF} from "@/utils/HMSF";
import NotificationBanner from "@/components/NotificationBanner.vue";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

HMSF.forceUTC = true

describe("ContractDetails.vue", () => {

    it("Should display contract details", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT);

        const matcher2 = "/api/v1/accounts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher4 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher4).reply(200, SAMPLE_COINGECKO);

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: SAMPLE_CONTRACT.contract_id
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + SAMPLE_CONTRACT.contract_id))
        expect(wrapper.get("#balanceValue").text()).toBe("2.00000000$0.4921")
        expect(wrapper.get("#keyValue").text()).toBe("4210 5082 0e14 85ac dd59 7260 88e0 e4a2 130e bbbb 7000 9f64 0ad9 5c78 dd5a 7b38Copy to ClipboardED25519")
        expect(wrapper.get("#memoValue").text()).toBe("Mirror Node acceptance test: 2022-03-07T15:09:15.228564328Z Create contract")
        expect(wrapper.get("#aliasValue").text()).toBe("1220 0000 fc06 34e2 ab45 5eff 393f 0481 9efa 262f e5e6 ab1c 7ed1 d4f8 5fbc d8e6 e296Copy to Clipboard")
        expect(wrapper.get("#expiresAtValue").text()).toBe("None")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("90 days")
        expect(wrapper.get("#obtainerValue").text()).toBe("None")
        expect(wrapper.get("#proxyAccountValue").text()).toBe("None")
        expect(wrapper.get("#validFromValue").text()).toBe("3:09:15.9474 PMMar 7, 2022")
        expect(wrapper.get("#validUntilValue").text()).toBe("None")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.749773")
        expect(wrapper.get("#solidityValue").text()).toBe("None")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address0000 0000 0000 0000 0000 0000 0000 0000 000b 70cfCopy to Clipboard")

    });

    it("Should update when contract id changes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract1 = SAMPLE_CONTRACT
        let matcher1 = "/api/v1/contracts/" + contract1.contract_id
        mock.onGet(matcher1).reply(200, contract1);

        let matcher2 = "/api/v1/accounts/" + contract1.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher4 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher4).reply(200, SAMPLE_COINGECKO);

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: SAMPLE_CONTRACT.contract_id
            },
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + SAMPLE_CONTRACT.contract_id))

        expect(wrapper.findComponent(NotificationBanner).exists()).toBe(false)

        expect(wrapper.get("#keyValue").text()).toBe("4210 5082 0e14 85ac dd59 7260 88e0 e4a2 130e bbbb 7000 9f64 0ad9 5c78 dd5a 7b38Copy to ClipboardED25519")
        expect(wrapper.get("#memoValue").text()).toBe("Mirror Node acceptance test: 2022-03-07T15:09:15.228564328Z Create contract")
        expect(wrapper.get("#aliasValue").text()).toBe("1220 0000 fc06 34e2 ab45 5eff 393f 0481 9efa 262f e5e6 ab1c 7ed1 d4f8 5fbc d8e6 e296Copy to Clipboard")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.749773")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address0000 0000 0000 0000 0000 0000 0000 0000 000b 70cfCopy to Clipboard")

        const contract2 = SAMPLE_CONTRACT_DUDE
        matcher1 = "/api/v1/contracts/" + contract2.contract_id
        mock.onGet(matcher1).reply(200, contract2);

        matcher2 = "/api/v1/accounts/" + contract2.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        await wrapper.setProps({
            contractId: SAMPLE_CONTRACT_DUDE.contract_id ?? undefined
        })
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + SAMPLE_CONTRACT_DUDE.contract_id))
        expect(wrapper.get("#keyValue").text()).toBe("None")
        expect(wrapper.get("#memoValue").text()).toBe("None")
        expect(wrapper.get("#aliasValue").text()).toBe("1220 0000 fc06 34e2 ab45 5eff 393f 0481 9efa 262f e5e6 ab1c 7ed1 d4f8 5fbc d8e6 e296Copy to Clipboard")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.803267")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address0000 0000 0000 0000 0000 0000 0000 0000 000c 41dfCopy to Clipboard")

    });

    it("Should display notification of grace period", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract = SAMPLE_CONTRACT_DUDE
        const matcher1 = "/api/v1/contracts/" + contract.contract_id
        mock.onGet(matcher1).reply(200, contract);

        const matcher2 = "/api/v1/accounts/" + contract.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher4 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher4).reply(200, SAMPLE_COINGECKO);

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: contract.contract_id
            },
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + SAMPLE_CONTRACT_DUDE.contract_id))

        const banner = wrapper.findComponent(NotificationBanner)
        expect(banner.exists()).toBe(true)
        expect(banner.text()).toBe("Contract has expired and is in grace period")
    });

    it("Should detect invalid contract ID", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const invalidContractId = "0.0.0.1000"
        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: invalidContractId
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.get("#notificationBanner").text()).toBe("Invalid contract ID: " + invalidContractId)
    });
});







