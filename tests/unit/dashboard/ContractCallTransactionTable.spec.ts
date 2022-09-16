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
import Oruga from "@oruga-ui/oruga-next";
import ContractCallTransactionTable from "@/components/dashboard/ContractCallTransactionTable.vue";
import {HMSF} from "@/utils/HMSF";
import {TransactionType} from "@/schemas/HederaSchemas";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
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

describe("ContractCallTransactionTable.vue", () => {

    test.skip("no accountIdFilter", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const controller = new TransactionTableController(ref(null), ref(6), false)
        controller.transactionType.value = TransactionType.CONTRACTCALL
        const wrapper = mount(ContractCallTransactionTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                controller: controller
            },
        });
        controller.mounted.value = true

        await flushPromises()
        // console.log(wrapper.find('thead').text())
        // console.log(wrapper.find('tbody').text())

        expect(wrapper.find('thead').text()).toBe("ID Content Time")
        expect(wrapper.find('tbody').text()).toBe(
            "0.0.950@1646665756.235554077" +
            "Contract ID: 0.0.749774" +
            "3:09:26.5747 PMMar 7, 2022, UTC" +
            "0.0.950@1646664143.028737238" +
            "Contract ID: 0.0.749723" +
            "2:42:34.8669 PMMar 7, 2022, UTC"
        )
    });

});
