/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
import {
    SAMPLE_CONTRACT,
    SAMPLE_CONTRACT_AS_ACCOUNT,
    SAMPLE_CONTRACT_DELETED,
    SAMPLE_CONTRACT_DUDE,
    SAMPLE_CONTRACT_RESULTS,
    SAMPLE_NETWORK_EXCHANGERATE,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import ContractDetails from "@/pages/ContractDetails.vue";
import {HMSF} from "@/utils/HMSF";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {TransactionID} from "@/utils/TransactionID";
import {CacheUtils} from "@/utils/cache/CacheUtils";
import ContractResultTable from "@/components/contract/ContractResultTable.vue";

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

    beforeEach(() => {
        CacheUtils.clearAll()
    })

    it("Should display contract details", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT);

        const matcher2 = "/api/v1/accounts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher5 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

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

        expect(wrapper.text()).toMatch(RegExp("^Contract Contract ID:" + SAMPLE_CONTRACT.contract_id))
        expect(wrapper.get("#balanceValue").text()).toBe("2.00000000$0.4921")
        expect(wrapper.get("#keyValue").text()).toBe("4210 5082 0e14 85ac dd59 7260 88e0 e4a2 130e bbbb 7000 9f64 0ad9 5c78 dd5a 7b38Copy to ClipboardED25519")
        expect(wrapper.get("#memoValue").text()).toBe("Mirror Node acceptance test: 2022-03-07T15:09:15.228564328Z Create contract")
        expect(wrapper.get("#createTransactionValue").text()).toBe(TransactionID.normalize(SAMPLE_TRANSACTION.transaction_id))
        expect(wrapper.get("#expiresAtValue").text()).toBe("None")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("90 days")
        expect(wrapper.get("#autoRenewAccountValue").text()).toBe("0.0.730632")
        expect(wrapper.get("#maxAutoAssociationValue").text()).toBe("0")
        expect(wrapper.get("#obtainerValue").text()).toBe("None")
        expect(wrapper.get("#proxyAccountValue").text()).toBe("None")
        expect(wrapper.get("#validFromValue").text()).toBe("3:09:15.9474 PMMar 7, 2022, UTC")
        expect(wrapper.get("#validUntilValue").text()).toBe("None")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.749773")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address:0x00000000000000000000000000000000000b70cfCopy to Clipboard")

        expect(wrapper.findComponent(ContractResultTable).exists()).toBe(true)
    });

    it("Should display recent contract calls table in contract details", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT);

        const matcher2 = "/api/v1/accounts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher5 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

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

        expect(wrapper.text()).toMatch(RegExp("^Contract Contract ID:" + SAMPLE_CONTRACT.contract_id))

        const resultTable = wrapper.findComponent(ContractResultTable)
        expect(resultTable.exists()).toBe(true)

        expect(resultTable.find('thead').text()).toBe("Time From Error Message Transfer Amount")
        const rows = wrapper.find('tbody').findAll('tr')

        let cells = rows[0].findAll('td')
        expect(cells[0].text()).toBe("9:11:37.9739 AMFeb 3, 2023, UTC")
        expect(cells[1].text()).toBe("0x00000000000000000000000000000000000004ec(0.0.1260)")
        expect(cells[2].text()).toBe("None")
        expect(cells[3].text()).toBe("0.00000000")

        cells = rows[1].findAll('td')
        expect(cells[0].text()).toBe("9:09:24.5852 AMFeb 3, 2023, UTC")
        expect(cells[1].text()).toBe("0x00000000000000000000000000000000000004ec(0.0.1260)")
        expect(cells[2].text()).toBe("None")
        expect(cells[3].text()).toBe("0.00000000")
    });

    it("Should update when contract id changes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract1 = SAMPLE_CONTRACT
        let matcher1 = "/api/v1/contracts/" + contract1.contract_id
        mock.onGet(matcher1).reply(200, contract1);

        let matcher2 = "/api/v1/accounts/" + contract1.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        let matcher5 = "/api/v1/contracts/" + contract1.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

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

        expect(wrapper.text()).toMatch(RegExp("^Contract Contract ID:" + SAMPLE_CONTRACT.contract_id))

        expect(wrapper.findComponent(NotificationBanner).exists()).toBe(false)

        expect(wrapper.get("#keyValue").text()).toBe("4210 5082 0e14 85ac dd59 7260 88e0 e4a2 130e bbbb 7000 9f64 0ad9 5c78 dd5a 7b38Copy to ClipboardED25519")
        expect(wrapper.get("#memoValue").text()).toBe("Mirror Node acceptance test: 2022-03-07T15:09:15.228564328Z Create contract")
        expect(wrapper.get("#autoRenewAccountValue").text()).toBe("0.0.730632")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.749773")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address:0x00000000000000000000000000000000000b70cfCopy to Clipboard")

        const contract2 = SAMPLE_CONTRACT_DUDE
        matcher1 = "/api/v1/contracts/" + contract2.contract_id
        mock.onGet(matcher1).reply(200, contract2);

        matcher2 = "/api/v1/accounts/" + contract2.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        matcher5 = "/api/v1/contracts/" + contract2.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

        await wrapper.setProps({
            contractId: SAMPLE_CONTRACT_DUDE.contract_id ?? undefined
        })
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("Contract Contract ID:" + SAMPLE_CONTRACT_DUDE.contract_id))
        expect(wrapper.get("#keyValue").text()).toBe("None")
        expect(wrapper.get("#maxAutoAssociationValue").text()).toBe("None")
        expect(wrapper.get("#memoValue").text()).toBe("None")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.803267")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address:0x00000000000000000000000000000000000b70cfCopy to Clipboard")

    });

    // TODO: re-enable after Feb 9th
    it.skip("Should display notification of grace period", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract = SAMPLE_CONTRACT_DUDE
        const matcher1 = "/api/v1/contracts/" + contract.contract_id
        mock.onGet(matcher1).reply(200, contract);

        const matcher2 = "/api/v1/accounts/" + contract.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher5 = "/api/v1/contracts/" + contract.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

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

    // TODO: remove after Feb 9th
    it("Should NOT display notification of grace period", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract = SAMPLE_CONTRACT_DUDE
        const matcher1 = "/api/v1/contracts/" + contract.contract_id
        mock.onGet(matcher1).reply(200, contract);

        const matcher2 = "/api/v1/accounts/" + contract.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher5 = "/api/v1/contracts/" + contract.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

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

        expect(wrapper.text()).toMatch(RegExp("^Contract Contract ID:" + SAMPLE_CONTRACT_DUDE.contract_id))

        const banner = wrapper.findComponent(NotificationBanner)
        expect(banner.exists()).toBe(false)
    });

    it("Should display notification of deleted contract", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract = SAMPLE_CONTRACT_DELETED
        const matcher1 = "/api/v1/contracts/" + contract.contract_id
        mock.onGet(matcher1).reply(200, contract);

        const matcher2 = "/api/v1/accounts/" + contract.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher5 = "/api/v1/contracts/" + contract.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

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

        expect(wrapper.text()).toMatch(RegExp("^Contract Contract ID:" + contract.contract_id))

        const banner = wrapper.findComponent(NotificationBanner)
        expect(banner.exists()).toBe(true)
        expect(banner.text()).toBe("Contract is deleted")
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







