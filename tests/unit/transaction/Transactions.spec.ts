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
import {SAMPLE_TOKEN, SAMPLE_TRANSACTION, SAMPLE_TRANSACTIONS} from "../Mocks";
import Transactions from "@/pages/Transactions.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import TablePageSize from "../../../src/components/transaction/TablePageSize.vue";
import TransactionTable from "@/components/transaction/TransactionTable.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("Transactions.vue", () => {

    test("no props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply(200, SAMPLE_TRANSACTIONS)

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN)

        const wrapper = mount(Transactions, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.text())

        const card = wrapper.findComponent(DashboardCardV2)
        expect(card.exists()).toBe(true)
        expect(card.text()).toMatch(RegExp("^Recent Transactions"))

        const playPause = card.findComponent(PlayPauseButton)
        expect(playPause.exists()).toBe(true)

        const select = card.findComponent(TransactionFilterSelect)
        expect(select.exists()).toBe(true)
        expect(select.text()).toBe(
            "TYPES: ALLCONTRACT CALLCONTRACT CREATECONTRACT DELETECONTRACT UPDATECRYPTO ADD LIVE HASH" +
            "CRYPTO APPROVE ALLOWANCECRYPTO CREATE ACCOUNTCRYPTO DELETE ACCOUNTCRYPTO DELETE ALLOWANCE" +
            "CRYPTO DELETE LIVE HASHCRYPTO TRANSFERCRYPTO UPDATE ACCOUNTETHEREUM TRANSACTIONFILE APPEND" +
            "FILE CREATEFILE DELETEFILE UPDATEFREEZEHCS CREATE TOPICHCS DELETE TOPICHCS SUBMIT MESSAGE" +
            "HCS UPDATE TOPICNODE CREATENODE DELETENODE STAKE UPDATENODE UPDATEPSEUDORANDOM NUMBER GENERATE" +
            "SCHEDULE CREATESCHEDULE DELETESCHEDULE SIGNSYSTEM DELETESYSTEM UNDELETETOKEN AIRDROP" +
            "TOKEN ASSOCIATETOKEN BURNTOKEN CANCEL AIRDROPTOKEN CLAIM AIRDROPTOKEN CREATETOKEN DELETE" +
            "TOKEN DISSOCIATETOKEN FEE SCHEDULE UPDATETOKEN FREEZETOKEN KYC GRANTTOKEN KYC REVOKE" +
            "TOKEN MINTTOKEN PAUSETOKEN REJECTTOKEN UNFREEZETOKEN UNPAUSETOKEN UPDATETOKEN UPDATE NFTS" +
            "TOKEN WIPEUNCHECKED SUBMIT")

        const table = card.findComponent(TransactionTable)
        expect(table.exists()).toBe(true)
        expect(table.get('thead').text()).toBe("ID Type Content Time")
        expect(table.get('tbody').text()).toBe(
            "0.0.29624024@1646025139.152901498CRYPTO TRANSFER0.0.29624024\n\n" +
            "123423\n\n" +
            "0.0.296939115:12:31.6676 AMFeb 28, 2022, UTC"
        )

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    test("without page size selector", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply(200,  {
            "transactions": [
                SAMPLE_TRANSACTION,
                SAMPLE_TRANSACTION,
                SAMPLE_TRANSACTION,
                SAMPLE_TRANSACTION,
                SAMPLE_TRANSACTION,
            ]
        })

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN)

        const wrapper = mount(Transactions, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.text())

        const card = wrapper.findComponent(DashboardCardV2)
        expect(card.exists()).toBe(true)
        expect(card.text()).toMatch(RegExp("^Recent Transactions"))

        const select = card.findComponent(TablePageSize)
        expect(select.exists()).toBe(false)

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    test("page size selector", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios)

        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply(200,  {
            "transactions": [
                SAMPLE_TRANSACTION,
                SAMPLE_TRANSACTION,
                SAMPLE_TRANSACTION,
                SAMPLE_TRANSACTION,
                SAMPLE_TRANSACTION,
                SAMPLE_TRANSACTION,
            ]
        })

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN)

        const wrapper = mount(Transactions, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.text())

        const card = wrapper.findComponent(DashboardCardV2)
        expect(card.exists()).toBe(true)
        expect(card.text()).toMatch(RegExp("^Recent Transactions"))

        const select = card.findComponent(TablePageSize)
        expect(select.exists()).toBe(true)

        expect(select.text()).toBe(
            "5 per page" +
            "10 per page" +
            "15 per page" +
            "20 per page" +
            "50 per pag" +
            "e100 per page")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

});
