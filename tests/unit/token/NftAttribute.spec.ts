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
import NftAttribute from '@/components/token/NftAttribute.vue';
import router from "@/router";
import {HMSF} from "@/utils/HMSF";

/*
  POSSIBLE DISPLAY TYPES:
  ----------------------
    text (default value representation)
    percentage (for integer or number values)
    boost (for integer or number values)
    datetime (for a number which represents the unix timestamp in seconds)
    date (for a number which represents the unix timestamp in seconds)
    color (for a hexadecimal or rgb string color sequence such as #00ff44 or rgb(0,255,0))
*/

HMSF.forceUTC = true

describe("NftAttribute.vue", () => {

    test("NftAttribute containing string with no display type", async () => {

        const wrapper = mount(NftAttribute, {
            global: {
                plugins: [router]
            },
            props: {
                attribute: {
                    trait_type: "String with no type",
                    value: "String attribute"
                }
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe("String with no typeString attribute")

        wrapper.unmount()
        await flushPromises()
    })

    test("NftAttribute containing string with 'text' display type", async () => {

        const wrapper = mount(NftAttribute, {
            global: {
                plugins: [router]
            },
            props: {
                attribute: {
                    trait_type: "String with type 'text",
                    display_type: "text",
                    value: "String attribute"
                }
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe("String with type 'textString attribute")

        wrapper.unmount()
        await flushPromises()
    })

    test("NftAttribute containing number with 'text' display type", async () => {

        const wrapper = mount(NftAttribute, {
            global: {
                plugins: [router]
            },
            props: {
                attribute: {
                    trait_type: "Number",
                    display_type: "text",
                    value: 42
                }
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe("Number42")

        wrapper.unmount()
        await flushPromises()
    })

    test("NftAttribute containing number with 'percentage' display type", async () => {

        const wrapper = mount(NftAttribute, {
            global: {
                plugins: [router]
            },
            props: {
                attribute: {
                    trait_type: "Number with percentage",
                    display_type: "percentage",
                    value: 42
                }
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe("Number with percentage42%")

        wrapper.unmount()
        await flushPromises()
    })

    test("NftAttribute containing unix timestamp with 'text' display type", async () => {

        const wrapper = mount(NftAttribute, {
            global: {
                plugins: [router]
            },
            props: {
                attribute: {
                    trait_type: "DateTime",
                    display_type: "text",
                    value: 732844800
                }
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe("DateTime732844800")

        wrapper.unmount()
        await flushPromises()
    })

    test("NftAttribute containing unix timestamp with 'datetime' display type", async () => {

        const wrapper = mount(NftAttribute, {
            global: {
                plugins: [router]
            },
            props: {
                attribute: {
                    trait_type: "DateTime",
                    display_type: "datetime",
                    value: 732844800
                }
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe("DateTime12:00:00.0000 AMMar 23, 1993, UTC")

        wrapper.unmount()
        await flushPromises()
    })
})

