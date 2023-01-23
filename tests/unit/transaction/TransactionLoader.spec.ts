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

import {TransactionLoader} from "@/components/transaction/TransactionLoader";
import {computed} from "vue";
import {flushPromises} from "@vue/test-utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {SAMPLE_CONTRACTCALL_TRANSACTIONS} from "../Mocks";
import {base64DecToArr, byteToHex} from "@/utils/B64Utils";

describe("TransactionLoaderV2.ts", () => {

    it("Loader without configuration", async () => {

        const transactionLoc = computed(() => null)
        const transactionId = computed(() => null)
        const loader = new TransactionLoader(transactionLoc, transactionId)

        loader.requestLoad()
        await flushPromises()

        expect(loader.entity.value).toBe(null)
        expect(loader.error.value).toBe(null)
        expect(loader.got404.value).toBe(false)

        expect(loader.transaction.value).toBe(null)
        expect(loader.transactions.value).toStrictEqual([])
        expect(loader.formattedTransactionId.value).toBe(null)
        expect(loader.consensusTimestamp.value).toBe(null)
        expect(loader.transactionType.value).toBe(null)
        expect(loader.contractId.value).toBe(null)
        expect(loader.result.value).toBe(null)
        expect(loader.hasSucceeded.value).toBe(false)
        expect(loader.netAmount.value).toBe(0)
        expect(loader.maxFee.value).toBe(0)
        expect(loader.formattedHash.value).toBe(null)
        expect(loader.entityDescriptor.value).toBe(null)
        expect(loader.systemContract.value).toBe(null)
        expect(loader.scheduledTransaction.value).toBe(null)
        expect(loader.schedulingTransaction.value).toBe(null)
        expect(loader.parentTransaction.value).toBe(null)
        expect(loader.childTransactions.value).toStrictEqual([])
        expect(loader.blockNumber.value).toBe(null)
    })

    //
    // Timestamp
    //

    it("Loader with timestamp only", async () => {

        const SAMPLE_CONTRACTCALL_TRANSACTION = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0]

        const mock = new MockAdapter(axios)
        const matcher1 = "/api/v1/transactions?timestamp=" + SAMPLE_CONTRACTCALL_TRANSACTION.consensus_timestamp
        mock.onGet(matcher1).reply(200, { transactions: [SAMPLE_CONTRACTCALL_TRANSACTION]});
        const matcher2 = "/api/v1/transactions/" + SAMPLE_CONTRACTCALL_TRANSACTION.transaction_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS);

        const transactionLoc = computed(() => SAMPLE_CONTRACTCALL_TRANSACTION.consensus_timestamp)
        const transactionId = computed(() => null)
        const loader = new TransactionLoader(transactionLoc, transactionId)

        loader.requestLoad()
        await flushPromises()

        expect(loader.entity.value).toStrictEqual(SAMPLE_CONTRACTCALL_TRANSACTION)
        expect(loader.transactions.value).toStrictEqual(SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions)
        expect(loader.error.value).toBe(null)
        expect(loader.got404.value).toBe(false)
    })

    it("Loader with timestamp and transaction id", async () => {

        const SAMPLE_CONTRACTCALL_TRANSACTION = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0]

        const mock = new MockAdapter(axios)
        const matcher1 = "/api/v1/transactions?timestamp=" + SAMPLE_CONTRACTCALL_TRANSACTION.consensus_timestamp
        mock.onGet(matcher1).reply(200, { transactions: [SAMPLE_CONTRACTCALL_TRANSACTION]});
        const matcher2 = "/api/v1/transactions/" + SAMPLE_CONTRACTCALL_TRANSACTION.transaction_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS);

        const transactionLoc = computed(() => SAMPLE_CONTRACTCALL_TRANSACTION.consensus_timestamp)
        const transactionId = computed(() => SAMPLE_CONTRACTCALL_TRANSACTION.transaction_id)
        const loader = new TransactionLoader(transactionLoc, transactionId)

        loader.requestLoad()
        await flushPromises()

        expect(loader.entity.value).toStrictEqual(SAMPLE_CONTRACTCALL_TRANSACTION)
        expect(loader.transactions.value).toStrictEqual(SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions)
        expect(loader.error.value).toBe(null)
        expect(loader.got404.value).toBe(false)

        mock.resetHandlers() // Required because next test does not have mock !
    })

    it("Loader with non existent timestamp", async () => {

        const SAMPLE_CONTRACTCALL_TRANSACTION = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0]

        const transactionLoc = computed(() => SAMPLE_CONTRACTCALL_TRANSACTION.consensus_timestamp)
        const transactionId = computed(() => null)
        const loader = new TransactionLoader(transactionLoc, transactionId)

        loader.requestLoad()
        await flushPromises()

        expect(loader.entity.value).toStrictEqual(null)
        expect(loader.error.value).not.toBeNull()
        expect(loader.got404.value).toBe(true)
    })


    //
    // Transaction hash
    //

    it("Loader with transaction hash only", async () => {

        const SAMPLE_CONTRACTCALL_TRANSACTION = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0]
        const SAMPLE_CONTRACTCALL_TRANSACTION_HASH = byteToHex(base64DecToArr(SAMPLE_CONTRACTCALL_TRANSACTION.transaction_hash))

        const mock = new MockAdapter(axios)
        const matcher1 = "/api/v1/transactions/" + SAMPLE_CONTRACTCALL_TRANSACTION_HASH
        mock.onGet(matcher1).reply(200, { transactions: [SAMPLE_CONTRACTCALL_TRANSACTION]});
        const matcher2 = "/api/v1/transactions/" + SAMPLE_CONTRACTCALL_TRANSACTION.transaction_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS);

        const transactionLoc = computed(() => SAMPLE_CONTRACTCALL_TRANSACTION_HASH)
        const transactionId = computed(() => null)
        const loader = new TransactionLoader(transactionLoc, transactionId)

        loader.requestLoad()
        await flushPromises()

        expect(loader.entity.value).toStrictEqual(SAMPLE_CONTRACTCALL_TRANSACTION)
        expect(loader.transactions.value).toStrictEqual(SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions)
        expect(loader.error.value).toBe(null)
        expect(loader.got404.value).toBe(false)

    })

    it("Loader with transaction hash and transaction id", async () => {

        const SAMPLE_CONTRACTCALL_TRANSACTION = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0]
        const SAMPLE_CONTRACTCALL_TRANSACTION_HASH = byteToHex(base64DecToArr(SAMPLE_CONTRACTCALL_TRANSACTION.transaction_hash))

        const mock = new MockAdapter(axios)
        const matcher1 = "/api/v1/transactions/" + SAMPLE_CONTRACTCALL_TRANSACTION_HASH
        mock.onGet(matcher1).reply(200, { transactions: [SAMPLE_CONTRACTCALL_TRANSACTION]});
        const matcher2 = "/api/v1/transactions/" + SAMPLE_CONTRACTCALL_TRANSACTION.transaction_id
        mock.onGet(matcher2).reply(200, SAMPLE_CONTRACTCALL_TRANSACTIONS);

        const transactionLoc = computed(() => SAMPLE_CONTRACTCALL_TRANSACTION_HASH)
        const transactionId = computed(() => SAMPLE_CONTRACTCALL_TRANSACTION.transaction_id)
        const loader = new TransactionLoader(transactionLoc, transactionId)

        loader.requestLoad()
        await flushPromises()

        expect(loader.entity.value).toStrictEqual(SAMPLE_CONTRACTCALL_TRANSACTION)
        expect(loader.transactions.value).toStrictEqual(SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions)
        expect(loader.error.value).toBe(null)
        expect(loader.got404.value).toBe(false)

        mock.resetHandlers() // Required because next test does not have mock !
    })

    it("Loader with non existent transaction hash", async () => {

        const SAMPLE_CONTRACTCALL_TRANSACTION = SAMPLE_CONTRACTCALL_TRANSACTIONS.transactions[0]
        const SAMPLE_CONTRACTCALL_TRANSACTION_HASH = byteToHex(base64DecToArr(SAMPLE_CONTRACTCALL_TRANSACTION.transaction_hash))

        const transactionLoc = computed(() => SAMPLE_CONTRACTCALL_TRANSACTION_HASH)
        const transactionId = computed(() => null)
        const loader = new TransactionLoader(transactionLoc, transactionId)

        loader.requestLoad()
        await flushPromises()

        expect(loader.entity.value).toStrictEqual(null)
        expect(loader.error.value).not.toBeNull()
        expect(loader.got404.value).toBe(true)

    })



})

