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
import TransactionDetails from "@/pages/TransactionDetails.vue";
import HbarTransferGraphF from "@/components/transfer_graphs/HbarTransferGraphF.vue";
import TokenTransferGraph from "@/components/transfer_graphs/TokenTransferGraphF.vue";
import NftTransferGraph from "@/components/transfer_graphs/NftTransferGraph.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import axios from "axios";
import {
    SAMPLE_BLOCKSRESPONSE,
    SAMPLE_COINGECKO,
    SAMPLE_CONTRACT_RESULT_DETAILS,
    SAMPLE_CONTRACTCALL_TRANSACTIONS,
    SAMPLE_FAILED_TRANSACTION,
    SAMPLE_FAILED_TRANSACTIONS, SAMPLE_PARENT_CHILD_TRANSACTIONS,
    SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS,
    SAMPLE_SYSTEM_CONTRACT_CALL_TRANSACTIONS,
    SAMPLE_TOKEN,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import {HMSF} from "@/utils/HMSF";
import {normalizeTransactionId} from "@/utils/TransactionID";
import Oruga from "@oruga-ui/oruga-next";
import ContractResultAndLogs from "@/components/transaction/ContractResultAndLogs.vue";

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

describe("TransactionDetails.vue", () => {

    it("Should display transaction details with token transfers and fee transfers", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/transactions/" + SAMPLE_TRANSACTION.transaction_id
        mock.onGet(matcher1).reply(200, SAMPLE_TRANSACTIONS);

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN);

        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);

        const matcher4 = "/api/v1/blocks"
        mock.onGet(matcher4).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: SAMPLE_TRANSACTION.transaction_id
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(SAMPLE_TRANSACTION.transaction_id, true)))

        expect(wrapper.get("#transactionTypeValue").text()).toBe("CRYPTO TRANSFER")
        expect(wrapper.get("#consensusAtValue").text()).toBe("5:12:31.6676 AMFeb 28, 2022, UTC") // UTC because of HMSF.forceUTC
        expect(wrapper.get("#transactionHashValue").text()).toBe("a012 9612 32ed 7d28 4283 6e95 f7e9 c435 6fdf e2de 0819 9091 701a 969c 1d1f d936 71d3 078e e83b 28fb 460a 88b4 cbd8 ecd2Copy to Clipboard")
        // expect(wrapper.get("#netAmountValue").text()).toBe("0.00000000$0.0000")
        expect(wrapper.get("#chargedFeeValue").text()).toBe("0.00470065$0.0012")
        expect(wrapper.get("#maxFeeValue").text()).toBe("1.00000000$0.2460")

        expect(wrapper.get("#memoValue").text()).toBe("None")
        expect(wrapper.get("#operatorAccountValue").text()).toBe("0.0.29624024")
        expect(wrapper.get("#nodeAccountValue").text()).toBe("0.0.7Node 4 - testnet")
        expect(wrapper.get("#durationValue").text()).toBe("2min")
        expect(wrapper.get("#entityId").text()).toBe("Account ID0.0.29662956")

        expect(wrapper.findComponent(HbarTransferGraphF).exists()).toBe(true)
        expect(wrapper.findComponent(TokenTransferGraph).exists()).toBe(true)
        expect(wrapper.findComponent(NftTransferGraph).exists()).toBe(true)

        expect(wrapper.findComponent(HbarTransferGraphF).text()).toBe(
            "Fee TransfersAccountHbar AmountAccountHbar Amount0.0.29624024-0.00470065-$0.0012\n\n" +
            "0.0.70.00022028$0.0001Node 4 - testnet\n\n" +
            "0.0.980.00448037$0.0011Hedera fee collection account")

        expect(wrapper.findComponent(TokenTransferGraph).text()).toBe(
            "Token TransfersAccountToken AmountAccountToken Amount0.0.29624024-123423\n\n" +
            "0.0.29693911123423Transfer")

        expect(wrapper.findComponent(NftTransferGraph).text()).toBe(
            "NFT TransfersNone")

    });

    it("Should display the contract result and logs (using transaction id)", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const transactionId = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0].transaction_id
        const contractId = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0].entity_id

        const matcher1 = "/api/v1/transactions/" + transactionId
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS);
        const matcher2 = "/api/v1/contracts/results/" + transactionId
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_RESULT_DETAILS)
        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);
        const matcher4 = "/api/v1/blocks"
        mock.onGet(matcher4).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: transactionId
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transactionId, true)))
        expect(wrapper.get("#transactionTypeValue").text()).toBe("CONTRACT CALL")
        expect(wrapper.get("#entityId").text()).toBe("Contract ID" + contractId)

        expect(wrapper.findComponent(ContractResultAndLogs).exists()).toBe(true)
        expect(wrapper.findComponent(ContractResultAndLogs).text()).toMatch(RegExp("^Contract Result"))
        expect(wrapper.get("#resultValue").text()).toBe("SUCCESS")
        expect(wrapper.get("#fromValue").text()).toBe("0000 0000 0000 0000 0000 0000 0000 0000 000c e9b4Copy to Clipboard")
        expect(wrapper.get("#toValue").text()).toBe("0000 0000 0000 0000 0000 0000 0000 0000 0010 3783Copy to Clipboard")
        expect(wrapper.get("#typeValue").text()).toBe("None")
        expect(wrapper.get("#functionParametersValue").text()).toBe("18cb afe5 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0017 4876 e800 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 001b 2702 b2a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 00a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c e9b4 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0183 1e10 602d 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0003 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c ba44 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000d 1ea6 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0010 3708Copy to Clipboard")
        expect(wrapper.get("#errorMessageValue").text()).toBe("None")
        expect(wrapper.get("#gasLimitValue").text()).toBe("480,000")
        expect(wrapper.get("#gasUsedValue").text()).toBe("384,000")
        expect(wrapper.get("#maxFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#maxPriorityFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#gasPriceValue").text()).toBe("0.00000000$0.0000")
        expect(wrapper.findAll("#logIndexValue").length).toBe(4)
    });

    it("Should display the contract result and logs (using transaction hash)", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const transactionId = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0].transaction_id
        const transactionHash = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0].transaction_hash
        const contractId = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0].entity_id

        const matcher1 = "/api/v1/transactions/" + transactionHash
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS);
        const matcher2 = "/api/v1/contracts/results/" + transactionId
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT_RESULT_DETAILS)
        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);
        const matcher4 = "/api/v1/blocks"
        mock.onGet(matcher4).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: transactionHash
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transactionId, true)))
        expect(wrapper.get("#transactionTypeValue").text()).toBe("CONTRACT CALL")
        expect(wrapper.get("#entityId").text()).toBe("Contract ID" + contractId)

        expect(wrapper.findComponent(ContractResultAndLogs).exists()).toBe(true)
        expect(wrapper.findComponent(ContractResultAndLogs).text()).toMatch(RegExp("^Contract Result"))
        expect(wrapper.get("#resultValue").text()).toBe("SUCCESS")
        expect(wrapper.get("#fromValue").text()).toBe("0000 0000 0000 0000 0000 0000 0000 0000 000c e9b4Copy to Clipboard")
        expect(wrapper.get("#toValue").text()).toBe("0000 0000 0000 0000 0000 0000 0000 0000 0010 3783Copy to Clipboard")
        expect(wrapper.get("#typeValue").text()).toBe("None")
        expect(wrapper.get("#functionParametersValue").text()).toBe("18cb afe5 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0017 4876 e800 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 001b 2702 b2a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 00a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c e9b4 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0183 1e10 602d 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0003 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c ba44 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000d 1ea6 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0010 3708Copy to Clipboard")
        expect(wrapper.get("#errorMessageValue").text()).toBe("None")
        expect(wrapper.get("#gasLimitValue").text()).toBe("480,000")
        expect(wrapper.get("#gasUsedValue").text()).toBe("384,000")
        expect(wrapper.get("#maxFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#maxPriorityFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#gasPriceValue").text()).toBe("0.00000000$0.0000")
        expect(wrapper.findAll("#logIndexValue").length).toBe(4)
    });

    it("Should update when transaction id changes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        let matcher1 = "/api/v1/transactions/" + SAMPLE_TRANSACTION.transaction_id
        mock.onGet(matcher1).reply(200, SAMPLE_TRANSACTIONS);

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN);

        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);

        const matcher4 = "/api/v1/blocks"
        mock.onGet(matcher4).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: SAMPLE_TRANSACTION.transaction_id
            },
        });

        await flushPromises()

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(SAMPLE_TRANSACTION.transaction_id, true)))
        expect(wrapper.get("#transactionTypeValue").text()).toBe("CRYPTO TRANSFER")
        expect(wrapper.get("#memoValue").text()).toBe("None")

        expect(wrapper.findComponent(HbarTransferGraphF).exists()).toBe(true)
        expect(wrapper.findComponent(TokenTransferGraph).exists()).toBe(true)
        expect(wrapper.findComponent(NftTransferGraph).text()).toContain("NFT TransfersNone")

        const transaction = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0]
        matcher1 = "/api/v1/transactions/" + transaction.transaction_id
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS);

        await wrapper.setProps({
            transactionId: transaction.transaction_id
        })
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transaction.transaction_id, true)))
        expect(wrapper.get("#transactionTypeValue").text()).toBe("CONTRACT CALL")
        expect(wrapper.get("#memoValue").text()).toBe("Mirror Node acceptance test: 2022-03-07T15:09:26.066680977Z Execute contract")

        expect(wrapper.findComponent(HbarTransferGraphF).exists()).toBe(true)
        expect(wrapper.findComponent(TokenTransferGraph).text()).toContain("Token TransfersNone")
        expect(wrapper.findComponent(NftTransferGraph).text()).toContain("NFT TransfersNone")

    });

    it("Should display a notification banner for failed transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const matcher1 = "/api/v1/transactions/" + SAMPLE_FAILED_TRANSACTION.transaction_id
        mock.onGet(matcher1).reply(200, SAMPLE_FAILED_TRANSACTIONS);

        const matcher2 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher2).reply(200, SAMPLE_COINGECKO);

        const matcher3 = "/api/v1/blocks"
        mock.onGet(matcher3).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga],
            },
            props: {
                transactionId: SAMPLE_FAILED_TRANSACTION.transaction_id
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(SAMPLE_FAILED_TRANSACTION.transaction_id, true)))

        const banner = wrapper.findComponent(NotificationBanner)
        expect(banner.exists()).toBe(true)
        expect(banner.text()).toBe("CONTRACT_REVERT_EXECUTED")
    });

    it("Should detect invalid transaction ID", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const invalidTransactionId = "0.0.0.1000-1646025139-152901498"
        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: invalidTransactionId
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.get("#notificationBanner").text()).toBe("Invalid transaction ID: " + invalidTransactionId)
    });

    it("Should display the name of the system contract called", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const txnId = SAMPLE_SYSTEM_CONTRACT_CALL_TRANSACTIONS.transactions[0].transaction_id

        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/transactions/" + txnId
        mock.onGet(matcher1).reply(200, SAMPLE_SYSTEM_CONTRACT_CALL_TRANSACTIONS)
        const matcher2 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher2).reply(200, SAMPLE_COINGECKO);
        const matcher3 = "/api/v1/blocks"
        mock.onGet(matcher3).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: txnId
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(txnId, true)))
        expect(wrapper.get("#transactionTypeValue").text()).toBe("CONTRACT CALL")
        expect(wrapper.get("#entityId").text()).toBe("Contract IDHedera Token Service System Contract")
    });

    it("Should display a link to the scheduled transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const SCHEDULING = SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS.transactions[0]
        const SCHEDULED = SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS.transactions[1]
        const matcher1 = "/api/v1/transactions/" + SCHEDULING.transaction_id
        mock.onGet(matcher1).reply(200, SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS);

        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);

        const matcher4 = "/api/v1/blocks"
        mock.onGet(matcher4).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: SCHEDULING.transaction_id,
                consensusTimestamp: SCHEDULING.consensus_timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(SCHEDULING.transaction_id, true)))

        const link = wrapper.get("#scheduledLink")
        expect(link.text()).toBe("Show scheduled transaction")
        expect(link.get('a').attributes("href")).toBe(
            "/testnet/transaction/" + SCHEDULED.transaction_id + "?t=" + SCHEDULED.consensus_timestamp
        )
    });

    it("Should display a link to the scheduling transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const SCHEDULING = SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS.transactions[0]
        const SCHEDULED = SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS.transactions[1]
        const TOKEN_ID = SCHEDULED.token_transfers ? SCHEDULED.token_transfers[0].token_id : "0.0.1304757"
        const matcher1 = "/api/v1/transactions/" + SCHEDULED.transaction_id
        mock.onGet(matcher1).reply(200, SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS);

        const matcher2 = "/api/v1/tokens/" + TOKEN_ID
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN);

        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);

        const matcher4 = "/api/v1/blocks"
        mock.onGet(matcher4).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: SCHEDULED.transaction_id,
                consensusTimestamp: SCHEDULED.consensus_timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(SCHEDULED.transaction_id, true)))

        const link = wrapper.get("#schedulingLink")
        expect(link.text()).toBe("Show scheduling transaction")
        expect(link.get('a').attributes("href")).toBe(
            "/testnet/transaction/" + SCHEDULING.transaction_id + "?t=" + SCHEDULING.consensus_timestamp
        )
    });

    it("Should display a link to the parent transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const PARENT = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[0]
        const CHILD = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[1]
        const TOKEN_ID = CHILD.nft_transfers ? CHILD.nft_transfers[0].token_id : "0.0.48193741"
        const matcher1 = "/api/v1/transactions/" + CHILD.transaction_id
        mock.onGet(matcher1).reply(200, SAMPLE_PARENT_CHILD_TRANSACTIONS);

        const matcher2 = "/api/v1/tokens/" + TOKEN_ID
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN);

        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);

        const matcher4 = "/api/v1/blocks"
        mock.onGet(matcher4).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: CHILD.transaction_id,
                consensusTimestamp: CHILD.consensus_timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(CHILD.transaction_id, true)))

        const link = wrapper.get("#parentTransactionValue")
        expect(link.text()).toBe("CONTRACT CALL")
        expect(link.get('a').attributes("href")).toBe(
            "/testnet/transaction/" + PARENT.transaction_id + "?t=" + PARENT.consensus_timestamp
        )
    });

    it("Should display link to the child transactions", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const PARENT = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[0]
        const CHILD1 = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[1]
        const CHILD2 = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[2]
        const matcher1 = "/api/v1/transactions/" + PARENT.transaction_id
        mock.onGet(matcher1).reply(200, SAMPLE_PARENT_CHILD_TRANSACTIONS);

        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);

        const matcher4 = "/api/v1/blocks"
        mock.onGet(matcher4).reply(200, SAMPLE_BLOCKSRESPONSE);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionId: PARENT.transaction_id,
                consensusTimestamp: PARENT.consensus_timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(PARENT.transaction_id, true)))

        const children = wrapper.get("#childTransactionsValue")
        expect(children.text()).toBe("#1TOKEN MINT#2CRYPTO TRANSFER")

        const links = children.findAll('a')
        expect(links[0].attributes("href")).toBe(
            "/testnet/transaction/" + CHILD1.transaction_id + "?t=" + CHILD1.consensus_timestamp
        )
        expect(links[1].attributes("href")).toBe(
            "/testnet/transaction/" + CHILD2.transaction_id + "?t=" + CHILD2.consensus_timestamp
        )
    });
});
