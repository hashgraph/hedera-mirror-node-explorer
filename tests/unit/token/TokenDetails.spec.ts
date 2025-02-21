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
import TokenDetails from "@/pages/TokenDetails.vue";
import axios from "axios";
import {
    SAMPLE_BALANCES,
    SAMPLE_NETWORK_EXCHANGERATE,
    SAMPLE_NFTS,
    SAMPLE_NONFUNGIBLE,
    SAMPLE_NONFUNGIBLE_DUDE,
    SAMPLE_TOKEN,
    SAMPLE_TOKEN_WITH_KEYS,
    SAMPLE_TOKEN_WITHOUT_KEYS,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import TokenBalanceTable from "@/components/token/TokenBalanceTable.vue";
import MockAdapter from "axios-mock-adapter";
import {HMSF} from "@/utils/HMSF";
import Oruga from "@oruga-ui/oruga-next";
import NftHolderTable from "@/components/token/NftHolderTable.vue";
import FixedFeeTable from "@/components/token/FixedFeeTable.vue";
import FractionalFeeTable from "@/components/token/FractionalFeeTable.vue";
import RoyaltyFeeTable from "@/components/token/RoyaltyFeeTable.vue";
import {TransactionID} from "../../../src/utils/TransactionID";
import TokenFeesSection from "../../../src/components/token/TokenFeesSection.vue";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe.skip("TokenDetails.vue", () => {

    it("Should display details of fungible token", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_TOKEN.token_id
        const testTokenName = SAMPLE_TOKEN.name
        const testTokenSymbol = SAMPLE_TOKEN.symbol
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/balances"
        mock.onGet(matcher2).reply(200, SAMPLE_BALANCES);
        const matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const matcher4 = "/api/v1/transactions"
        mock.onGet(matcher4).reply(200, SAMPLE_TRANSACTIONS);
        const abi = require('../../../public/abi/IERC20+IHRC.json')
        const matcher6 = "http://localhost:3000/abi/IERC20+IHRC.json"
        mock.onGet(matcher6).reply(200, abi)

        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: testTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.text())

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(true)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(true)

        expect(wrapper.text()).toContain("Fungible Token" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenId)

        expect(wrapper.get("#nameValue").text()).toBe("QmVGABnvpbPwLcfG4iuW2JSzY8MLkALhd54bdPAbJxoEkB")
        expect(wrapper.get("#symbolValue").text()).toBe("23423")
        expect(wrapper.find("#adminKey").text()).toBe("Admin KeyNoneToken is immutable")
        expect(wrapper.get("#memoValue").text()).toBe("Predator")
        expect(wrapper.get("#expiresAtValue").text()).toBe("None")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("90 days")
        expect(wrapper.get("#autoRenewAccountValue").text()).toBe("0.0.29612329")
        expect(wrapper.get("#freezeDefaultValue").text()).toBe("false")
        expect(wrapper.get("#pauseStatusValue").text()).toBe("Not applicable")
        expect(wrapper.get("#metadataValue").text()).toBe("None")

        expect(wrapper.get("#treasuryAccountValue").text()).toBe("0.0.29624024")
        expect(wrapper.get("#createdAtValue").text()).toBe("10:02:30.2333 AMFeb 12, 2022, UTC")
        expect(wrapper.get("#modifiedAtValue").text()).toBe("10:02:30.2333 AMFeb 12, 2022, UTC")
        expect(wrapper.get("#totalSupplyValue").text()).toBe("1")
        expect(wrapper.get("#initialSupplyValue").text()).toBe("1")
        expect(wrapper.get("#maxSupplyValue").text()).toBe("Infinite")
        expect(wrapper.get("#decimalsValue").text()).toBe("0")
        expect(wrapper.get("#evmAddress").text()).toMatch(
            RegExp("^EVM Address:0x0000000000000000000000000000000001c49eecCopy"))

        expect(wrapper.get("#createTransactionValue").text()).toBe(TransactionID.normalizeForDisplay(SAMPLE_TRANSACTION.transaction_id))

        expect(wrapper.text()).toMatch("Balances")
        expect(wrapper.findComponent(TokenBalanceTable).exists()).toBe(true)
        expect(wrapper.findComponent(NftHolderTable).exists()).toBe(false)

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(false)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(false)
    });

    it("Should display details of non fungible token", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_NONFUNGIBLE_DUDE.token_id
        const testTokenName = SAMPLE_NONFUNGIBLE_DUDE.name
        const testTokenSymbol = SAMPLE_NONFUNGIBLE_DUDE.symbol
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE_DUDE);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);
        const matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const abi = require('../../../public/abi/IERC721+IHRC.json')
        const matcher6 = "http://localhost:3000/abi/IERC721+IHRC.json"
        mock.onGet(matcher6).reply(200, abi)

        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: testTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.text())

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(true)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(true)

        expect(wrapper.text()).toContain("NFT Collection" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenId)

        expect(wrapper.get("#nameValue").text()).toBe("Ħ Frens Kingdom Dude")
        expect(wrapper.get("#symbolValue").text()).toBe("ĦFRENSKINGDOM")
        expect(wrapper.find("#adminKey").text()).toBe(
            "Admin Keyc1a8 c8c5 b446 ce05 3b6e ff4f e4f0 192f 7653 5ea9 ed6b 2b91 9811 77ba 237f 4b5dCopyED25519"
        )
        expect(wrapper.get("#memoValue").text()).toBe("None")
        expect(wrapper.get("#expiresAtValue").text()).toBe("None")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("90 days")

        expect(wrapper.get("#createdAtValue").text()).toBe("3:29:27.7128 PMMar 6, 2022, UTC")
        expect(wrapper.get("#modifiedAtValue").text()).toBe("8:56:33.5203 PMMar 6, 2022, UTC")
        expect(wrapper.get("#totalSupplyValue").text()).toBe("2")
        expect(wrapper.get("#initialSupplyValue").text()).toBe("0")
        expect(wrapper.get("#maxSupplyValue").text()).toBe("150")
        expect(wrapper.get("#decimalsValue").text()).toBe("0")
        expect(wrapper.get("#metadataValue").text()).toBe("None")

        expect(wrapper.text()).toMatch("NFTs")
        expect(wrapper.findComponent(NftHolderTable).exists()).toBe(true)
        expect(wrapper.findComponent(TokenBalanceTable).exists()).toBe(false)

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(false)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(false)
    });

    it("Should update when token id changes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        let testTokenId = SAMPLE_NONFUNGIBLE_DUDE.token_id
        let testTokenName = SAMPLE_NONFUNGIBLE_DUDE.name
        let testTokenSymbol = SAMPLE_NONFUNGIBLE_DUDE.symbol
        let matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE_DUDE);
        let matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);
        let matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const abi = require('../../../public/abi/IERC721+IHRC.json')
        const matcher61 = "http://localhost:3000/abi/IERC721+IHRC.json"
        mock.onGet(matcher61).reply(200, abi)

        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: testTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.text())

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(true)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(true)

        expect(wrapper.text()).toContain("NFT Collection" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenId)
        expect(wrapper.get("#nameValue").text()).toBe("Ħ Frens Kingdom Dude")
        expect(wrapper.get("#symbolValue").text()).toBe("ĦFRENSKINGDOM")
        expect(wrapper.text()).toMatch("NFTs")
        expect(wrapper.findComponent(NftHolderTable).exists()).toBe(true)
        expect(wrapper.findComponent(TokenBalanceTable).exists()).toBe(false)

        testTokenId = SAMPLE_TOKEN.token_id
        testTokenName = SAMPLE_TOKEN.name
        testTokenSymbol = SAMPLE_TOKEN.symbol
        matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN);
        matcher2 = "/api/v1/tokens/" + testTokenId + "/balances"
        mock.onGet(matcher2).reply(200, SAMPLE_BALANCES);
        matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const matcher4 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher4).reply(200, SAMPLE_NFTS);
        const abi2 = require('../../../public/abi/IERC20+IHRC.json')
        const matcher62 = "http://localhost:3000/abi/IERC20+IHRC.json"
        mock.onGet(matcher62).reply(200, abi2)

        await wrapper.setProps({
            tokenId: testTokenId
        })
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toContain("Fungible Token" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenId)
        expect(wrapper.get("#nameValue").text()).toBe("QmVGABnvpbPwLcfG4iuW2JSzY8MLkALhd54bdPAbJxoEkB")
        expect(wrapper.get("#symbolValue").text()).toBe("23423")
        expect(wrapper.text()).toMatch("Balances")
        expect(wrapper.findComponent(NftHolderTable).exists()).toBe(false)
        expect(wrapper.findComponent(TokenBalanceTable).exists()).toBe(true)

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(false)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(false)
    });

    it("Should detect invalid token ID", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const invalidTokenId = "0.0.0.1000"
        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: invalidTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.get("#notificationBanner").text()).toBe("Invalid token ID: " + invalidTokenId)

        wrapper.unmount()
        await flushPromises()
    });

    it("Should display all token keys", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_TOKEN_WITH_KEYS.token_id
        const testTokenName = SAMPLE_TOKEN_WITH_KEYS.name
        const testTokenSymbol = SAMPLE_TOKEN_WITH_KEYS.symbol
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN_WITH_KEYS);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);
        const matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const abi = require('../../../public/abi/IERC721+IHRC.json')
        const matcher61 = "http://localhost:3000/abi/IERC721+IHRC.json"
        mock.onGet(matcher61).reply(200, abi)

        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: testTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.text())

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(true)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(true)

        expect(wrapper.text()).toContain("NFT Collection" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenId)

        expect(wrapper.text()).toMatch("Token Keys")
        expect(wrapper.find("#adminKey").text()).toBe("Admin Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopyED25519")
        expect(wrapper.find("#kycKey").text()).toBe("KYC Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopyED25519")
        expect(wrapper.find("#freezeKey").text()).toBe("Freeze Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopyED25519")
        expect(wrapper.find("#wipeKey").text()).toBe("Wipe Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopyED25519")
        expect(wrapper.find("#supplyKey").text()).toBe("Supply Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopyED25519")
        expect(wrapper.find("#feeScheduleKey").text()).toBe("Fee Schedule Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopyED25519")
        expect(wrapper.find("#pauseKey").text()).toBe("Pause Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopyED25519")
        expect(wrapper.find("#metadataKey").text()).toBe("Metadata Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopyED25519")

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(false)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(false)
    });

    it("Should display no token keys", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_TOKEN_WITHOUT_KEYS.token_id
        const testTokenName = SAMPLE_TOKEN_WITHOUT_KEYS.name
        const testTokenSymbol = SAMPLE_TOKEN_WITHOUT_KEYS.symbol
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN_WITHOUT_KEYS);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);
        const matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const abi = require('../../../public/abi/IERC721+IHRC.json')
        const matcher61 = "http://localhost:3000/abi/IERC721+IHRC.json"
        mock.onGet(matcher61).reply(200, abi)

        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: testTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.text())

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(true)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(true)

        expect(wrapper.text()).toContain("NFT Collection" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenId)

        expect(wrapper.text()).toMatch("Token Keys")
        expect(wrapper.find("#adminKey").text()).toBe("Admin KeyNoneToken is immutable")
        expect(wrapper.find("#kycKey").text()).toBe("KYC KeyNoneKYC is not required")
        expect(wrapper.find("#freezeKey").text()).toBe("Freeze KeyNoneToken cannot be frozen")
        expect(wrapper.find("#wipeKey").text()).toBe("Wipe KeyNoneToken cannot be wiped")
        expect(wrapper.find("#supplyKey").text()).toBe("Supply KeyNoneToken cannot be minted or burnt")
        expect(wrapper.find("#feeScheduleKey").text()).toBe("Fee Schedule KeyNoneCustom fee schedule is immutable")
        expect(wrapper.find("#pauseKey").text()).toBe("Pause KeyNoneToken cannot be paused")
        expect(wrapper.find("#metadataKey").text()).toBe("Metadata KeyNoneToken metadata is immutable")

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(false)
        expect((wrapper.vm as any).nftHolderTableController.mounted.value).toBe(false)
    });

    it("Should display 'Token deleted' banner", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = "0.0.91961"
        const testTokenName = SAMPLE_TOKEN_WITHOUT_KEYS.name
        const testTokenSymbol = SAMPLE_TOKEN_WITHOUT_KEYS.symbol
        const testTokenIdWithChecksum = "0.0.91961Copy-mkkua"
        const testTokenEVMAddress = "0x0000000000000000000000000000000000016739"
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN_WITHOUT_KEYS);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);
        const matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const abi = require('../../../public/abi/IERC721+IHRC.json')
        const matcher61 = "http://localhost:3000/abi/IERC721+IHRC.json"
        mock.onGet(matcher61).reply(200, abi)

        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: testTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toContain(
            "NFT Collection" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenIdWithChecksum
                + 'EVM Address:' + testTokenEVMAddress + "Copy")
        expect(wrapper.text()).toMatch("Token is deleted")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should display fixed fees and fractional fee of token", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_TOKEN.token_id
        const testTokenName = SAMPLE_TOKEN.name
        const testTokenSymbol = SAMPLE_TOKEN.symbol
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/balances"
        mock.onGet(matcher2).reply(200, SAMPLE_BALANCES);
        const matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);
        const abi = require('../../../public/abi/IERC20+IHRC.json')
        const matcher61 = "http://localhost:3000/abi/IERC20+IHRC.json"
        mock.onGet(matcher61).reply(200, abi)

        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: testTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toContain("Fungible Token" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenId)

        const customFees = wrapper.findComponent(TokenFeesSection)
        expect(customFees.exists()).toBe(true)

        const fixedFee = customFees.findComponent(FixedFeeTable)
        expect(fixedFee.exists()).toBe(true)
        expect(fixedFee.get('thead').text()).toBe("Fixed Fee Fee Currency Collector Account")
        expect(fixedFee.get('tbody').text()).toBe(
            "5" + "0.0.2966295623423" + "0.0.617888" +
            "1" + "0.0.2966295623423" + "0.0.617889" +
            "2" + "0.0.2966295623423" + "0.0.617890" +
            "1.00000000ℏ" + "$0.24603" + "HBAR" + "0.0.617888")

        const fractionalFee = customFees.findComponent(FractionalFeeTable)
        expect(fractionalFee.exists()).toBe(true)
        expect(fractionalFee.get('thead').text()).toBe("Fractional Fee Fee Currency Collector Account Min Max Net")
        expect(fractionalFee.get('tbody').text()).toBe(
            "0.5%" + "0.0.2966295623423" + "0.0.617888" + "0.01" + "2" + "✓" +
            "0.1%" + "0.0.2966295623423" + "0.0.617889" + "0.01" + "2" +
            "0.2%" + "0.0.2966295623423" + "0.0.617890" + "None" + "None")

        expect(customFees.findComponent(RoyaltyFeeTable).exists()).toBe(false)

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should display fixed fees and royaltee fee of token", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_NONFUNGIBLE.token_id
        const testTokenName = SAMPLE_NONFUNGIBLE.name
        const testTokenSymbol = SAMPLE_NONFUNGIBLE.symbol
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);
        const matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const matcher4 = "/api/v1/network/exchangerate"
        mock.onGet(matcher4).reply(200, SAMPLE_NETWORK_EXCHANGERATE);
        const abi = require('../../../public/abi/IERC721+IHRC.json')
        const matcher61 = "http://localhost:3000/abi/IERC721+IHRC.json"
        mock.onGet(matcher61).reply(200, abi)

        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: testTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toContain("NFT Collection" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenId)

        const customFees = wrapper.findComponent(TokenCustomFees)
        expect(customFees.exists()).toBe(true)

        const fixedFee = customFees.findComponent(FixedFeeTable)
        expect(fixedFee.exists()).toBe(true)
        expect(fixedFee.get('thead').text()).toBe("Fixed Fee Fee Currency Collector Account")
        expect(fixedFee.get('tbody').text()).toBe(
            "5" + "0.0.748383" + testTokenSymbol + "0.0.617888" +
            "1" + "0.0.748383" + testTokenSymbol + "0.0.617889" +
            "2" + "0.0.748383" + testTokenSymbol + "0.0.617890" +
            "1.00000000ℏ" + "$0.24603" + "HBAR" + "0.0.617888")

        expect(customFees.findComponent(FractionalFeeTable).exists()).toBe(false)

        const royalteeFee = customFees.findComponent(RoyaltyFeeTable)
        expect(royalteeFee.exists()).toBe(true)
        expect(royalteeFee.get('thead').text()).toBe("Percentage Fee Collector Account Fallback Fee Fee Currency")
        expect(royalteeFee.get('tbody').text()).toBe(
            "0.5%" + "0.0.617888" + "500" + "0.0.748383" + testTokenSymbol +
            "0.1%" + "0.0.617889" + "100" + "0.0.748383" + testTokenSymbol +
            "0.2%" + "0.0.617890" + "200" + "0.0.748383" + testTokenSymbol)

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should not display the 'Custom Fees card'", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_TOKEN_WITHOUT_KEYS.token_id
        const testTokenName = SAMPLE_TOKEN_WITHOUT_KEYS.name
        const testTokenSymbol = SAMPLE_TOKEN_WITHOUT_KEYS.symbol
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN_WITHOUT_KEYS);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);
        const matcher3 = "/api/v1/contracts/" + testTokenId + "/results"
        mock.onGet(matcher3).reply(200, []);
        const abi = require('../../../public/abi/IERC721+IHRC.json')
        const matcher61 = "http://localhost:3000/abi/IERC721+IHRC.json"
        mock.onGet(matcher61).reply(200, abi)

        const wrapper = mount(TokenDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: testTokenId
            },
        });
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toContain("NFT Collection" + testTokenName + ' (' + testTokenSymbol + ')' + 'Token ID:' + testTokenId)

        const customFees = wrapper.findComponent(TokenCustomFees)
        expect(customFees.exists()).toBe(false)

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });
});
