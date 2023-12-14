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

import {describe, it, expect} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {SAMPLE_BLOCKSRESPONSE} from "../Mocks";
import DashboardCard from "@/components/DashboardCard.vue";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import BytecodeAnalyzerTools from '@/pages/BytecodeAnalyzerTools.vue'
import BytecodeTools from '@/components/bytecode_tools/BytecodeTools.vue'

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("BytecodeAnalyzerTools.vue", () => {

    it("Should display the BytecodeAnalyzerTools", async () => {

        await router.push("/") 

        const wrapper = mount(BytecodeAnalyzerTools, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()

        const card = wrapper.findComponent(DashboardCard)
        expect(card.exists()).toBe(true)
        expect(card.text()).toMatch(RegExp("^Bytecode Analyzer"))

        const tabChooser = wrapper.get("#tabChooser")
        expect(tabChooser.text()).toBe("Disassembler")
        
        const decompilerButton = wrapper.get('#decompilerButton')
        decompilerButton.trigger("click")

        const disassemblerTool = wrapper.getComponent(BytecodeTools)

        const disassembly = disassemblerTool.get("#disassembly")
        expect(disassembly.text()).toBe('no opcodes found...')


        wrapper.unmount()
        await flushPromises()
    });
});
