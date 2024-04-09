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

import {describe, test, expect} from 'vitest'
import {flushPromises, mount, VueWrapper} from "@vue/test-utils"
import router from "@/router";
import DurationValue from "@/components/values/DurationValue.vue";

describe("DurationValue.vue", () => {

    //
    // timestamp undefined
    //

    test("numberValue / stringValue undefined", async () => {

        const wrapper = mount(DurationValue, {
            global: {
                plugins: [router]
            },
            props: {}
        });

        await flushPromises()

        expect(wrapper.text()).toBe("")

        await wrapper.setProps({
            showNone: true
        })

        expect(wrapper.text()).toBe("None")

        wrapper.unmount()
        await flushPromises()
    })

    test("various cases of numberValue defined", async () => {

        const wrapper = mount(DurationValue, {
            global: {
                plugins: [router]
            },
            props: {}
        });

        const year = 31536000
        const day = 86400
        const hour = 3600
        const min = 60

        await testBody(wrapper, 170 * year, "170 years")
        await testBody(wrapper, 1 * year, "365 days")
        await testBody(wrapper, 1 * year + 35 * day + 4 * hour + 52 * min + 12, "1y 35d 4h 52min 12s")

        await testBody(wrapper, 35 * day, "35 days")
        await testBody(wrapper, 1 * day, "24h")
        await testBody(wrapper, 1 * day + 4 * hour + 52 * min + 12, "1d 4h 52min 12s")

        await testBody(wrapper, 4 * hour, "4h")
        await testBody(wrapper, 1 * hour, "1h")
        await testBody(wrapper, 1 * hour + 52 * min + 12, "1h 52min 12s")

        await testBody(wrapper, 52 * min, "52min")
        await testBody(wrapper, 1 * min, "1min")
        await testBody(wrapper, 1 * min + 12, "1min 12s")

        await testBody(wrapper, 12, "12s")
        await testBody(wrapper, 1, "1s")

        await testBody(wrapper, 31556888202959784, "Infinite")

        wrapper.unmount()
        await flushPromises()
    })

    test("stringValue defined", async () => {

        const D1 = 3600 * 5 + 60 + 42
        const S1 = "5h 1min 42s"
        const wrapper = mount(DurationValue, {
            global: {
                plugins: [router]
            },
            props: {
                numberValue: undefined,
                stringValue: D1.toString(),
            }
        });
        await flushPromises()

        expect(wrapper.text()).toBe(S1)

        const S2 = "dummy"
        await wrapper.setProps({
            stringValue: S2,
        })
        expect(wrapper.text()).toBe(S2)

        wrapper.unmount()
        await flushPromises()
    })

    test("NaN stringValue", async () => {

        const S1 = "dummy"
        const wrapper = mount(DurationValue, {
            global: {
                plugins: [router]
            },
            props: {
                stringValue: S1,
            }
        });
        await flushPromises()

        expect(wrapper.text()).toBe(S1)

        wrapper.unmount()
        await flushPromises()
    })
})

const testBody = async (w: VueWrapper, d: number, s: string) => {
    await w.setProps({
        numberValue: d,
    })
    await flushPromises()
    expect(w.text()).toBe(s)
}

