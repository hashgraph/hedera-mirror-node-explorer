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
import {SAMPLE_ACCOUNTS, SAMPLE_TOKEN} from "../Mocks";
import Accounts from "@/pages/Accounts.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import AccountTable from "@/components/account/AccountTable.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("Accounts.vue", () => {

    test("no props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios as any);

        const matcher1 = "/api/v1/accounts"
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNTS);

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN)

        const wrapper = mount(Accounts, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.text())

        const card = wrapper.findComponent(DashboardCardV2)
        expect((wrapper.vm as any).accountTableController.mounted.value).toBe(true)
        expect(card.exists()).toBe(true)
        expect(card.text()).toMatch(RegExp("^Recent Accounts"))

        const table = card.findComponent(AccountTable)
        expect(table.exists()).toBe(true)
        expect(table.get('thead').text()).toBe("ID CREATED TOKENS MEMO BALANCE")
        expect(table.get('tbody').text()).toBe(
            "0.0.730631" +
            "5:12:31.6676 AMFeb 28, 2022, UTC" +
            "1023423" +
            "None" +
            "23.42647909ℏ"
        )

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect((wrapper.vm as any).accountTableController.mounted.value).toBe(false)
    });

});
