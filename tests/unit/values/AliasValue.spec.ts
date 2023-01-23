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
import AliasValue from "@/components/values/AliasValue.vue";

describe("AliasValue.vue", () => {

    it("should display 'None' when no alias value is provided", async () => {

        const wrapper = mount(AliasValue, {
            global: {
                plugins: [router]
            },
            props: {
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe("None")
    })

    const ALIAS_B32 = "CIQEN25ORE2F73TRYSYMMBVPR2HU4PPFGTQENJTIGVLLELP4PZ2M76A"
    const ALIAS_HEX = "1220 46eb ae89 345f ee71 c4b0 c606 af8e 8f4e 3de5 34e0 46a6 6835 56b2 2dfc 7e74 cff8"

    it("should display both base32 and hexa forms of provided alias", async () => {

        const wrapper = mount(AliasValue, {
            global: {
                plugins: [router]
            },
            props: {
                aliasValue: ALIAS_B32
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(ALIAS_HEX + "Copy to Clipboard")
    })
})

