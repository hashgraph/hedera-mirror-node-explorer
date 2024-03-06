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
import router from "@/router";
import {flushPromises, mount} from "@vue/test-utils";
import Tabs from "@/components/Tabs.vue";

describe("Tabs.vue", () => {

    test("nominal case with 3 IDs and 3 labels", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const tabIds = ['tab1', 'tab2', 'tab3']
        const tabLabels = ['label1', 'label2', 'label3']
        const selectedTab = 2

        const wrapper = mount(Tabs, {
            global: {
                plugins: [router]
            }, props: {
                selectedTab: tabIds[selectedTab],
                tabIds: tabIds,
                tabLabels: tabLabels,
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const tabs = wrapper.findAll('li')
        expect(tabs.length).toBe(tabIds.length)

        tabIds.forEach((id, index) => expect(wrapper.get('#tab-' + id).text()).toBe(tabLabels[index]))

        expect(tabs[selectedTab].attributes('class')).toContain('is-active')

        wrapper.unmount()
    })

    test("case where selected tab is not one of the IDs", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const tabIds = ['tab1', 'tab2', 'tab3']
        const tabLabels = ['label1', 'label2', 'label3']

        const wrapper = mount(Tabs, {
            global: {
                plugins: [router]
            }, props: {
                selectedTab: 'unknown',
                tabIds: tabIds,
                tabLabels: tabLabels,
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const tabs = wrapper.findAll('li')

        expect(tabs.length).toBe(tabIds.length)

        tabIds.forEach((id, index) => expect(wrapper.get('#tab-' + id).text()).toBe(tabLabels[index]))

        expect(tabs[0].attributes('class')).toContain('is-active')

        wrapper.unmount()
    })

    test("test with 3 IDs and only 2 labels", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const tabIds = ['tab1', 'tab2', 'tab3']
        const tabLabels = ['label1', 'label2']
        const selectedTab = 2

        const wrapper = mount(Tabs, {
            global: {
                plugins: [router]
            }, props: {
                selectedTab: tabIds[selectedTab],
                tabIds: tabIds,
                tabLabels: tabLabels,
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const tabs = wrapper.findAll('li')

        expect(tabs.length).toBe(tabIds.length)

        tabIds.forEach((id, index) => {
            if (tabLabels[index] != undefined) {
                expect(wrapper.get('#tab-' + id).text()).toBe(tabLabels[index])
            } else {
                expect(wrapper.get('#tab-' + id).text()).toBe(tabIds[index])
            }
        })

        expect(tabs[selectedTab].attributes('class')).toContain('is-active')

        wrapper.unmount()
    })

    test("test with 3 IDs and no labels", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const tabIds = ['tab1', 'tab2', 'tab3']
        const tabLabels = ['label1', 'label2']
        const selectedTab = 2

        const wrapper = mount(Tabs, {
            global: {
                plugins: [router]
            }, props: {
                selectedTab: tabIds[selectedTab],
                tabIds: tabIds,
                tabLabels: tabLabels,
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const tabs = wrapper.findAll('li')

        expect(tabs.length).toBe(tabIds.length)

        tabIds.forEach((id, index) => {
            if (tabLabels[index] != undefined) {
                expect(wrapper.get('#tab-' + id).text()).toBe(tabLabels[index])
            } else {
                expect(wrapper.get('#tab-' + id).text()).toBe(tabIds[index])
            }
        })

        expect(tabs[selectedTab].attributes('class')).toContain('is-active')

        wrapper.unmount()
    })

})

