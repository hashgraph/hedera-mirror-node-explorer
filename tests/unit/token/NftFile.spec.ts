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
import NftFile from "@/components/token/NftFile.vue";
import router from "@/router";
import Oruga from "@oruga-ui/oruga-next";

describe("NftFile.vue", () => {

    const contentUrl = 'https://dummy.image.url'

    test("No URL and default values", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftFile, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('')
        const icon = wrapper.find('i')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('class')).toContain('fa-file')

        expect(wrapper.find('img').exists()).toBe(false)
        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })

    test("With URL and default values", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftFile, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                url: contentUrl
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('')
        const icon = wrapper.find('i')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('class')).toContain('fa-file')

        const image = wrapper.find('img')
        expect(image.exists()).toBe(true)
        expect(image.attributes('src')).toBe(contentUrl)

        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })

    test("With URL and custom size", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftFile, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                url: contentUrl,
                size: 250
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('')
        const icon = wrapper.find('i')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('class')).toContain('fa-file')

        const image = wrapper.find('img')
        expect(image.exists()).toBe(true)
        expect(image.attributes('src')).toBe(contentUrl)
        expect(image.attributes('style')).toContain('max-width: 248px')
        expect(image.attributes('style')).toContain('max-height: 248px')

        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })

    test("With URL and image type", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftFile, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                url: contentUrl,
                type: 'image/jpeg'
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('image/jpeg')
        const icon = wrapper.find('i')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('class')).toContain('fa-file')

        const image = wrapper.find('img')
        expect(image.exists()).toBe(true)
        expect(image.attributes('src')).toBe(contentUrl)

        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })

    test("With URL and video type", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftFile, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                url: contentUrl,
                type: 'video/mp4'
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('video/mp4')
        const icon = wrapper.find('i')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('class')).toContain('fa-file')

        const video = wrapper.find('video')
        expect(video.exists()).toBe(true)
        const source = video.find('source')
        expect(source.exists()).toBe(true)
        expect(source.attributes('src')).toBe(contentUrl)

        expect(wrapper.find('img').exists()).toBe(false)

        wrapper.unmount()
    })

    test("With URL and unsupported type", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(NftFile, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                url: contentUrl,
                type: 'foo/bar'
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('foo/bar')
        const icon = wrapper.find('i')
        expect(icon.exists()).toBe(true)
        expect(icon.attributes('class')).toContain('fa-file')

        const image = wrapper.find('img')
        expect(image.exists()).toBe(true)
        expect(image.attributes('src')).toBe(contentUrl)

        expect(wrapper.find('video').exists()).toBe(false)

        wrapper.unmount()
    })
})

