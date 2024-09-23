// noinspection DuplicatedCode

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

    test("test with mutating IDs and labels", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        //
        // Stars with no tabs
        //

        const tabIds = []
        const tabLabels = []

        const wrapper = mount(Tabs, {
            global: {
                plugins: [router]
            }, props: {
                tabIds: tabIds,
                tabLabels: tabLabels,
            },
        })

        await flushPromises()

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const tabs = wrapper.findAll('li')
        expect(tabs.length).toBe(0)

        // expect(tabs[selectedTab].attributes('class')).not.toContain('is-active')


        //
        // Add three tabs   => tab1 is automatically selected
        //
        const tabIds2 = ['tab1', 'tab2', 'tab3']
        const tabLabels2 = ['label1', 'label2', 'label3']
        await wrapper.setProps({
            tabIds: tabIds2,
            tabLabels: tabLabels2,
        })

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const tabs2 = wrapper.findAll('li')
        expect(tabs2.length).toBe(tabIds2.length)
        expect(tabs2[0].text()).toContain("label1")

        expect(tabs2[0].attributes('class')).toContain('is-active')

        //
        // Removes tab2 => tab1 remains selected
        //
        const tabIds3 = ['tab1', 'tab3']
        const tabLabels3 = ['label1', 'label3']
        await wrapper.setProps({
            tabIds: tabIds3,
            tabLabels: tabLabels3,
        })

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const tabs3 = wrapper.findAll('li')
        expect(tabs3.length).toBe(tabIds3.length)

        expect(tabs3[0].attributes('class')).toContain('is-active')
        expect(tabs3[0].text()).toContain("label1")

        //
        // Removes tab1 => tab3 is selected
        //

        const tabIds4 = ['tab3']
        const tabLabels4 = ['label3']
        await wrapper.setProps({
            tabIds: tabIds4,
            tabLabels: tabLabels4,
        })

        // console.log(wrapper.html())
        // console.log(wrapper.text())

        const tabs4 = wrapper.findAll('li')
        expect(tabs4.length).toBe(tabIds4.length)

        expect(tabs4[0].attributes('class')).toContain('is-active')
        expect(tabs4[0].text()).toContain("label3")



        wrapper.unmount()
    })

    test("test with interactive", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        //
        // Starts with ['tab1', 'tab2', 'tab3'] => default selection is tab1
        //

        const tabIds = ['tab1', 'tab2', 'tab3']
        const tabLabels = ['label1', 'label2', 'label3']

        const wrapper = mount(Tabs, {
            global: {
                plugins: [router]
            }, props: {
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

        //
        // Select tab3 interactively
        //

        const anchors = wrapper.findAll('a')
        await anchors[2].trigger("click")
        expect(tabs[2].attributes('class')).toContain('is-active')


        //
        // Change tab list to ['tab2', 'tab3'] => tab3 remains selected
        //

        const tabIds2 = ['tab2', 'tab3']
        const tabLabels2 = ['label2', 'label3']
        await wrapper.setProps({
            tabIds: tabIds2,
            tabLabels: tabLabels2,
        })
        const tabs2 = wrapper.findAll('li')
        expect(tabs2.length).toBe(tabIds2.length)

        expect(tabs2[1].attributes('class')).toContain('is-active')

        wrapper.unmount()
    })
})

