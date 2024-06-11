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
import NftPreview from "../../../src/components/token/NftPreview.vue";
import router from "../../../src/router";

describe("NftPreview.vue", () => {

    const contentUrl = 'https://dummy.image.url'

    test("No URL and default values", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftPreview, {
            global: {
                plugins: [router]
            },
            props: {},
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('NFT')

        expect(wrapper.find('img').exists()).toBe(false)

        expect(wrapper.findComponent('o-tooltip').exists()).toBe(false)

        expect(wrapper.find('figure').exists()).toBe(false)
        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })

    test("No URL and custom size", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftPreview, {
            global: {
                plugins: [router]
            },
            props: {
                size: 250
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('Non Fungible Token')
        const hbarLogo = wrapper.find('img')
        expect(hbarLogo.exists()).toBe(true)
        expect(hbarLogo.attributes('src')).toBe('/src/assets/hedera-hashgraph-hbar.svg')

        const tooltip = wrapper.findComponent('o-tooltip')
        expect(tooltip.exists()).toBe(true)
        expect(tooltip.attributes('label')).toBe('The NFT metadata does not provide any image')

        expect(wrapper.find('figure').exists()).toBe(false)
        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })

    test("With URL and custom size", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftPreview, {
            global: {
                plugins: [router]
            },
            props: {
                url: contentUrl,
                size: 250
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('Non Fungible Token')
        const hbarLogo = wrapper.find('img')
        expect(hbarLogo.exists()).toBe(true)
        expect(hbarLogo.attributes('src')).toBe('/src/assets/hedera-hashgraph-hbar.svg')

        expect(wrapper.findComponent('o-tooltip').exists()).toBe(false)

        const figure = wrapper.find('figure')
        expect(figure.exists()).toBe(true)
        expect(figure.get('img').attributes('src')).toBe(contentUrl)

        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })

    test("With URL, image type and custom size", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftPreview, {
            global: {
                plugins: [router]
            },
            props: {
                url: contentUrl,
                type: 'image/jpeg',
                size: 250
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('Non Fungible Token')
        const hbarLogo = wrapper.find('img')
        expect(hbarLogo.exists()).toBe(true)
        expect(hbarLogo.attributes('src')).toBe('/src/assets/hedera-hashgraph-hbar.svg')

        expect(wrapper.findComponent('o-tooltip').exists()).toBe(false)

        const figure = wrapper.find('figure')
        expect(figure.exists()).toBe(true)
        expect(figure.get('img').attributes('src')).toBe(contentUrl)

        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })

    test("With URL, unsupported type and custom size", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftPreview, {
            global: {
                plugins: [router]
            },
            props: {
                url: contentUrl,
                type: 'foo/bar',
                size: 250
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('Non Fungible Token')
        const hbarLogo = wrapper.find('img')
        expect(hbarLogo.exists()).toBe(true)
        expect(hbarLogo.attributes('src')).toBe('/src/assets/hedera-hashgraph-hbar.svg')

        expect(wrapper.findComponent('o-tooltip').exists()).toBe(false)

        const figure = wrapper.find('figure')
        expect(figure.exists()).toBe(true)
        expect(figure.get('img').attributes('src')).toBe(contentUrl)

        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })
})

