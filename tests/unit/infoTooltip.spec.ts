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
import {flushPromises, mount} from "@vue/test-utils";
import InfoTooltip from "@/components/InfoTooltip.vue";
import router from "@/router";
import Oruga from "@oruga-ui/oruga-next";

describe("InfoTooltip.vue", () => {

    const sampleInfoLabel = 'Sample information label'
    const sampleWarningLabel = 'Sample warning label'
    const infoIconClass = 'lucide-info-icon'
    const warningIconClass = 'lucide-triangle-alert-icon'

    test("InfoTooltip with information message", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(InfoTooltip, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                label: sampleInfoLabel,
            },
        })

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toBe(sampleInfoLabel)

        const icon = wrapper.get('svg')
        expect(icon.attributes('class')).toContain(infoIconClass)

        wrapper.unmount()
    })

    test("InfoTooltip with warning message", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(InfoTooltip, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                warningLabel: sampleWarningLabel,
            },
        })

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toBe(sampleWarningLabel)

        const icon = wrapper.get('svg')
        expect(icon.attributes('class')).toContain(warningIconClass)

        wrapper.unmount()
    })

    test("InfoTooltip with both warning and info message", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(InfoTooltip, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                label: sampleInfoLabel,
                warningLabel: sampleWarningLabel,
            },
        })

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toBe(sampleWarningLabel)

        const icon = wrapper.get('svg')
        expect(icon.attributes('class')).toContain(warningIconClass)

        wrapper.unmount()
    })

    test("InfoTooltip with no message", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(InfoTooltip, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
            },
        })

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toBe('')
        expect(wrapper.find('svg').exists()).toBe(false)

        wrapper.unmount()
    })

})

