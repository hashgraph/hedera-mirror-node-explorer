// noinspection DuplicatedCode

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

import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import axios from "axios";
import AccountDetails from "@/pages/AccountDetails.vue";
import {
    SAMPLE_ACCOUNT,
    SAMPLE_ACCOUNT_BALANCES,
    SAMPLE_ACCOUNT_DELETED,
    SAMPLE_ACCOUNT_DUDE,
    SAMPLE_ACCOUNT_HBAR_BALANCE,
    SAMPLE_ACCOUNT_STAKING_ACCOUNT,
    SAMPLE_ACCOUNT_STAKING_NODE,
    SAMPLE_FAILED_TRANSACTIONS, SAMPLE_NETWORK_EXCHANGERATE,
    SAMPLE_NETWORK_NODES,
    SAMPLE_NONFUNGIBLE,
    SAMPLE_TOKEN,
    SAMPLE_TOKEN_DUDE, SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS,
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import TransactionTable from "@/components/transaction/TransactionTable.vue";
import {HMSF} from "@/utils/HMSF";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {TransactionID} from "@/utils/TransactionID";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import {NodeRegistry} from "@/components/node/NodeRegistry";

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

describe("AccountDetails.vue", () => {

    const ALIAS_HEX = "1220 0000 fc06 34e2 ab45 5eff 393f 0481 9efa 262f e5e6 ab1c 7ed1 d4f8 5fbc d8e6 e296"

    it("Should display account details", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT);

        const matcher2 = "/api/v1/transactions"
        mock.onGet(matcher2).reply(200, SAMPLE_TRANSACTIONS);

        const token = SAMPLE_TOKEN
        const matcher3 = "/api/v1/tokens/" + token.token_id
        mock.onGet(matcher3).reply(200, token);

        const nft = SAMPLE_NONFUNGIBLE
        const matcher4 = "/api/v1/tokens/" + nft.token_id
        mock.onGet(matcher4).reply(200, nft);

        const matcher5 = "/api/v1/balances"
        mock.onGet(matcher5).reply(200, SAMPLE_ACCOUNT_BALANCES);

        const matcher6 = "/api/v1/network/exchangerate"
        mock.onGet(matcher6).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher7 = "/api/v1/transactions?timestamp=" + SAMPLE_ACCOUNT.created_timestamp
        mock.onGet(matcher7).reply(200, SAMPLE_TRANSACTIONS);

        const matcher8 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account + "/rewards"
        mock.onGet(matcher8).reply(200, { rewards: [] })

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

        expect(wrapper.text()).toMatch("Account " + SAMPLE_ACCOUNT.account)
        expect(wrapper.get("#balanceValue").text()).toBe("23.42647909$5.7637998234231ĦFRENSKINGDOM")
        expect(wrapper.get("#keyValue").text()).toBe(
            "aa2f 7b3e 759f 4531 ec2e 7941 afa4 49e6 a6e6 10ef b52a dae8 9e9c d8e9 d40d dcbf" +
            "Copy to Clipboard" +
            "ED25519")
        expect(wrapper.get("#memoValue").text()).toBe("None")
        expect(wrapper.get("#aliasValue").text()).toBe(ALIAS_HEX + "Copy to Clipboard")
        expect(wrapper.get("#createTransactionValue").text()).toBe(TransactionID.normalize(SAMPLE_TRANSACTION.transaction_id))

        expect(wrapper.get("#expiresAtValue").text()).toBe("None")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("90 days")
        expect(wrapper.get("#maxAutoAssociationValue").text()).toBe("0")
        expect(wrapper.get("#receiverSigRequiredValue").text()).toBe("false")

        expect(wrapper.get("#evmAddressValue").text()).toBe(
            "0000 0000 0000 0000 0000 0000 0000 0000 000b 2607" +
            "Copy to Clipboard")
        expect(wrapper.get("#ethereumNonceValue").text()).toBe("0")

        expect(wrapper.get("#stakedToName").text()).toBe("Staked to")
        expect(wrapper.get("#stakedToValue").text()).toBe("None")

        const select = wrapper.findComponent(TransactionFilterSelect)
        expect(select.exists()).toBe(true)
        expect(select.text()).toBe(
            "TYPES: ALLCONTRACT CALLCONTRACT CREATECONTRACT DELETECONTRACT UPDATECRYPTO ADD LIVE " +
            "HASHCRYPTO APPROVE ALLOWANCECRYPTO CREATE ACCOUNTCRYPTO DELETE ACCOUNTCRYPTO DELETE ALLOWANCECRYPTO " +
            "DELETE LIVE HASHCRYPTO TRANSFERCRYPTO UPDATE ACCOUNTETHEREUM TRANSACTIONFILE " +
            "APPENDFILE CREATEFILE DELETEFILE UPDATEFREEZEHCS CREATE TOPICHCS DELETE TOPICHCS SUBMIT MESSAGEHCS " +
            "UPDATE TOPICNODE STAKE UPDATEPSEUDORANDOM NUMBER GENERATESCHEDULE CREATESCHEDULE DELETESCHEDULE SIGNSYSTEM DELETESYSTEM UNDELETETOKEN " +
            "ASSOCIATETOKEN BURNTOKEN CREATETOKEN DELETETOKEN DISSOCIATETOKEN FEE SCHEDULE UPDATETOKEN FREEZETOKEN " +
            "KYC GRANTTOKEN KYC REVOKETOKEN MINTTOKEN PAUSETOKEN UNFREEZETOKEN UNPAUSETOKEN " +
            "UPDATETOKEN WIPEUNCHECKED SUBMIT")

        expect(wrapper.find("#recentTransactions").exists()).toBe(true)
        expect(wrapper.findComponent(TransactionTable).exists()).toBe(true)
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

        let matcher8 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account + "/rewards"
        mock.onGet(matcher8).reply(200, { rewards: [] })

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

        expect(wrapper.text()).toMatch("Account " + SAMPLE_ACCOUNT.account)
        expect(wrapper.get("#keyValue").text()).toBe(
            "aa2f 7b3e 759f 4531 ec2e 7941 afa4 49e6 a6e6 10ef b52a dae8 9e9c d8e9 d40d dcbf" +
            "Copy to Clipboard" +
            "ED25519")

        const account2 = SAMPLE_ACCOUNT_DUDE
        matcher1 = "/api/v1/accounts/" + account2.account
        mock.onGet(matcher1).reply(200, account2);

        const token2 = SAMPLE_TOKEN_DUDE
        matcher3 = "/api/v1/tokens/" + token2.token_id
        mock.onGet(matcher3).reply(200, token2);

        matcher8 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_DUDE.account + "/rewards"
        mock.onGet(matcher8).reply(200, { rewards: [] })

        await wrapper.setProps({
            accountId: SAMPLE_ACCOUNT_DUDE.account ?? undefined
        })
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch("Account " + SAMPLE_ACCOUNT_DUDE.account)
        expect(wrapper.get("#keyValue").text()).toBe(
            "38f1 ea46 0e95 d97e ea13 aefa c760 eaf9 9015 4b80 a360 8ab0 1d4a 2649 44d6 8746" +
            "Copy to Clipboard" +
            "ED25519")
        expect(wrapper.get("#memoValue").text()).toBe("Account Dude Memo in clear")
        expect(wrapper.get("#aliasValue").text()).toBe("None")
        expect(wrapper.get("#expiresAtValue").text()).toBe("3:33:21.4109 AMApr 11, 2022, UTC")
        expect(wrapper.get("#autoRenewPeriodValue").text()).toBe("77d 3h 40min")
        expect(wrapper.get("#maxAutoAssociationValue").text()).toBe("10")
        expect(wrapper.get("#receiverSigRequiredValue").text()).toBe("true")

        wrapper.unmount()
        await flushPromises()

        expect(wrapper.vm.balanceCache.autoRefresh.value).toBe(false)
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

        expect(wrapper.get("#notificationBanner").text()).toBe("Invalid account ID: " + invalidAccountId)
    });

    it("Should display notification of deleted contract", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const deletedAccount = SAMPLE_ACCOUNT_DELETED
        const matcher1 = "/api/v1/accounts/" + deletedAccount.account
        mock.onGet(matcher1).reply(200, deletedAccount);

        const matcher2 = "/api/v1/transactions"
        mock.onGet(matcher2).reply(200, SAMPLE_TRANSACTIONS);

        const token = SAMPLE_TOKEN
        const matcher3 = "/api/v1/tokens/" + token.token_id
        mock.onGet(matcher3).reply(200, token);

        const nft = SAMPLE_NONFUNGIBLE
        const matcher4 = "/api/v1/tokens/" + nft.token_id
        mock.onGet(matcher4).reply(200, nft);

        const matcher5 = "/api/v1/balances"
        mock.onGet(matcher5).reply(200, SAMPLE_ACCOUNT_BALANCES);

        const matcher8 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_DELETED.account + "/rewards"
        mock.onGet(matcher8).reply(200, { rewards: [] })

        const wrapper = mount(AccountDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: deletedAccount.account ?? undefined
            },
        });

        await flushPromises()
        // console.log(wrapper.text())

            expect(wrapper.text()).toMatch(RegExp("Account " + deletedAccount.account))

        const banner = wrapper.findComponent(NotificationBanner)
        expect(banner.exists()).toBe(true)
        expect(banner.text()).toBe("Account is deleted")
    });

    it("Should display account staking to node", async () => {

        process.env = Object.assign(process.env, { VUE_APP_ENABLE_STAKING: true });
        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_STAKING_NODE.account
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT_STAKING_NODE);

        const matcher2 = "/api/v1/transactions"
        mock.onGet(matcher2).reply(200, SAMPLE_FAILED_TRANSACTIONS);

        const matcher3 = "/api/v1/network/nodes"
        mock.onGet(matcher3).reply(200, SAMPLE_NETWORK_NODES);
        NodeRegistry.instance.reload()

        const matcher4 = "/api/v1/balances"
        mock.onGet(matcher4).reply(200, SAMPLE_ACCOUNT_HBAR_BALANCE);

        const matcher5 = "/api/v1/network/exchangerate"
        mock.onGet(matcher5).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher8 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_STAKING_NODE.account + "/rewards"
        mock.onGet(matcher8).reply(200, { rewards: [] })

        const wrapper = mount(AccountDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: SAMPLE_ACCOUNT_STAKING_NODE.account ?? undefined
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.get("#stakedToName").text()).toBe("Staked to Node")
        expect(wrapper.get("#stakedToValue").text()).toBe("1 - Hosted by Hedera | East Coast, USA")
        expect(wrapper.get("#pendingRewardValue").text()).toBe("0.12345678$0.0304Period Started Nov 11, 2022, 00:00 UTC")
        expect(wrapper.get("#declineRewardValue").text()).toBe("Accepted")
    });

    it("Should display account staking to account", async () => {

        process.env = Object.assign(process.env, { VUE_APP_ENABLE_STAKING: true });
        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_STAKING_ACCOUNT.account
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT_STAKING_ACCOUNT);

        const matcher2 = "/api/v1/transactions"
        mock.onGet(matcher2).reply(200, SAMPLE_FAILED_TRANSACTIONS);

        const matcher3 = "/api/v1/network/nodes"
        mock.onGet(matcher3).reply(200, SAMPLE_NETWORK_NODES);
        NodeRegistry.instance.reload()

        const matcher4 = "/api/v1/balances"
        mock.onGet(matcher4).reply(200, SAMPLE_ACCOUNT_HBAR_BALANCE);

        const matcher5 = "/api/v1/network/exchangerate"
        mock.onGet(matcher5).reply(200, SAMPLE_NETWORK_EXCHANGERATE);

        const matcher8 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_STAKING_ACCOUNT.account + "/rewards"
        mock.onGet(matcher8).reply(200, { rewards: [] })

        const wrapper = mount(AccountDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                accountId: SAMPLE_ACCOUNT_STAKING_NODE.account ?? undefined
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.get("#stakedToName").text()).toBe("Staked to Account")
        expect(wrapper.get("#stakedToValue").text()).toBe("0.0.5Hosted by Hedera | Central, USA")
        expect(wrapper.get("#pendingRewardValue").text()).toBe("0.00000000$0.0000")
        expect(wrapper.find("#declineRewardValue").exists()).toBe(false)
    });
});
