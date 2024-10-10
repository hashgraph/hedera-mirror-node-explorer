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
import AccountDetails from "@/pages/AccountDetails.vue";
import {
    SAMPLE_ACCOUNT,
    SAMPLE_ACCOUNT_BALANCES,
    SAMPLE_ACCOUNT_DUDE,
    SAMPLE_NETWORK_NODES,
    SAMPLE_NETWORK_STAKE,
    SAMPLE_NONFUNGIBLE,
    SAMPLE_TOKEN,
    SAMPLE_TOKEN_DUDE,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import NodeDetails from "@/pages/NodeDetails.vue";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("NodeDetails.vue", () => {

    it("should display node details", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const node = 0
        const matcher1 = "api/v1/network/nodes"
        mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_NODES);

        const matcher2 = "api/v1/network/stake"
        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_STAKE);

        const wrapper = mount(NodeDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                nodeId: node.toString()
            }
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Node " + node))
        expect(wrapper.get("#nodeAccountValue").text()).toBe("0.0.3")
        expect(wrapper.get("#descriptionValue").text()).toBe("Hosted by Hedera | East Coast, USA")
        expect(wrapper.get("#publicKeyValue").text()).toBe("3082 01a2 300d 0609CopyRSA")
        expect(wrapper.get("#fileValue").text()).toBe("0.0.102")
        expect(wrapper.get("#rangeFromValue").text()).toBe("4:10:06.0411 PMJun 6, 2022, UTC")
        expect(wrapper.get("#rangeToValue").text()).toBe("None")
        expect(wrapper.get("#nodeCertHashValue").text()).toBe("d317 df77 a69d 6bbe 1add adf8 6bCopy")
        expect(wrapper.get("#serviceEndpointsValue").text()).toBe("3.211.248.172:502113.211.248.172:5021235.231.208.148:035.231.208.148:5021135.231.208.148:50212")

        expect(wrapper.get("#yearlyRate").text()).toBe("Last Period Reward Rate1%APPROX ANNUAL EQUIVALENT")
        expect(wrapper.get("#consensusStake").text()).toBe("Stake for Consensus6,000,000HBAR")
        expect(wrapper.get("#consensusStakePercent").text()).toBe("25% of total")
        expect(wrapper.get("#minStake").text()).toBe("Min Stake1,000,000HBAR")
        expect(wrapper.get("#maxStake").text()).toBe("Max Stake30,000,000HBAR")
        expect(wrapper.get("#rewarded").text()).toBe("Staked for Reward5,000,000HBAR")
        expect(wrapper.get("#rewardedPercent").text()).toBe("26.32% of total")
        expect(wrapper.get("#notRewarded").text()).toBe("Staked For No Reward1,000,000HBAR")
        expect(wrapper.get("#notRewardedPercent").text()).toBe("20% of total")
        expect(wrapper.get("#stakingPeriod").text()).toBe("Current Staking Period24HOURS")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should update when account id changes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const account1 = SAMPLE_ACCOUNT
        let matcher1 = "/api/v1/accounts/" + account1.account
        mock.onGet(matcher1).reply(200, account1);

        const matcher2 = "/api/v1/transactions"
        mock.onGet(matcher2).reply(200, SAMPLE_TRANSACTIONS);

        const token1 = SAMPLE_TOKEN
        let matcher3 = "/api/v1/tokens/" + token1.token_id
        mock.onGet(matcher3).reply(200, token1);

        const nft = SAMPLE_NONFUNGIBLE
        const matcher4 = "/api/v1/tokens/" + nft.token_id
        mock.onGet(matcher4).reply(200, nft);

        const matcher5 = "/api/v1/balances"
        mock.onGet(matcher5).reply(200, SAMPLE_ACCOUNT_BALANCES);

        let matcher8 = "/api/v1/accounts/" + account1.account + "/rewards"
        mock.onGet(matcher8).reply(200, {rewards: []})

        let matcher9 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account + "/allowances/crypto"
        mock.onGet(matcher9).reply(200, {rewards: []})

        let matcher10 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account + "/allowances/tokens"
        mock.onGet(matcher10).reply(200, {rewards: []})

        let matcher11 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account + "/allowances/nfts"
        mock.onGet(matcher11).reply(200, {nfts: []})

        let matcher12 = "api/v1/tokens"
        mock.onGet(matcher12).reply(200, { tokens: [] });

        let matcher13 = "api/v1/accounts/" + SAMPLE_ACCOUNT.account + "/nfts"
        mock.onGet(matcher13).reply(200, { nfts: [] });

        const wrapper = mount(AccountDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: SAMPLE_ACCOUNT.account ?? undefined
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch("AccountAccount ID:" + SAMPLE_ACCOUNT.account)
        expect(wrapper.get("#keyValue").text()).toBe(
            "aa2f 7b3e 759f 4531 ec2e 7941 afa4 49e6 a6e6 10ef b52a dae8 9e9c d8e9 d40d dcbf" +
            "Copy" +
            "ED25519")

        const account2 = SAMPLE_ACCOUNT_DUDE
        matcher1 = "/api/v1/accounts/" + account2.account
        mock.onGet(matcher1).reply(200, account2);

        matcher9 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_DUDE.account + "/allowances/crypto"
        mock.onGet(matcher9).reply(200, {rewards: []})

        matcher10 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_DUDE.account + "/allowances/tokens"
        mock.onGet(matcher10).reply(200, {rewards: []})

        matcher11 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_DUDE.account + "/allowances/nfts"
        mock.onGet(matcher11).reply(200, {nfts: []})

        matcher12 = "api/v1/tokens"
        mock.onGet(matcher12).reply(200, { tokens: [] });

        matcher13 = "api/v1/accounts/" + SAMPLE_ACCOUNT_DUDE.account + "/nfts"
        mock.onGet(matcher13).reply(200, { nfts: [] });

        const token2 = SAMPLE_TOKEN_DUDE
        matcher3 = "/api/v1/tokens/" + token2.token_id
        mock.onGet(matcher3).reply(200, token2);

        matcher8 = "/api/v1/accounts/" + account2.account + "/rewards"
        mock.onGet(matcher8).reply(200, {rewards: []})

        await wrapper.setProps({
            accountId: SAMPLE_ACCOUNT_DUDE.account ?? undefined
        })
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch("AccountAccount ID:" + SAMPLE_ACCOUNT_DUDE.account)
        expect(wrapper.get("#keyValue").text()).toBe(
            "38f1 ea46 0e95 d97e ea13 aefa c760 eaf9 9015 4b80 a360 8ab0 1d4a 2649 44d6 8746" +
            "Copy" +
            "ED25519")
        expect(wrapper.get("#memoValue").text()).toBe("Account Dude Memo in clear")
        expect(wrapper.find("#aliasValue").exists()).toBe(false)
        expect(wrapper.get("#expiresAtValue").text()).toBe("3:33:21.4109 AMApr 11, 2022, UTC")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("77d 3h 40min")
        expect(wrapper.get("#maxAutoAssociationValue").text()).toBe("Unlimited Auto Associations")
        expect(wrapper.get("#receiverSigRequiredValue").text()).toBe("true")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    });

    it("Should detect invalid account ID", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const invalidAccountId = "0.0.0.1000"
        const wrapper = mount(AccountDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: invalidAccountId
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.get("#notificationBanner").text()).toBe("Invalid account ID, address or alias: " + invalidAccountId)

        wrapper.unmount()
        await flushPromises()
    });
});
