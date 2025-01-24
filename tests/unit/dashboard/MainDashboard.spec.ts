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

import {describe, expect, test} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {
    SAMPLE_CONTRACTCALL_TRANSACTIONS,
    SAMPLE_MESSAGE_TRANSACTIONS,
    SAMPLE_NETWORK_EXCHANGERATE,
    SAMPLE_NETWORK_SUPPLY,
    SAMPLE_TOKEN,
    SAMPLE_TOPIC_MESSAGES,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import MainDashboard from "@/pages/MainDashboard.vue";
import HbarMarketDashboard from "@/components/dashboard/HbarMarketDashboard.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import CryptoTransactionTable from "@/components/dashboard/CryptoTransactionTable.vue";
import ContractCallTransactionTable from "@/components/dashboard/ContractCallTransactionTable.vue";
import MessageTransactionTable from "@/components/dashboard/MessageTransactionTable.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import {TransactionType} from "@/schemas/MirrorNodeSchemas";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("MainDashboard.vue", () => {

    test("no props", async () => {

        await router.push({name: "MainDashboard", params: {network: 'mainnet'}})

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/transactions"
        let body = {params: {limit: 5, order: 'desc', transactiontype: TransactionType.CRYPTOTRANSFER,}}
        mock.onGet(matcher1, body).reply(200, SAMPLE_TRANSACTIONS)
        body = {params: {limit: 5, order: 'desc', transactiontype: TransactionType.CONSENSUSSUBMITMESSAGE,}}
        mock.onGet(matcher1, body).reply(200, SAMPLE_MESSAGE_TRANSACTIONS)
        body = {params: {limit: 5, order: 'desc', transactiontype: TransactionType.CONTRACTCALL,}}
        mock.onGet(matcher1, body).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS)

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN)

        const matcher3 = "/api/v1/network/supply"
        mock.onGet(matcher3).reply(200, SAMPLE_NETWORK_SUPPLY);

        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher5 = "/api/v1/topics/messages/"
        mock.onGet(matcher5 + SAMPLE_MESSAGE_TRANSACTIONS.transactions[0].consensus_timestamp)
            .reply(200, SAMPLE_TOPIC_MESSAGES.messages[0]);
        mock.onGet(matcher5 + SAMPLE_MESSAGE_TRANSACTIONS.transactions[1].consensus_timestamp)
            .reply(200, SAMPLE_TOPIC_MESSAGES.messages[1]);

        const wrapper = mount(MainDashboard, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.html())

        const dash = wrapper.findComponent(HbarMarketDashboard)
        expect(dash.exists()).toBe(true)
        expect(dash.text()).toBe(
            "$0.2460" +
            "0.00%" +
            "HBAR PRICE" +
            "$5,186,816,738" +
            "0.00%" +
            "HBAR MARKET CAP" +
            "21,084,620,884.43" +
            "HBAR RELEASED" +
            "50,000,000,000" +
            "HBAR TOTAL")

        const cards = wrapper.findAllComponents(DashboardCardV2)
        expect(cards.length).toBe(3)

        expect(cards[0].text()).toMatch(RegExp("^Crypto Transfers"))
        expect(cards[0].findComponent(PlayPauseButton).exists()).toBe(true)
        const t0 = cards[0].findComponent(CryptoTransactionTable)
        expect(t0.exists()).toBe(true)
        expect(t0.get('thead').text()).toBe("ID Content Time")
        expect(t0.get('tbody').text()).toBe(
            "0.0.29624024@1646025139.1529014980.0.29624024\n\n" +
            "123423\n\n" +
            "0.0.296939115:12:31.6676 AMFeb 28, 2022, UTC"
        )

        expect(cards[1].text()).toMatch(RegExp("^Smart Contract Calls"))
        expect(cards[1].findComponent(PlayPauseButton).exists()).toBe(true)
        const t1 = cards[1].findComponent(ContractCallTransactionTable)
        expect(t1.exists()).toBe(true)
        expect(t1.get('thead').text()).toBe("ID Content Time")
        expect(t1.get('tbody').text()).toBe(
            "0.0.950@1646665756.235554077" + "Contract ID: 0.0.749774" + "3:09:26.5747 PMMar 7, 2022, UTC" +
            "0.0.950@1646664143.028737238" + "Contract ID: 0.0.749723" + "2:42:34.8669 PMMar 7, 2022, UTC"
        )

        expect(cards[2].text()).toMatch(RegExp("^HCS Messages"))
        expect(cards[2].findComponent(PlayPauseButton).exists()).toBe(true)
        const t2 = cards[2].findComponent(MessageTransactionTable)
        expect(t2.exists()).toBe(true)
        expect(t2.get('thead').text()).toBe("Topic ID Content Time")
        expect(t2.get('tbody').text()).toBe(
            "0.0.120438" + "backgroundMessage" + "1:59:03.9969 PMMar 8, 2022, UTC" +
            "0.0.120438" + "backgroundMessage" + "1:59:03.9622 PMMar 8, 2022, UTC"
        )

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });
});
