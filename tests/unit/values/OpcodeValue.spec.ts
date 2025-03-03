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


/*
    Bookmarks
        https://test-utils.vuejs.org/api/

 */

import {describe, it, expect} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils";
import {SAMPLE_ACCOUNT, SAMPLE_CONTRACT} from "../Mocks";
import OpcodeValue from "@/components/values/OpcodeValue.vue";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {afterAll, beforeAll} from "vitest";
import {DisassembledOpcodeOutput} from "@/utils/bytecode_tools/disassembler/utils/helpers";
import router from "@/router";

describe("OpcodeValue.vue", () => {

    const mock = new MockAdapter(axios);

    beforeAll(() => {
    })

    afterAll(() => {
        mock.restore()
    })

    it("should show the opcode with and without hexa opcode value", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const opcode: DisassembledOpcodeOutput = {
            index16: '0x0dc2',
            hex: '63',
            mnemonic: 'PUSH4',
            operand: ['4e', '48', '7b', '71']
        }
        const displayWithHexaOpcode =
            "0x0dc2" + ":" +
            "63" + "-" +
            "PUSH4" +
            "0x4e487b71"

        const displayWithoutHexaOpcode =
            "0x0dc2" + ":" +
            "PUSH4" +
            "0x4e487b71"

        const wrapper = mount(OpcodeValue, {
            global: {
                plugins: [router]
            },
            props: {
                opcode: opcode,
                showHexaOpcode: true
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(displayWithHexaOpcode)

        await wrapper.setProps({
            showHexaOpcode: false
        })
        await flushPromises()

        expect(wrapper.text()).toBe(displayWithoutHexaOpcode)

        wrapper.unmount()
        await flushPromises()
    });

    it("should show the opcode with a link to the contract address", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const matcher1 = "/api/v1/contracts/" + SAMPLE_CONTRACT.evm_address
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT);
        const matcher2 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.evm_address
        mock.onGet(matcher2).reply(200, SAMPLE_ACCOUNT);

        const opcode: DisassembledOpcodeOutput = {
            index16: '0x0dc2',
            hex: '73',
            mnemonic: 'PUSH20',
            operand: []
        }
        const address = SAMPLE_CONTRACT.evm_address
        for (let i = 2; i < address.length; i += 2) {
            opcode.operand.push(address.substring(i, i + 2))
        }

        const displayWithHexaOpcode =
            "0x0dc2" + ":" +
            "73" + "-" +
            "PUSH20" +
            SAMPLE_CONTRACT.evm_address +
            "//" +
            SAMPLE_CONTRACT.contract_id

        const displayWithoutHexaOpcode =
            "0x0dc2" + ":" +
            "PUSH20" +
            SAMPLE_CONTRACT.evm_address +
            "//" +
            SAMPLE_CONTRACT.contract_id

        const wrapper = mount(OpcodeValue, {
            global: {
                plugins: [router]
            },
            props: {
                opcode: opcode,
                showHexaOpcode: true
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(displayWithHexaOpcode)
        const anchors = wrapper.findAll('a')
        expect(anchors.length).toBe(2)
        expect(anchors[0].text()).toBe(SAMPLE_CONTRACT.evm_address)
        expect(anchors[1].text()).toBe(SAMPLE_CONTRACT.contract_id)

        await wrapper.setProps({
            showHexaOpcode: false
        })
        await flushPromises()

        expect(wrapper.text()).toBe(displayWithoutHexaOpcode)

        wrapper.unmount()
        await flushPromises()
    });

    it("should show the opcode with a link to the account address", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const matcher1 = "/api/v1/contracts/" + SAMPLE_CONTRACT.evm_address
        mock.onGet(matcher1).reply(404);
        const matcher2 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.evm_address
        mock.onGet(matcher2).reply(200, SAMPLE_ACCOUNT);

        const opcode: DisassembledOpcodeOutput = {
            index16: '0x0dc2',
            hex: '73',
            mnemonic: 'PUSH20',
            operand: []
        }
        const address = SAMPLE_ACCOUNT.evm_address
        for (let i = 2; i < address.length; i += 2) {
            opcode.operand.push(address.substring(i, i + 2))
        }

        const displayWithHexaOpcode =
            "0x0dc2" + ":" +
            "73" + "-" +
            "PUSH20" +
            SAMPLE_ACCOUNT.evm_address +
            "//" +
            SAMPLE_ACCOUNT.account

        const displayWithoutHexaOpcode =
            "0x0dc2" + ":" +
            "PUSH20" +
            SAMPLE_ACCOUNT.evm_address +
            "//" +
            SAMPLE_ACCOUNT.account

        const wrapper = mount(OpcodeValue, {
            global: {
                plugins: [router]
            },
            props: {
                opcode: opcode,
                showHexaOpcode: true
            },
        });
        await flushPromises()

        expect(wrapper.text()).toBe(displayWithHexaOpcode)
        const anchors = wrapper.findAll('a')
        expect(anchors.length).toBe(2)
        expect(anchors[0].text()).toBe(SAMPLE_ACCOUNT.evm_address)
        expect(anchors[1].text()).toBe(SAMPLE_ACCOUNT.account)

        await wrapper.setProps({
            showHexaOpcode: false
        })
        await flushPromises()

        expect(wrapper.text()).toBe(displayWithoutHexaOpcode)

        wrapper.unmount()
        await flushPromises()
    });
});
