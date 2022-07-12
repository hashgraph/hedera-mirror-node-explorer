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
import TimestampValue from "@/components/values/TimestampValue.vue";
import {HMSF} from "@/utils/HMSF";

HMSF.forceUTC = true

describe("TimestampValue.vue", () => {

    //
    // timestamp undefined
    //

    it("blobValue undefined, showNone == false", async () => {

        const wrapper = mount(TimestampValue, {
            global: {
                plugins: [router]
            },
            props: {
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe("")
    })

    it("blobValue undefined, showNone == true", async () => {

        const wrapper = mount(TimestampValue, {
            global: {
                plugins: [router]
            },
            props: {
                showNone: true
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe("None")
    })

    //
    // seconds
    //

    const TIMESTAMP_SECONDS = "1613954653.165071000"
    // GMT: Monday 22 February 2021 00:44:13.165
    // https://www.epochconverter.com

    const TIMESTAMP_STRING = "12:44:13.1650 AMFeb 22, 2021, UTC"

    it("blobValue undefined, nano == false", async () => {

        const wrapper = mount(TimestampValue, {
            global: {
                plugins: [router]
            },
            props: {
                timestamp: TIMESTAMP_SECONDS
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe(TIMESTAMP_STRING)
    })

    //
    // nanoseconds
    //

    const TIMESTAMP_NANOS = "1613954653165071000"

    it("blobValue undefined, nano == true", async () => {

        const wrapper = mount(TimestampValue, {
            global: {
                plugins: [router]
            },
            props: {
                timestamp: TIMESTAMP_NANOS,
                nano: true
            },
        });

        await flushPromises()

        expect(wrapper.text()).toBe(TIMESTAMP_STRING)
    })


})

