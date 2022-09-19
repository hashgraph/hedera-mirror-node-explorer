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
import {SAMPLE_NFTS, SAMPLE_NONFUNGIBLE_DUDE} from "../Mocks";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import NftHolderTable from "@/components/token/NftHolderTable.vue";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {NftHolderTableController} from "@/components/token/NftHolderTableController";
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

describe("NftHolderTable.vue", () => {

    test.skip("with tokenId", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_NONFUNGIBLE_DUDE.token_id
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE_DUDE);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);

        const controller = new NftHolderTableController(ref(testTokenId), ref(42))
        const wrapper = mount(NftHolderTable, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                controller: controller
            },
        });

        await flushPromises()
        // console.log(wrapper.find('thead').text())
        // console.log(wrapper.find('tbody').text())

        expect(wrapper.find('thead').text()).toBe("Serial # Account ID Deleted Modification Time Metadata")
        expect(wrapper.find('tbody').text()).toBe(
            "20.0.700000" +
            "false" +
            "8:56:33.5203 PMMar 6, 2022, UTC" +
            "bafkreib55tplmtanco46tmj75ntattrbynthjoq2nbganqt4p7nr4eg3741" +
            "0.0.700000" +
            "false" +
            "8:52:39.7092 PMMar 6, 2022, UTC" +
            "bafkreibu25ajaankb3bxihulobd27da2inqy6kymtn5mzlct6re7dhoh4m"
        )
    });

});
