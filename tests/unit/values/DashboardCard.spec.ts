/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DashboardCard from "@/components/DashboardCard.vue";

/*
    https://test-utils.vuejs.org/guide/advanced/slots.html
 */

describe("DashboardCard.vue", () => {
    it("should have all slots empty", async () => {
        const wrapper = mount(DashboardCard, {});

        expect(wrapper.text()).toBe("");

        wrapper.unmount();
    });

    it("should have all slots setup", async () => {
        const sampleTitle = "ZeTitle";
        const sampleControl = "ZeControl";
        const sampleContent = "ZeContent";

        const wrapper = mount(DashboardCard, {
            slots: {
                title: sampleTitle,
                control: sampleControl,
                content: sampleContent,
            },
        });

        expect(wrapper.text()).toContain(sampleTitle);
        expect(wrapper.text()).toContain(sampleControl);
        expect(wrapper.text()).toContain(sampleContent);

        wrapper.unmount();
    });
});
