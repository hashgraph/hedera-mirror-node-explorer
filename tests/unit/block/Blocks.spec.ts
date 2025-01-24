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

import {describe, expect, it} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {SAMPLE_BLOCKSRESPONSE} from "../Mocks";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import Blocks from "@/pages/Blocks.vue";
import BlockTable from "@/components/block/BlockTable.vue";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("Blocks.vue", () => {

    it("Should display the BlockTable", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/blocks"
        mock.onGet(matcher1).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(Blocks, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.vm.blockTableController.mounted.value).toBe(true)
        const card = wrapper.findComponent(DashboardCardV2)
        expect(card.exists()).toBe(true)
        expect(card.text()).toMatch(RegExp("^Blocks"))

        const table = card.findComponent(BlockTable)
        expect(table.exists()).toBe(true)
        expect(table.get('thead').text()).toBe("Number Start Time No. Transactions Gas Used")
        expect(table.get('tbody').text()).toBe(
            "25175998" + "6:58:31.3281 AMSep 23, 2022, UTC" + "3" + "0" +
            "25175997" + "6:58:28.2114 AMSep 23, 2022, UTC" + "5" + "0"
        )

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect(wrapper.vm.blockTableController.mounted.value).toBe(false)
    });
});
