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
import TransactionDetails from "@/pages/TransactionDetails.vue";
import HbarTransferGraphF from "@/components/transfer_graphs/HbarTransferGraphF.vue";
import TokenTransferGraph from "@/components/transfer_graphs/TokenTransferGraphF.vue";
import NftTransferGraph from "@/components/transfer_graphs/NftTransferGraph.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import axios, {AxiosRequestConfig} from "axios";
import {
    SAMPLE_ASSOCIATED_TOKEN,
    SAMPLE_ASSOCIATED_TOKEN_2,
    SAMPLE_BLOCKSRESPONSE,
    SAMPLE_CONTRACT,
    SAMPLE_CONTRACT_RESULT_DETAILS,
    SAMPLE_CONTRACTCALL_TRANSACTIONS,
    SAMPLE_ETHEREUM_TRANSACTIONS_ON_ACCOUNT,
    SAMPLE_ETHEREUM_TRANSACTIONS_ON_CONTRACT,
    SAMPLE_FAILED_TRANSACTION,
    SAMPLE_FAILED_TRANSACTIONS,
    SAMPLE_NETWORK_EXCHANGERATE,
    SAMPLE_NETWORK_NODES,
    SAMPLE_PARENT_CHILD_TRANSACTIONS,
    SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS,
    SAMPLE_SYSTEM_CONTRACT_CALL_TRANSACTIONS,
    SAMPLE_TOKEN,
    SAMPLE_TOKEN_ASSOCIATE_TRANSACTION,
    SAMPLE_TOKEN_ASSOCIATIONS,
    SAMPLE_TOKEN_CALL_TRANSACTIONS,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import {HMSF} from "@/utils/HMSF";
import {normalizeTransactionId} from "@/utils/TransactionID";
import Oruga from "@oruga-ui/oruga-next";
import ContractResult from "@/components/contract/ContractResult.vue";
import {base64DecToArr, byteToHex} from "@/utils/B64Utils";
import {NodeRegistry} from "@/components/node/NodeRegistry";
import {CacheUtils} from "@/utils/cache/CacheUtils";

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

    const mock = new MockAdapter(axios);
    const matcher1 = "/api/v1/network/exchangerate"
    mock.onGet(matcher1).reply(200, SAMPLE_NETWORK_EXCHANGERATE);
    const matcher2 = "/api/v1/blocks"
    mock.onGet(matcher2).reply(200, SAMPLE_BLOCKSRESPONSE);
    const matcher3 = "api/v1/network/nodes"
    mock.onGet(matcher3).reply(200, SAMPLE_NETWORK_NODES);
    NodeRegistry.instance.reload()

    beforeEach(() => CacheUtils.clearAll())

    it("Should display transaction details with token transfers and fee transfers", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const matcher1 = "/api/v1/transactions/" + SAMPLE_TRANSACTION.transaction_id
        mock.onGet(matcher1).reply(200, SAMPLE_TRANSACTIONS);
        const matcher11 = "/api/v1/transactions"
        mock.onGet(matcher11).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == SAMPLE_TRANSACTION.consensus_timestamp) {
                return [200, { transactions: [SAMPLE_TRANSACTION]}]
            } else {
                return [404]
            }
        });

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: SAMPLE_TRANSACTION.consensus_timestamp,
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
        expect(wrapper.get("#nodeAccountValue").text()).toBe("0.0.5Hosted by Hedera | Central, USA")
        expect(wrapper.get("#durationValue").text()).toBe("2min")
        expect(() => wrapper.get("#associatedTokenId")).toThrowError()
        expect(() => wrapper.get("#entityId")).toThrowError()

        expect(wrapper.findComponent(HbarTransferGraphF).exists()).toBe(true)
        expect(wrapper.findComponent(TokenTransferGraph).exists()).toBe(true)
        expect(wrapper.findComponent(NftTransferGraph).exists()).toBe(true)

        expect(wrapper.findComponent(HbarTransferGraphF).text()).toBe(
            "Fee TransfersAccountHbar AmountAccountHbar Amount0.0.29624024-0.00470065-$0.0012\n\n" +
            "0.0.40.00022028$0.0001Hosted by Hedera | East Coast, USA\n\n" +
            "0.0.980.00448037$0.0011Hedera fee collection account")

        expect(wrapper.findComponent(TokenTransferGraph).text()).toBe(
            "Token TransfersAccountToken AmountAccountToken Amount0.0.29624024-123423\n\n" +
            "0.0.29693911123423Transfer")

        expect(wrapper.findComponent(NftTransferGraph).text()).toBe(
            "NFT TransfersNone")

    });

    it("Should display the contract result and logs (using consensus timestamp)", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transactionId = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0].transaction_id
        const contractId = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0].entity_id
        const timestamp = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0].consensus_timestamp

        const matcher1 = "/api/v1/transactions/" + transactionId
        mock.onGet(matcher1).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS);
        const matcher11 = "/api/v1/transactions"
        mock.onGet(matcher11).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == timestamp) {
                return [200, SAMPLE_CONTRACTCALL_TRANSACTIONS]
            } else {
                return [404]
            }
        });

        const matcher2 = "/api/v1/contracts/" + contractId
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT)
        const matcher3 = "/api/v1/contracts/" + contractId + "/results/" + timestamp
        mock.onGet(matcher3).reply(200, SAMPLE_CONTRACT_RESULT_DETAILS)
        const matcher5 = "/api/v1/contracts/results/" + transactionId + "/actions"
        mock.onGet(matcher5).reply(200, "[]")

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: timestamp,
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transactionId, true)))
        expect(wrapper.get("#transactionTypeValue").text()).toBe("CONTRACT CALL")
        expect(wrapper.get("#entityId").text()).toBe("Contract ID" + contractId)
        expect(wrapper.get("#durationValue").text()).toBe("None")

        expect(wrapper.findComponent(ContractResult).exists()).toBe(true)
        expect(wrapper.findComponent(ContractResult).text()).toMatch(RegExp("^Contract Result"))
        expect(wrapper.get("#resultValue").text()).toBe("SUCCESS")
        expect(wrapper.get("#fromValue").text()).toBe("0x00000000000000000000000000000000000ce9b4Copy to Clipboard(0.0.846260)")
        expect(wrapper.get("#toValue").text()).toBe("0x0000000000000000000000000000000000103783Copy to Clipboard(0.0.1062787)")
        expect(wrapper.get("#typeValue").text()).toBe("None")
        // expect(wrapper.get("#functionParametersValue").text()).toBe("18cb afe5 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0017 4876 e800 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 001b 2702 b2a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 00a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c e9b4 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0183 1e10 602d 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0003 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c ba44 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000d 1ea6 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0010 3708Copy to Clipboard")
        expect(wrapper.get("#errorMessageValue").text()).toBe("None")
        expect(wrapper.get("#gasLimitValue").text()).toBe("480,000")
        expect(wrapper.get("#gasUsedValue").text()).toBe("384,000")
        expect(wrapper.get("#maxFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#maxPriorityFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#gasPriceValue").text()).toBe("None")
        expect(wrapper.findAll("#logIndexValue").length).toBe(3)
    });

    it("Should display the contract result and logs (using transaction hash)", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const SAMPLE_TRANSACTION = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0]
        const transactionId = SAMPLE_TRANSACTION.transaction_id
        const transactionHashBase64 = SAMPLE_TRANSACTION.transaction_hash
        const transactionHash = byteToHex(base64DecToArr(transactionHashBase64))
        const contractId = SAMPLE_TRANSACTION.entity_id
        const timestamp = SAMPLE_TRANSACTION.consensus_timestamp

        const matcher1 = "/api/v1/transactions/" + transactionHash
        mock.onGet(matcher1).reply(200, { transactions: [SAMPLE_TRANSACTION]});
        const matcher11 = "/api/v1/transactions/" + transactionId
        mock.onGet(matcher11).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS);
        const matcher12 = "/api/v1/transactions"
        mock.onGet(matcher12).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == timestamp) {
                return [200, SAMPLE_CONTRACTCALL_TRANSACTIONS]
            } else {
                return [404]
            }
        });
        const matcher2 = "/api/v1/contracts/" + contractId
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT)
        const matcher3 = "/api/v1/contracts/" + contractId  + "/results/" + timestamp
        mock.onGet(matcher3).reply(200, SAMPLE_CONTRACT_RESULT_DETAILS)
        const matcher5 = "/api/v1/contracts/results/" + transactionId + "/actions"
        mock.onGet(matcher5).reply(200, "[]")

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: transactionHash
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transactionId, true)))
        expect(wrapper.get("#transactionTypeValue").text()).toBe("CONTRACT CALL")
        expect(wrapper.get("#entityId").text()).toBe("Contract ID" + contractId)

        expect(wrapper.findComponent(ContractResult).exists()).toBe(true)
        expect(wrapper.findComponent(ContractResult).text()).toMatch(RegExp("^Contract Result"))
        expect(wrapper.get("#resultValue").text()).toBe("SUCCESS")
        expect(wrapper.get("#fromValue").text()).toBe("0x00000000000000000000000000000000000ce9b4Copy to Clipboard(0.0.846260)")
        expect(wrapper.get("#toValue").text()).toBe("0x0000000000000000000000000000000000103783Copy to Clipboard(0.0.1062787)")
        expect(wrapper.get("#typeValue").text()).toBe("None")
        // expect(wrapper.get("#functionParametersValue").text()).toBe("18cb afe5 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0017 4876 e800 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 001b 2702 b2a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 00a0 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c e9b4 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0183 1e10 602d 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0003 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000c ba44 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 000d 1ea6 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0000 0010 3708Copy to Clipboard")
        expect(wrapper.get("#errorMessageValue").text()).toBe("None")
        expect(wrapper.get("#gasLimitValue").text()).toBe("480,000")
        expect(wrapper.get("#gasUsedValue").text()).toBe("384,000")
        expect(wrapper.get("#maxFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#maxPriorityFeePerGasValue").text()).toBe("None")
        expect(wrapper.get("#gasPriceValue").text()).toBe("None")
        expect(wrapper.findAll("#logIndexValue").length).toBe(3)
    });

    it("Should update when consensus timestamp changes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        let matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == SAMPLE_TRANSACTION.consensus_timestamp) {
                return [200, {transactions: [SAMPLE_TRANSACTION]}]
            } else {
                return [404]
            }
        });

        let matcher11 = "/api/v1/transactions/" + SAMPLE_TRANSACTION.transaction_id
        mock.onGet(matcher11).reply(200, SAMPLE_TRANSACTIONS)

        const matcher2 = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: SAMPLE_TRANSACTION.consensus_timestamp
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
        matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == transaction.consensus_timestamp) {
                return [200, {transactions: [transaction]}]
            } else {
                return [404]
            }
        });
        matcher11 = "/api/v1/transactions/" + transaction.transaction_id
        mock.onGet(matcher11).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS)

        const entityId = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0].entity_id
        const matcher3 = "/api/v1/contracts/" + entityId
        mock.onGet(matcher3).reply(200, SAMPLE_CONTRACT)

        await wrapper.setProps({
            transactionLoc: transaction.consensus_timestamp
        })
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transaction.transaction_id, true)))
        expect(wrapper.get("#transactionTypeValue").text()).toBe("CONTRACT CALL")
        expect(wrapper.get("#memoValue").text()).toBe("Mirror Node acceptance test: 2022-03-07T15:09:26.066680977Z Execute contract")

        expect(wrapper.get('#entityIdName').text()).toBe("Contract ID")
        expect(wrapper.get('#entityIdValue').text()).toBe(entityId)

        expect(wrapper.findComponent(HbarTransferGraphF).exists()).toBe(true)
        expect(wrapper.findComponent(TokenTransferGraph).text()).toContain("Token TransfersNone")
        expect(wrapper.findComponent(NftTransferGraph).text()).toContain("NFT TransfersNone")

    });

    it("Should display a notification banner for failed transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == SAMPLE_FAILED_TRANSACTION.consensus_timestamp) {
                return [200, {transactions: [SAMPLE_FAILED_TRANSACTION]}]
            } else {
                return [404]
            }
        });

        const matcher11 = "/api/v1/transactions/" + SAMPLE_FAILED_TRANSACTION.transaction_id
        mock.onGet(matcher11).reply(200, SAMPLE_FAILED_TRANSACTIONS);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: SAMPLE_FAILED_TRANSACTION.consensus_timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(SAMPLE_FAILED_TRANSACTION.transaction_id, true)))

        const banner = wrapper.findComponent(NotificationBanner)
        expect(banner.exists()).toBe(true)
        expect(banner.text()).toBe("CONTRACT_REVERT_EXECUTED")
    });

    it("Should detect invalid transaction timestamp", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const invalidTimestamp = "1600000000.000000000"
        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: invalidTimestamp
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.get("#notificationBanner").text()).toBe("Transaction with timestamp " + invalidTimestamp + " was not found")
    });

    it("Should display the name of the system contract called", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = SAMPLE_SYSTEM_CONTRACT_CALL_TRANSACTIONS.transactions[0]

        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == transaction.consensus_timestamp) {
                return [200, {transactions: [transaction]}]
            } else {
                return [404]
            }
        });
        const matcher11 = "/api/v1/transactions/" + transaction.transaction_id
        mock.onGet(matcher11).reply(200, SAMPLE_SYSTEM_CONTRACT_CALL_TRANSACTIONS)

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: transaction.consensus_timestamp
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transaction.transaction_id, true)))
        expect(wrapper.get("#transactionTypeValue").text()).toBe("CONTRACT CALL")
        expect(wrapper.get("#entityId").text()).toBe("Contract IDHedera Token Service System Contract")
    });

    it("Should display a link to the scheduled transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const SCHEDULING = SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS.transactions[0]
        const SCHEDULED = SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS.transactions[1]
        const TOKEN_ID = SCHEDULED.token_transfers ? SCHEDULED.token_transfers[0].token_id : "0.0.1304757"
        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == SCHEDULING.consensus_timestamp) {
                return [200, {transactions: [SCHEDULING]}]
            } else {
                return [404]
            }
        });
        const matcher11 = "/api/v1/transactions/" + SCHEDULING.transaction_id
        mock.onGet(matcher11).reply(200, SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS);
        const matcher5 = "/api/v1/tokens/" + TOKEN_ID
        mock.onGet(matcher5).reply(200, SAMPLE_TOKEN)

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: SCHEDULING.consensus_timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(SCHEDULING.transaction_id, true)))

        const link = wrapper.get("#scheduledLink")
        expect(link.text()).toBe("Show scheduled transaction")
        expect(link.get('a').attributes("href")).toBe(
            "/mainnet/transaction/" + SCHEDULED.consensus_timestamp
        )
    });

    it("Should display a link to the scheduling transaction", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const SCHEDULING = SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS.transactions[0]
        const SCHEDULED = SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS.transactions[1]
        const TOKEN_ID = SCHEDULED.token_transfers ? SCHEDULED.token_transfers[0].token_id : "0.0.1304757"
        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == SCHEDULED.consensus_timestamp) {
                return [200, {transactions: [SCHEDULED]}]
            } else {
                return [404]
            }
        });
        const matcher11 = "/api/v1/transactions/" + SCHEDULED.transaction_id
        mock.onGet(matcher11).reply(200, SAMPLE_SCHEDULING_SCHEDULED_TRANSACTIONS);
        const matcher2 = "/api/v1/tokens/" + TOKEN_ID
        mock.onGet(matcher2).reply(200, SAMPLE_TOKEN);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: SCHEDULED.consensus_timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(SCHEDULED.transaction_id, true)))

        const link = wrapper.get("#schedulingLink")
        expect(link.text()).toBe("Show schedule create transaction")
        expect(link.get('a').attributes("href")).toBe(
            "/mainnet/transaction/" + SCHEDULING.consensus_timestamp
        )
    });

    it("Should display a link to the parent transaction",
        async () => {

            await router.push("/") // To avoid "missing required param 'network'" error

            const PARENT = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[0]
            const CHILD = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[1]
            const TOKEN_ID = CHILD.nft_transfers ? CHILD.nft_transfers[0].token_id : "0.0.48193741"
            const matcher1 = "/api/v1/transactions"
            mock.onGet(matcher1).reply((config: AxiosRequestConfig) => {
                if (config.params.timestamp == CHILD.consensus_timestamp) {
                    return [200, {transactions: [CHILD]}]
                } else {
                    return [404]
                }
            });
            const matcher11 = "/api/v1/transactions/" + CHILD.transaction_id
            mock.onGet(matcher11).reply(200, SAMPLE_PARENT_CHILD_TRANSACTIONS);
            const matcher2 = "/api/v1/tokens/" + TOKEN_ID
            mock.onGet(matcher2).reply(200, SAMPLE_TOKEN);

            const wrapper = mount(TransactionDetails, {
                global: {
                    plugins: [router, Oruga]
                },
                props: {
                    transactionLoc: CHILD.consensus_timestamp,
                },
            });

            await flushPromises()
            // console.log(wrapper.html())
            // console.log(wrapper.text())

            expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(CHILD.transaction_id, true)))

            const link = wrapper.get("#parentTransactionValue")
            expect(link.text()).toBe("CONTRACT CALL")
            expect(link.get('a').attributes("href")).toBe(
                "/mainnet/transaction/" + PARENT.consensus_timestamp
            )
        });

    it("Should display link to the child transactions", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const PARENT = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[0]
        const CHILD1 = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[1]
        const CHILD2 = SAMPLE_PARENT_CHILD_TRANSACTIONS.transactions[2]
        const matcher1 = "/api/v1/transactions"
        mock.onGet(matcher1).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == PARENT.consensus_timestamp) {
                return [200, {transactions: [PARENT]}]
            } else {
                return [404]
            }
        });
        const matcher11 = "/api/v1/transactions/" + PARENT.transaction_id
        mock.onGet(matcher11).reply(200, SAMPLE_PARENT_CHILD_TRANSACTIONS);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: PARENT.consensus_timestamp
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
            "/mainnet/transaction/" + CHILD1.consensus_timestamp
        )
        expect(links[1].attributes("href")).toBe(
            "/mainnet/transaction/" + CHILD2.consensus_timestamp
        )
    });

    it("Should display transaction details with account/token association", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transaction = SAMPLE_TOKEN_ASSOCIATE_TRANSACTION
        const token1 = SAMPLE_ASSOCIATED_TOKEN
        const token2 = SAMPLE_ASSOCIATED_TOKEN_2

        const matcher1 = "/api/v1/transactions/" + transaction.transaction_id
        mock.onGet(matcher1).reply(200, { transactions: [transaction]});
        const matcher11 = "/api/v1/transactions"
        mock.onGet(matcher11).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == transaction.consensus_timestamp) {
                return [200, { transactions: [transaction]}]
            } else {
                return [404]
            }
        });
        const matcher3 = "/api/v1/accounts/" + transaction.entity_id + "/tokens?limit=100"
        mock.onGet(matcher3).reply(200, SAMPLE_TOKEN_ASSOCIATIONS);
        const matcher4 = "/api/v1/tokens/" + token1.token_id
        mock.onGet(matcher4).reply(200, token1);
        const matcher5 = "/api/v1/tokens/" + token2.token_id
        mock.onGet(matcher5).reply(200, token2);

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: transaction.consensus_timestamp,
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transaction.transaction_id, true)))

        expect(wrapper.get("#transactionTypeValue").text()).toBe("TOKEN ASSOCIATE")
        expect(wrapper.get("#consensusAtValue").text()).toBe("6:51:52.1505 PMDec 21, 2022, UTC") // UTC because of HMSF.forceUTC
        expect(wrapper.get("#transactionHashValue").text()).toBe("4786 0799 99df 169a 3834 9249 d3c9 a548 9a83 f1c7 c51b 6b1e deb8 1347 a496 d931 83e2 4a43 ad03 372e bc50 1528 a603 2debCopy to Clipboard")

        expect(wrapper.get("#associatedTokenIdValue").text()).toBe("0.0.34332104HSuite0.0.49292859TokenA7")
        expect(wrapper.get("#entityIdValue").text()).toBe("0.0.642949")

        expect(wrapper.findComponent(HbarTransferGraphF).exists()).toBe(true)
        expect(wrapper.findComponent(TokenTransferGraph).exists()).toBe(true)
        expect(wrapper.findComponent(NftTransferGraph).exists()).toBe(true)

        expect(wrapper.findComponent(HbarTransferGraphF).text()).toBe("Fee TransfersAccountHbar AmountAccountHbar Amount0.0.642949-1.15905210-$0.2852\n\n" +
            "0.0.30.05805847$0.0143Hosted by Hedera | East Coast, USA\n\n" +
            "0.0.981.10099363$0.2709Hedera fee collection account")
        expect(wrapper.findComponent(TokenTransferGraph).text()).toBe("Token TransfersNone")
        expect(wrapper.findComponent(NftTransferGraph).text()).toBe("NFT TransfersNone")

    });

    it("Should display CONTRACT CALL details with link to (proxied) token as entity ID", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transactionId = SAMPLE_TOKEN_CALL_TRANSACTIONS.transactions[0].transaction_id
        const entityId = SAMPLE_TOKEN_CALL_TRANSACTIONS.transactions[0].entity_id
        const timestamp = SAMPLE_TOKEN_CALL_TRANSACTIONS.transactions[0].consensus_timestamp

        const matcher1 = "/api/v1/transactions/" + transactionId
        mock.onGet(matcher1).reply(200, SAMPLE_TOKEN_CALL_TRANSACTIONS);
        const matcher11 = "/api/v1/transactions"
        mock.onGet(matcher11).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == timestamp) {
                return [200, SAMPLE_TOKEN_CALL_TRANSACTIONS]
            } else {
                return [404]
            }
        });

        const matcher2 = "/api/v1/contracts/" + entityId
        mock.onGet(matcher2).reply(404)

        const matcher3 = "/api/v1/tokens/" + entityId
        mock.onGet(matcher3).reply(200, SAMPLE_TOKEN)

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transactionId, true)))
        expect(wrapper.text()).toMatch(RegExp("CONTRACT CALL"))
        expect(wrapper.get("#entityIdName").text()).toBe("Token ID")
        expect(wrapper.get("#entityIdValue").text()).toMatch(entityId)
    });

    it("Should display ETHEREUM TX details with link to account as entity ID", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transactionId = SAMPLE_ETHEREUM_TRANSACTIONS_ON_ACCOUNT.transactions[0].transaction_id
        const entityId = SAMPLE_ETHEREUM_TRANSACTIONS_ON_ACCOUNT.transactions[0].entity_id
        const timestamp = SAMPLE_ETHEREUM_TRANSACTIONS_ON_ACCOUNT.transactions[0].consensus_timestamp

        const matcher1 = "/api/v1/transactions/" + transactionId
        mock.onGet(matcher1).reply(200, SAMPLE_ETHEREUM_TRANSACTIONS_ON_ACCOUNT);
        const matcher11 = "/api/v1/transactions"
        mock.onGet(matcher11).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == timestamp) {
                return [200, SAMPLE_ETHEREUM_TRANSACTIONS_ON_ACCOUNT]
            } else {
                return [404]
            }
        });

        const matcher2 = "/api/v1/contracts/" + entityId
        mock.onGet(matcher2).reply(404)

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transactionId, true)))
        expect(wrapper.text()).toMatch(RegExp("ETHEREUM TRANSACTION"))
        expect(wrapper.get("#entityIdName").text()).toBe("Account ID")
        expect(wrapper.get("#entityIdValue").text()).toMatch(entityId)
    });

    it("Should display ETHEREUM TX details with link to contract as entity ID", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const transactionId = SAMPLE_ETHEREUM_TRANSACTIONS_ON_CONTRACT.transactions[0].transaction_id
        const entityId = SAMPLE_ETHEREUM_TRANSACTIONS_ON_CONTRACT.transactions[0].entity_id
        const timestamp = SAMPLE_ETHEREUM_TRANSACTIONS_ON_CONTRACT.transactions[0].consensus_timestamp

        const matcher1 = "/api/v1/transactions/" + transactionId
        mock.onGet(matcher1).reply(200, SAMPLE_ETHEREUM_TRANSACTIONS_ON_CONTRACT);
        const matcher11 = "/api/v1/transactions"
        mock.onGet(matcher11).reply((config: AxiosRequestConfig) => {
            if (config.params.timestamp == timestamp) {
                return [200, SAMPLE_ETHEREUM_TRANSACTIONS_ON_CONTRACT]
            } else {
                return [404]
            }
        });

        const matcher2 = "/api/v1/contracts/" + entityId
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT)

        const wrapper = mount(TransactionDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                transactionLoc: timestamp
            },
        });

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toMatch(RegExp("^Transaction " + normalizeTransactionId(transactionId, true)))
        expect(wrapper.text()).toMatch(RegExp("ETHEREUM TRANSACTION"))
        expect(wrapper.get("#entityIdName").text()).toBe("Contract ID")
        expect(wrapper.get("#entityIdValue").text()).toMatch(entityId)
    });

});
