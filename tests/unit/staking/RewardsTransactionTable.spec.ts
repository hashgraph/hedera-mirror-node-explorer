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
import {SAMPLE_REWARDS_TRANSACTIONS} from "../Mocks";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import RewardsTransactionTable from "@/components/staking/RewardsTransactionTable.vue";
import {RewardsTransactionTableController} from "@/components/transaction/RewardsTransactionTableController";
import {ref} from "vue";

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

describe("RewardsTransactionTable.vue", () => {

    it.skip("should display all rewards transactions", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const accountId = SAMPLE_REWARDS_TRANSACTIONS.transactions[1].transfers[3].account
        const tableController = new RewardsTransactionTableController(ref(accountId), ref(42))
        const wrapper = mount(RewardsTransactionTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                narrowed: true,
                controller: tableController,
            },
        })
        tableController.mounted.value = true
        await flushPromises()

        // console.log(wrapper.text())
        // console.log(wrapper.html())

        expect(wrapper.find('thead').text()).toBe("Time ID Type Amount Rewarded")
        expect(wrapper.find('tbody').text()).toBe(
            "1:27:39.5585 PMMar 8, 2022, UTC" + "0.0.14622@1646746046.722961649" + "CRYPTO TRANSFER" + "1.23456789" +
            "3:38:49.5343 PMAug 15, 2022, UTC" + "0.0.47813131@1660577918.385318328" + "CRYPTO UPDATE ACCOUNT" + "23.34450720" +
            "1:27:39.0402 PMMar 8, 2022, UTC" + "0.0.19852@1646746046.457048377" + "CRYPTO TRANSFER" + "2.34567890"
        )
    });

});
