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

import {describe, expect, it} from 'vitest'
import {mount} from "@vue/test-utils"
import DashboardCard from "@/components/DashboardCard.vue";

/*
    https://test-utils.vuejs.org/guide/advanced/slots.html
 */

describe("DashboardCard.vue", () => {

    it("should have all slots empty", async () => {

        const wrapper = mount(DashboardCard, {});

        expect(wrapper.text()).toBe("")

        wrapper.unmount()
    })

    it("should have all slots setup", async () => {

        const sampleTitle = "ZeTitle"
        const sampleSubtitle = "ZeSubTitle"
        const sampleControl = "ZeControl"
        const sampleMediaContent = "ZeMediaContent"
        const sampleMediaDescription = "ZeMediaDescription"
        const sampleContent = "ZeContent"
        const sampleLeftContent = "ZeLeftContent"
        const sampleRightContent = "ZeRightContent"

        const wrapper = mount(DashboardCard, {
            slots: {
                title: sampleTitle,
                subtitle: sampleSubtitle,
                control: sampleControl,
                mediaContent: sampleMediaContent,
                mediaDescription: sampleMediaDescription,
                content: sampleContent,
                leftContent: sampleLeftContent,
                rightContent: sampleRightContent,
            }
        });

        expect(wrapper.text()).toContain(sampleTitle)
        expect(wrapper.text()).toContain(sampleSubtitle)
        expect(wrapper.text()).toContain(sampleControl)
        expect(wrapper.text()).toContain(sampleMediaContent)
        expect(wrapper.text()).toContain(sampleMediaDescription)
        expect(wrapper.text()).toContain(sampleContent)
        expect(wrapper.text()).toContain(sampleLeftContent)
        expect(wrapper.text()).toContain(sampleRightContent)

        wrapper.unmount()
    })

})

