/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import TokenDetails from "@/pages/TokenDetails.vue";
import axios from "axios";
import {
    SAMPLE_BALANCES,
    SAMPLE_NFTS,
    SAMPLE_NONFUNGIBLE_DUDE,
    SAMPLE_TOKEN,
    SAMPLE_TOKEN_WITH_KEYS,
    SAMPLE_TOKEN_WITHOUT_KEYS
} from "../Mocks";
import TokenNftTable from "@/components/token/TokenNftTable.vue";
import TokenBalanceTable from "@/components/token/TokenBalanceTable.vue";
import MockAdapter from "axios-mock-adapter";
import {HMSF} from "@/utils/HMSF";
import Oruga from "@oruga-ui/oruga-next";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

HMSF.forceUTC = true

describe("TokenDetails.vue", () => {

    it("Should display details of fungible token", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_TOKEN.token_id
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/balances"
        mock.onGet(matcher2).reply(200, SAMPLE_BALANCES);

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

        expect(wrapper.vm.tokenBalanceCache.state.value).toBe(EntityCacheStateV2.Started)
        expect(wrapper.vm.tokenNftCache.state.value).toBe(EntityCacheStateV2.Stopped)

        expect(wrapper.text()).toMatch(RegExp("^Fungible Token " + testTokenId))

        expect(wrapper.get("#nameValue").text()).toBe("23423")
        expect(wrapper.get("#symbolValue").text()).toBe("QmVGABnvpbPwLcfG4iuW2JSzY8MLkALhd54bdPAbJxoEkB")
        expect(wrapper.find("#adminKey").text()).toBe("Admin KeyToken is immutable")
        expect(wrapper.get("#memoValue").text()).toBe("234234")
        expect(wrapper.get("#expiresAtValue").text()).toBe("None")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("90 days")
        expect(wrapper.get("#autoRenewAccountValue").text()).toBe("0.0.29612329")
        expect(wrapper.get("#freezeDefaultValue").text()).toBe("false")
        expect(wrapper.get("#pauseStatusValue").text()).toBe("Not applicable")

        expect(wrapper.get("#treasuryAccountValue").text()).toBe("0.0.29624024")
        expect(wrapper.get("#createdAtValue").text()).toBe("10:02:30.2333 AMFeb 12, 2022, UTC")
        expect(wrapper.get("#modifiedAtValue").text()).toBe("10:02:30.2333 AMFeb 12, 2022, UTC")
        expect(wrapper.get("#totalSupplyValue").text()).toBe("1")
        expect(wrapper.get("#initialSupplyValue").text()).toBe("1")
        expect(wrapper.get("#maxSupplyValue").text()).toBe("Infinite")
        expect(wrapper.get("#ethereumAddressValue").text()).toBe("0000 0000 0000 0000 0000 0000 0000 0000 01c4 9eecCopy to ClipboardImport in MetaMaskPlease install MetaMask! To watch this asset with MetaMask, you must download and install MetaMask extension for your browser.")

        expect(wrapper.text()).toMatch("Balances")
        expect(wrapper.findComponent(TokenBalanceTable).exists()).toBe(true)
        expect(wrapper.findComponent(TokenNftTable).exists()).toBe(false)

        wrapper.unmount()
        await flushPromises()

        expect(wrapper.vm.tokenBalanceCache.state.value).toBe(EntityCacheStateV2.Stopped)
        expect(wrapper.vm.tokenNftCache.state.value).toBe(EntityCacheStateV2.Stopped)
    });

    it("Should display details of non fungible token", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_NONFUNGIBLE_DUDE.token_id
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE_DUDE);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);

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

        expect(wrapper.vm.tokenBalanceCache.state.value).toBe(EntityCacheStateV2.Stopped)
        expect(wrapper.vm.tokenNftCache.state.value).toBe(EntityCacheStateV2.Started)

        expect(wrapper.text()).toMatch(RegExp("^Non Fungible Token " + testTokenId))

        expect(wrapper.get("#nameValue").text()).toBe("Ħ Frens Kingdom Dude")
        expect(wrapper.get("#symbolValue").text()).toBe("ĦFRENSKINGDOM")
        expect(wrapper.find("#adminKey").text()).toBe(
            "Admin Keyc1a8 c8c5 b446 ce05 3b6e ff4f e4f0 192f 7653 5ea9 ed6b 2b91 9811 77ba 237f 4b5dCopy to ClipboardED25519"
        )
        expect(wrapper.get("#memoValue").text()).toBe("None")
        expect(wrapper.get("#expiresAtValue").text()).toBe("None")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("90 days")

        expect(wrapper.get("#createdAtValue").text()).toBe("3:29:27.7128 PMMar 6, 2022, UTC")
        expect(wrapper.get("#modifiedAtValue").text()).toBe("8:56:33.5203 PMMar 6, 2022, UTC")
        expect(wrapper.get("#totalSupplyValue").text()).toBe("2")
        expect(wrapper.get("#initialSupplyValue").text()).toBe("0")
        expect(wrapper.get("#maxSupplyValue").text()).toBe("150")

        expect(wrapper.text()).toMatch("NFT Holders")
        expect(wrapper.findComponent(TokenNftTable).exists()).toBe(true)
        expect(wrapper.findComponent(TokenBalanceTable).exists()).toBe(false)

        wrapper.unmount()
        await flushPromises()

        expect(wrapper.vm.tokenBalanceCache.state.value).toBe(EntityCacheStateV2.Stopped)
        expect(wrapper.vm.tokenNftCache.state.value).toBe(EntityCacheStateV2.Stopped)
    });

    it("Should update when token id changes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        let testTokenId = SAMPLE_NONFUNGIBLE_DUDE.token_id
        let matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE_DUDE);
        let matcher2 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher2).reply(200, SAMPLE_NFTS);

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

        expect(wrapper.vm.tokenBalanceCache.state.value).toBe(EntityCacheStateV2.Stopped)
        expect(wrapper.vm.tokenNftCache.state.value).toBe(EntityCacheStateV2.Started)

        expect(wrapper.text()).toMatch(RegExp("^Non Fungible Token " + testTokenId))
        expect(wrapper.get("#nameValue").text()).toBe("Ħ Frens Kingdom Dude")
        expect(wrapper.get("#symbolValue").text()).toBe("ĦFRENSKINGDOM")
        expect(wrapper.text()).toMatch("NFT Holders")
        expect(wrapper.findComponent(TokenNftTable).exists()).toBe(true)
        expect(wrapper.findComponent(TokenBalanceTable).exists()).toBe(false)

        testTokenId = SAMPLE_TOKEN.token_id
        matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN);
        matcher2 = "/api/v1/tokens/" + testTokenId + "/balances"
        mock.onGet(matcher2).reply(200, SAMPLE_BALANCES);
        const matcher3 = "/api/v1/tokens/" + testTokenId + "/nfts"
        mock.onGet(matcher3).reply(200, SAMPLE_NFTS);

        await wrapper.setProps({
            tokenId: testTokenId
        })
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Fungible Token " + testTokenId))
        expect(wrapper.get("#nameValue").text()).toBe("23423")
        expect(wrapper.get("#symbolValue").text()).toBe("QmVGABnvpbPwLcfG4iuW2JSzY8MLkALhd54bdPAbJxoEkB")
        expect(wrapper.text()).toMatch("Balances")
        expect(wrapper.findComponent(TokenNftTable).exists()).toBe(false)
        expect(wrapper.findComponent(TokenBalanceTable).exists()).toBe(true)

        wrapper.unmount()
        await flushPromises()

        expect(wrapper.vm.tokenBalanceCache.state.value).toBe(EntityCacheStateV2.Stopped)
        expect(wrapper.vm.tokenNftCache.state.value).toBe(EntityCacheStateV2.Stopped)
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
    });

    it("Should display all token keys", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_TOKEN_WITH_KEYS.token_id
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN_WITH_KEYS);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/balances"
        mock.onGet(matcher2).reply(200, SAMPLE_BALANCES);

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

        expect(wrapper.vm.tokenBalanceCache.state.value).toBe(EntityCacheStateV2.Stopped)
        expect(wrapper.vm.tokenNftCache.state.value).toBe(EntityCacheStateV2.Started)

        expect(wrapper.text()).toMatch(RegExp("^Non Fungible Token " + testTokenId))

        expect(wrapper.text()).toMatch("Token Keys")
        expect(wrapper.find("#adminKey").text()).toBe("Admin Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopy to ClipboardED25519")
        expect(wrapper.find("#kycKey").text()).toBe("KYC Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopy to ClipboardED25519")
        expect(wrapper.find("#freezeKey").text()).toBe("Freeze Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopy to ClipboardED25519")
        expect(wrapper.find("#wipeKey").text()).toBe("Wipe Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopy to ClipboardED25519")
        expect(wrapper.find("#supplyKey").text()).toBe("Supply Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopy to ClipboardED25519")
        expect(wrapper.find("#feeScheduleKey").text()).toBe("Fee Schedule Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopy to ClipboardED25519")
        expect(wrapper.find("#pauseKey").text()).toBe("Pause Keyc539 536f 9599 daef eeb7 7767 7aa1 aeea 2242 dfc7 cca9 2348 c228 a518 7a0f af2bCopy to ClipboardED25519")

        wrapper.unmount()
        await flushPromises()
    });

    it("Should display no token keys", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_TOKEN_WITHOUT_KEYS.token_id
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN_WITHOUT_KEYS);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/balances"
        mock.onGet(matcher2).reply(200, SAMPLE_BALANCES);

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

        expect(wrapper.vm.tokenBalanceCache.state.value).toBe(EntityCacheStateV2.Stopped)
        expect(wrapper.vm.tokenNftCache.state.value).toBe(EntityCacheStateV2.Started)

        expect(wrapper.text()).toMatch(RegExp("^Non Fungible Token " + testTokenId))

        expect(wrapper.text()).toMatch("Token Keys")
        expect(wrapper.find("#adminKey").text()).toBe("Admin KeyToken is immutable")
        expect(wrapper.find("#kycKey").text()).toBe("KYC KeyKYC is not required")
        expect(wrapper.find("#freezeKey").text()).toBe("Freeze KeyToken cannot be frozen")
        expect(wrapper.find("#wipeKey").text()).toBe("Wipe KeyToken cannot be wiped")
        expect(wrapper.find("#supplyKey").text()).toBe("Supply KeyToken cannot be minted or burnt")
        expect(wrapper.find("#feeScheduleKey").text()).toBe("Fee Schedule KeyCustom fee schedule is immutable")
        expect(wrapper.find("#pauseKey").text()).toBe("Pause KeyToken cannot be paused")

        wrapper.unmount()
        await flushPromises()
    });

    it("Should display 'Token deleted' banner", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const testTokenId = SAMPLE_TOKEN_WITHOUT_KEYS.token_id
        const matcher1 = "/api/v1/tokens/" + testTokenId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN_WITHOUT_KEYS);
        const matcher2 = "/api/v1/tokens/" + testTokenId + "/balances"
        mock.onGet(matcher2).reply(200, SAMPLE_BALANCES);

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

        expect(wrapper.text()).toMatch(RegExp("^Non Fungible Token " + testTokenId + "Token is deleted"))

        wrapper.unmount()
        await flushPromises()
    });
});
