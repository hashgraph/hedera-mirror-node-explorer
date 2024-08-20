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

import {describe, expect, it} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import {
    SAMPLE_ACCOUNT_BALANCES,
    SAMPLE_CONTRACT,
    SAMPLE_CONTRACT_AS_ACCOUNT,
    SAMPLE_CONTRACT_DELETED,
    SAMPLE_CONTRACT_DELETED_AS_ACCOUNT,
    SAMPLE_CONTRACT_DUDE,
    SAMPLE_CONTRACT_DUDE_AS_ACCOUNT,
    SAMPLE_CONTRACT_RESULTS,
    SAMPLE_NETWORK_EXCHANGERATE,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import ContractDetails from "@/pages/ContractDetails.vue";
import {HMSF} from "@/utils/HMSF";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {TransactionID} from "@/utils/TransactionID";
import ContractResultTable from "@/components/contract/ContractResultTable.vue";
import {ContractStateResponse} from "../../../src/schemas/HederaSchemas";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("ContractDetails.vue", () => {

    it("Should display contract details (using contract id)", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT);

        const matcher2 = "/api/v1/accounts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher5 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

        const matcher6 = "/api/v1/balances"
        mock.onGet(matcher6).reply(200, SAMPLE_ACCOUNT_BALANCES);

        const matcher7 = "api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/state?slot=0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        mock.onGet(matcher7).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const matcher8 = "api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/state?slot=0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        mock.onGet(matcher8).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: SAMPLE_CONTRACT.contract_id
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + "Show associated account" + "Contract ID:" + SAMPLE_CONTRACT.contract_id))
        expect(wrapper.get("#balanceValue").text()).toContain("23.42647909$5.76369")
        expect(wrapper.get("#keyValue").text()).toBe("4210 5082 0e14 85ac dd59 7260 88e0 e4a2 130e bbbb 7000 9f64 0ad9 5c78 dd5a 7b38CopyED25519")
        expect(wrapper.get("#memoValue").text()).toBe("Mirror Node acceptance test: 2022-03-07T15:09:15.228564328Z Create contract")
        expect(wrapper.get("#createTransactionValue").text()).toBe(TransactionID.normalizeForDisplay(SAMPLE_TRANSACTION.transaction_id))
        expect(wrapper.get("#expiresAtValue").text()).toBe("None")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("90 days")
        expect(wrapper.get("#autoRenewAccountValue").text()).toBe("0.0.730632")
        expect(wrapper.get("#maxAutoAssociationValue").text()).toBe("Unlimited Auto Associations")
        expect(wrapper.get("#obtainerValue").text()).toBe("None")
        expect(wrapper.get("#proxyAccountValue").text()).toBe("None")
        expect(wrapper.get("#validFromValue").text()).toBe("3:09:15.9474 PMMar 7, 2022, UTC")
        expect(wrapper.get("#validUntilValue").text()).toBe("None")
        expect(wrapper.get("#nonceValue").text()).toBe("1")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.749773")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address:0x00000000000000000000000000000000000b70cfCopy")
        expect(wrapper.get("#bytecode").text()).toContain(
            "6080 6040 5236 606d 5730 73ff ffff ffff ffff ffff ffff ffff ffff ffff ffff ff16 3373 ffff ffff ffff ffff " +
            "ffff ffff ffff ffff ffff ffff 167f ddf2 52ad 1be2 c89b 69c2 b068 fc37 8daa 952b a7f1 63c4 a116 28f5 5a4d " +
            "f523 b3ef 3460 4051 6063 9190 607f 565b 6040 5180 9103 90a3 005b 6000 80fd 5b60 7981 6098 565b 8252 5050 " +
            "565b 6000 6020 8201 9050 6092 6000 8301 8460 7256 5b92 9150 5056 5b60 0081 9050 9190 5056 fea2 6469 7066 " +
            "7358 2212 20b9 4efc a641 a0cf 62b2 bd50 5f79 fe4b e165 c582 520b c615 e5c5 fa34 0215 6eaf d864 736f 6c63 " +
            "4300 0804 0033")
        expect(wrapper.get("#assembly-code").text()).toContain(
            "Assembly Bytecode" +
            "Show hexa opcode" +
            "0x0000:PUSH10x800x0002:PUSH10x400x0004:MSTORE0x0005:CALLDATASIZE0x0006:PUSH10x6d0x0008:JUMPI0x0009:ADDRESS" +
            "0x000a:PUSH200xffffffffffffffffffffffffffffffffffffffff0x001f:AND0x0020:CALLER0x0021:PUSH200xffffffffffffffffffffffffffffffffffffffff" +
            "0x0036:AND0x0037:PUSH320xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef0x0058:CALLVALUE0x0059:PUSH10x400x005b:MLOAD" +
            "0x005c:PUSH10x630x005e:SWAP20x005f:SWAP10x0060:PUSH10x7f0x0062:JUMP0x0063:JUMPDEST0x0064:PUSH10x400x0066:MLOAD0x0067:DUP10x0068:SWAP2" +
            "0x0069:SUB0x006a:SWAP10x006b:LOG30x006c:STOP0x006d:JUMPDEST0x006e:PUSH10x000x0070:DUP10x0071:REVERT0x0072:JUMPDEST0x0073:PUSH10x79" +
            "0x0075:DUP20x0076:PUSH10x980x0078:JUMP0x0079:JUMPDEST0x007a:DUP30x007b:MSTORE0x007c:POP0x007d:POP0x007e:JUMP0x007f:JUMPDEST0x0080:PUSH10x00" +
            "0x0082:PUSH10x200x0084:DUP30x0085:ADD0x0086:SWAP10x0087:POP0x0088:PUSH10x920x008a:PUSH10x000x008c:DUP40x008d:ADD0x008e:DUP50x008f:PUSH10x72" +
            "0x0091:JUMP0x0092:JUMPDEST0x0093:SWAP30x0094:SWAP20x0095:POP0x0096:POP0x0097:JUMP0x0098:JUMPDEST0x0099:PUSH10x000x009b:DUP20x009c:SWAP1" +
            "0x009d:POP0x009e:SWAP20x009f:SWAP10x00a0:POP0x00a1:JUMP0x00a2:INVALID")
        expect(wrapper.get("#solcVersion").text()).toBe("Solidity Compiler Version0.8.4")

        // None of the elements related to contract verification should be present in this context
        expect(wrapper.find('#verify-button').exists()).toBe(false)
        expect(wrapper.find('#showSource').exists()).toBe(false)
        expect(wrapper.find('#verificationStatus').exists()).toBe(false)
        expect(wrapper.find('#contractName').exists()).toBe(false)

        expect(wrapper.findComponent(ContractResultTable).exists()).toBe(true)

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should display contract details (using evm address)", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/contracts/" + SAMPLE_CONTRACT.evm_address
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT);

        const matcher2 = "/api/v1/accounts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher5 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

        const matcher6 = "/api/v1/balances"
        mock.onGet(matcher6).reply(200, SAMPLE_ACCOUNT_BALANCES);

        const matcher7 = "api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/state?slot=0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        mock.onGet(matcher7).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const matcher8 = "api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/state?slot=0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        mock.onGet(matcher8).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: SAMPLE_CONTRACT.evm_address
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + "Show associated account" + "Contract ID:" + SAMPLE_CONTRACT.contract_id))
        expect(wrapper.get("#balanceValue").text()).toContain("23.42647909$5.76369")
        expect(wrapper.get("#keyValue").text()).toBe("4210 5082 0e14 85ac dd59 7260 88e0 e4a2 130e bbbb 7000 9f64 0ad9 5c78 dd5a 7b38CopyED25519")
        expect(wrapper.get("#memoValue").text()).toBe("Mirror Node acceptance test: 2022-03-07T15:09:15.228564328Z Create contract")
        expect(wrapper.get("#createTransactionValue").text()).toBe(TransactionID.normalizeForDisplay(SAMPLE_TRANSACTION.transaction_id))
        expect(wrapper.get("#expiresAtValue").text()).toBe("None")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("90 days")
        expect(wrapper.get("#autoRenewAccountValue").text()).toBe("0.0.730632")
        expect(wrapper.get("#maxAutoAssociationValue").text()).toBe("Unlimited Auto Associations")
        expect(wrapper.get("#obtainerValue").text()).toBe("None")
        expect(wrapper.get("#proxyAccountValue").text()).toBe("None")
        expect(wrapper.get("#validFromValue").text()).toBe("3:09:15.9474 PMMar 7, 2022, UTC")
        expect(wrapper.get("#validUntilValue").text()).toBe("None")
        expect(wrapper.get("#nonceValue").text()).toBe("1")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.749773")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address:0x00000000000000000000000000000000000b70cfCopy")
        expect(wrapper.get("#bytecode").text()).toContain(
            "6080 6040 5236 606d 5730 73ff ffff ffff ffff ffff ffff ffff ffff ffff ffff ff16 3373 ffff ffff ffff ffff " +
            "ffff ffff ffff ffff ffff ffff 167f ddf2 52ad 1be2 c89b 69c2 b068 fc37 8daa 952b a7f1 63c4 a116 28f5 5a4d " +
            "f523 b3ef 3460 4051 6063 9190 607f 565b 6040 5180 9103 90a3 005b 6000 80fd 5b60 7981 6098 565b 8252 5050 " +
            "565b 6000 6020 8201 9050 6092 6000 8301 8460 7256 5b92 9150 5056 5b60 0081 9050 9190 5056 fea2 6469 7066 " +
            "7358 2212 20b9 4efc a641 a0cf 62b2 bd50 5f79 fe4b e165 c582 520b c615 e5c5 fa34 0215 6eaf d864 736f 6c63 " +
            "4300 0804 0033")
        expect(wrapper.get("#assembly-code").text()).toContain(
            "Assembly Bytecode" +
            "Show hexa opcode" +
            "0x0000:PUSH10x800x0002:PUSH10x400x0004:MSTORE0x0005:CALLDATASIZE0x0006:PUSH10x6d0x0008:JUMPI0x0009:ADDRESS" +
            "0x000a:PUSH200xffffffffffffffffffffffffffffffffffffffff0x001f:AND0x0020:CALLER0x0021:PUSH200xffffffffffffffffffffffffffffffffffffffff" +
            "0x0036:AND0x0037:PUSH320xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef0x0058:CALLVALUE0x0059:PUSH10x400x005b:MLOAD" +
            "0x005c:PUSH10x630x005e:SWAP20x005f:SWAP10x0060:PUSH10x7f0x0062:JUMP0x0063:JUMPDEST0x0064:PUSH10x400x0066:MLOAD0x0067:DUP10x0068:SWAP2" +
            "0x0069:SUB0x006a:SWAP10x006b:LOG30x006c:STOP0x006d:JUMPDEST0x006e:PUSH10x000x0070:DUP10x0071:REVERT0x0072:JUMPDEST0x0073:PUSH10x79" +
            "0x0075:DUP20x0076:PUSH10x980x0078:JUMP0x0079:JUMPDEST0x007a:DUP30x007b:MSTORE0x007c:POP0x007d:POP0x007e:JUMP0x007f:JUMPDEST0x0080:PUSH10x00" +
            "0x0082:PUSH10x200x0084:DUP30x0085:ADD0x0086:SWAP10x0087:POP0x0088:PUSH10x920x008a:PUSH10x000x008c:DUP40x008d:ADD0x008e:DUP50x008f:PUSH10x72" +
            "0x0091:JUMP0x0092:JUMPDEST0x0093:SWAP30x0094:SWAP20x0095:POP0x0096:POP0x0097:JUMP0x0098:JUMPDEST0x0099:PUSH10x000x009b:DUP20x009c:SWAP1" +
            "0x009d:POP0x009e:SWAP20x009f:SWAP10x00a0:POP0x00a1:JUMP0x00a2:INVALID")
        expect(wrapper.get("#solcVersion").text()).toBe("Solidity Compiler Version0.8.4")

        // None of the elements related to contract verification should be present in this context
        expect(wrapper.find('#verify-button').exists()).toBe(false)
        expect(wrapper.find('#showSource').exists()).toBe(false)
        expect(wrapper.find('#verificationStatus').exists()).toBe(false)
        expect(wrapper.find('#contractName').exists()).toBe(false)

        expect(wrapper.findComponent(ContractResultTable).exists()).toBe(true)

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should display recent contract calls table in contract details", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT);

        const matcher2 = "/api/v1/accounts/" + SAMPLE_CONTRACT.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher5 = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

        const matcher7 = "api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/state?slot=0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        mock.onGet(matcher7).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const matcher8 = "api/v1/contracts/" + SAMPLE_CONTRACT.contract_id + "/state?slot=0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        mock.onGet(matcher8).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: SAMPLE_CONTRACT.contract_id
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + "Show associated account" + "Contract ID:" + SAMPLE_CONTRACT.contract_id))

        const resultTable = wrapper.findComponent(ContractResultTable)
        expect(resultTable.exists()).toBe(true)

        expect(resultTable.find('thead').text()).toBe("Time From Error Message Transfer Amount")
        const rows = wrapper.find('tbody').findAll('tr')

        let cells = rows[0].findAll('td')
        expect(cells[0].text()).toBe("9:11:37.9739 AMFeb 3, 2023, UTC")
        expect(cells[1].text()).toBe("0x00000000000000000000000000000000000004ec(0.0.1260)")
        expect(cells[2].text()).toBe("None")
        expect(cells[3].text()).toBe("0.00000000")

        cells = rows[1].findAll('td')
        expect(cells[0].text()).toBe("9:09:24.5852 AMFeb 3, 2023, UTC")
        expect(cells[1].text()).toBe("0x00000000000000000000000000000000000004ec(0.0.1260)")
        expect(cells[2].text()).toBe("None")
        expect(cells[3].text()).toBe("0.00000000")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should update when contract id changes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract1 = SAMPLE_CONTRACT
        let matcher1 = "/api/v1/contracts/" + contract1.contract_id
        mock.onGet(matcher1).reply(200, contract1);

        let matcher2 = "/api/v1/accounts/" + contract1.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        let matcher5 = "/api/v1/contracts/" + contract1.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

        let matcher7 = "api/v1/contracts/" + contract1.contract_id + "/state?slot=0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        mock.onGet(matcher7).reply<ContractStateResponse>(200, { state: [], links: undefined })

        let matcher8 = "api/v1/contracts/" + contract1.contract_id + "/state?slot=0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        mock.onGet(matcher8).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: SAMPLE_CONTRACT.contract_id
            },
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + "Show associated account" + "Contract ID:" + SAMPLE_CONTRACT.contract_id))

        expect(wrapper.findComponent(NotificationBanner).exists()).toBe(false)

        expect(wrapper.get("#keyValue").text()).toBe("4210 5082 0e14 85ac dd59 7260 88e0 e4a2 130e bbbb 7000 9f64 0ad9 5c78 dd5a 7b38CopyED25519")
        expect(wrapper.get("#memoValue").text()).toBe("Mirror Node acceptance test: 2022-03-07T15:09:15.228564328Z Create contract")
        expect(wrapper.get("#autoRenewAccountValue").text()).toBe("0.0.730632")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.749773")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address:0x00000000000000000000000000000000000b70cfCopy")

        const contract2 = SAMPLE_CONTRACT_DUDE
        matcher1 = "/api/v1/contracts/" + contract2.contract_id
        mock.onGet(matcher1).reply(200, contract2);

        matcher2 = "/api/v1/accounts/" + contract2.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_DUDE_AS_ACCOUNT);

        matcher5 = "/api/v1/contracts/" + contract2.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

        matcher7 = "api/v1/contracts/" + contract2.contract_id + "/state?slot=0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        mock.onGet(matcher7).reply<ContractStateResponse>(200, { state: [], links: undefined })

        matcher8 = "api/v1/contracts/" + contract2.contract_id + "/state?slot=0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        mock.onGet(matcher8).reply<ContractStateResponse>(200, { state: [], links: undefined })

        await wrapper.setProps({
            contractId: SAMPLE_CONTRACT_DUDE.contract_id ?? undefined
        })
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("Contract " + "Show associated account" + "Contract ID:" + SAMPLE_CONTRACT_DUDE.contract_id))
        expect(wrapper.get("#keyValue").text()).toBe("None")
        expect(wrapper.get("#maxAutoAssociationValue").text()).toBe("No Auto Association")
        expect(wrapper.get("#memoValue").text()).toBe("None")
        expect(wrapper.find("#nonce").exists()).toBe(false)
        expect(wrapper.get("#fileValue").text()).toBe("0.0.803267")
        expect(wrapper.get("#evmAddress").text()).toBe("EVM Address:0x00000000000000000000000000000000000c41dfCopy")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    // TODO: re-enable after activation of Contract Expiry
    it.skip("Should display notification of grace period", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract = SAMPLE_CONTRACT_DUDE
        const matcher1 = "/api/v1/contracts/" + contract.contract_id
        mock.onGet(matcher1).reply(200, contract);

        const matcher2 = "/api/v1/accounts/" + contract.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher5 = "/api/v1/contracts/" + contract.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

        const matcher7 = "api/v1/contracts/" + contract.contract_id + "/state?slot=0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        mock.onGet(matcher7).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const matcher8 = "api/v1/contracts/" + contract.contract_id + "/state?slot=0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        mock.onGet(matcher8).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: contract.contract_id
            },
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + SAMPLE_CONTRACT_DUDE.contract_id))

        const banner = wrapper.findComponent(NotificationBanner)
        expect(banner.exists()).toBe(true)
        expect(banner.text()).toBe("Contract has expired and is in grace period")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    // TODO: remove after activation of Contract Expiry
    it("Should NOT display notification of grace period", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract = SAMPLE_CONTRACT_DUDE
        const matcher1 = "/api/v1/contracts/" + contract.contract_id
        mock.onGet(matcher1).reply(200, contract);

        const matcher2 = "/api/v1/accounts/" + contract.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_DUDE_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher5 = "/api/v1/contracts/" + contract.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

        const matcher7 = "api/v1/contracts/" + contract.contract_id + "/state?slot=0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        mock.onGet(matcher7).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const matcher8 = "api/v1/contracts/" + contract.contract_id + "/state?slot=0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        mock.onGet(matcher8).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: contract.contract_id
            },
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + "Show associated account" + "Contract ID:" + SAMPLE_CONTRACT_DUDE.contract_id))

        const banner = wrapper.findComponent(NotificationBanner)
        expect(banner.exists()).toBe(false)

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should display notification of deleted contract", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const contract = SAMPLE_CONTRACT_DELETED
        const matcher1 = "/api/v1/contracts/" + contract.contract_id
        mock.onGet(matcher1).reply(200, contract);

        const matcher2 = "/api/v1/accounts/" + contract.contract_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_DELETED_AS_ACCOUNT);

        const matcher3 = "/api/v1/transactions"
        mock.onGet(matcher3).reply(200, SAMPLE_TRANSACTIONS);

        const matcher5 = "/api/v1/contracts/" + contract.contract_id + "/results"
        mock.onGet(matcher5).reply(200, SAMPLE_CONTRACT_RESULTS);

        const matcher7 = "api/v1/contracts/" + contract.contract_id + "/state?slot=0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
        mock.onGet(matcher7).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const matcher8 = "api/v1/contracts/" + contract.contract_id + "/state?slot=0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103"
        mock.onGet(matcher8).reply<ContractStateResponse>(200, { state: [], links: undefined })

        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: contract.contract_id
            },
        });

        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Contract " + "Show associated account" + "Contract ID:" + contract.contract_id))

        const banner = wrapper.findComponent(NotificationBanner)
        expect(banner.exists()).toBe(true)
        expect(banner.text()).toBe("Contract is deleted")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should detect invalid contract ID", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const invalidContractId = "0.0.0.1000"
        const wrapper = mount(ContractDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                contractId: invalidContractId
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.get("#notificationBanner").text()).toBe("Invalid contract ID or address: " + invalidContractId)

        wrapper.unmount()
        await flushPromises()
    });
});







