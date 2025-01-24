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
import {SAMPLE_CREATETOPIC_TRANSACTIONS} from "../Mocks";
import Topics from "@/pages/Topics.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import TopicTable from "@/components/topic/TopicTable.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("Topics.vue", () => {

    test("no props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios)

        const matcher = "api/v1/transactions"
        mock.onGet(matcher).reply(200, SAMPLE_CREATETOPIC_TRANSACTIONS)

        const wrapper = mount(Topics, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.text())

        const card = wrapper.findComponent(DashboardCardV2)
        expect(card.exists()).toBe(true)
        expect(card.text()).toMatch(RegExp("^Recent Topics"))

        const table = card.findComponent(TopicTable)
        expect(table.exists()).toBe(true)
        expect(table.get('thead').text()).toBe("Topic Created Memo")
        expect(table.get('tbody').text()).toBe(
            "0.0.750040" +
            "6:14:56.3105 PMMar 7, 2022, UTC" +
            "None"
            +
            "0.0.749794" +
            "3:14:06.1051 PMMar 7, 2022, UTC" +
            "Mirror Node acceptance test: 2022-03-07T15:14:18.167555058Z Create Topic"
        )

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

});
