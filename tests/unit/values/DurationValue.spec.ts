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
import DurationValue from "@/components/values/DurationValue.vue";

describe("DurationValue.vue", () => {

    //
    // timestamp undefined
    //

    it("numberValue / stringValue undefined", async () => {

        const wrapper = mount(DurationValue, {
            global: {
                plugins: [router]
            },
            props: {
            }
        });

        await flushPromises()

        expect(wrapper.text()).toBe("")

        await wrapper.setProps({
            showNone: true
        })

        expect(wrapper.text()).toBe("None")

        const D = 3600 * 3 + 60 * 2 + 42
        const S = "3 hours 2 minutes 42 seconds"
        await wrapper.setProps({
            numberValue: D,
            loading: true
        })
        expect(wrapper.text()).toBe(S)

        const D1 = 3600 * 5 + 60 + 42
        const S1 = "5 hours 1 minute 42 seconds"
        await wrapper.setProps({
            numberValue: undefined,
            stringValue: D1.toString(),
        })
        expect(wrapper.text()).toBe(S1)

        const S2 = "dummy"
        await wrapper.setProps({
            stringValue: S2,
        })
        expect(wrapper.text()).toBe(S2)


    })


})

