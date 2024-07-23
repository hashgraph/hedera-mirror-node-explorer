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

import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest'
import {nextTick, ref} from "vue";
import {SearchController} from "@/components/search/SearchController";
import {EntityID} from "@/utils/EntityID"
import {flushPromises} from "@vue/test-utils";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
    SAMPLE_ACCOUNT,
    SAMPLE_ACCOUNTS,
    SAMPLE_BLOCK,
    SAMPLE_CONTRACT,
    SAMPLE_CONTRACT_AS_ACCOUNT,
    SAMPLE_CONTRACT_RESULT_DETAILS,
    SAMPLE_TOKEN,
    SAMPLE_TOPIC,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import {fetchGetURLs} from "../MockUtils";
import {base64DecToArr, byteToHex} from "../../../src/utils/B64Utils";

describe("SearchController.vue", () => {

    const mock = new MockAdapter(axios)
    const TRANSACTION_HASH = byteToHex(base64DecToArr(SAMPLE_TRANSACTION.transaction_hash))

    // We duplicate SAMPLE_ACCOUNT and patch its account id so that it conflicts with block number
    const SAMPLE_PATCHED_ACCOUNT = JSON.parse(JSON.stringify(SAMPLE_ACCOUNT))
    const SAMPLE_PATCHED_ACCOUNT_ID = new EntityID(0, 0, SAMPLE_BLOCK.number)
    SAMPLE_PATCHED_ACCOUNT.account = SAMPLE_PATCHED_ACCOUNT_ID.toString()

    beforeEach(() => {

        {
            // Account search

            const matcher0 = "api/v1/accounts/" + SAMPLE_ACCOUNT.account
            mock.onGet(matcher0).reply(200, SAMPLE_ACCOUNT)

            const matcher1 = "api/v1/accounts/" + SAMPLE_ACCOUNT.evm_address.slice(2)
            mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT)

            const matcher2 = "api/v1/accounts/" + SAMPLE_ACCOUNT.alias
            mock.onGet(matcher2).reply(200, SAMPLE_ACCOUNT)

            const matcher3 = "api/v1/accounts/?account.publickey="
                + SAMPLE_ACCOUNTS.accounts[0].key.key + "&limit=10"
            mock.onGet(matcher3).reply(200, SAMPLE_ACCOUNTS)
        }

        {
            // Contract search

            const matcher0 = "api/v1/accounts/" + SAMPLE_CONTRACT_AS_ACCOUNT.account
            mock.onGet(matcher0).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT)

            const matcher1 = "api/v1/accounts/" + SAMPLE_CONTRACT_AS_ACCOUNT.evm_address.slice(2)
            mock.onGet(matcher1).reply(200, SAMPLE_CONTRACT_AS_ACCOUNT)

            const matcher2 = "api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
            mock.onGet(matcher2).reply(200, SAMPLE_CONTRACT)

            const matcher3 = "api/v1/contracts/" + SAMPLE_CONTRACT.evm_address.slice(2)
            mock.onGet(matcher3).reply(200, SAMPLE_CONTRACT)

        }

        {
            // Token search

            const matcher0 = "api/v1/tokens/" + SAMPLE_TOKEN.token_id
            mock.onGet(matcher0).reply(200, SAMPLE_TOKEN)
        }

        {
            // Topic search
            const matcher0 = "api/v1/topics/" + SAMPLE_TOPIC.topic_id
            mock.onGet(matcher0).reply(200, SAMPLE_TOPIC)
        }

        {
            // Transaction search

            const matcher0 = "api/v1/transactions/" + SAMPLE_TRANSACTION.transaction_id
            mock.onGet(matcher0).reply(200, SAMPLE_TRANSACTIONS)

            const matcher1 = "api/v1/transactions?timestamp=" + SAMPLE_TRANSACTION.consensus_timestamp
            mock.onGet(matcher1).reply(200, SAMPLE_TRANSACTIONS)

            const matcher2 = "api/v1/transactions/" + TRANSACTION_HASH
            mock.onGet(matcher2).reply(200, SAMPLE_TRANSACTIONS)

            const matcher3 = "api/v1/contracts/results/" + SAMPLE_CONTRACT_RESULT_DETAILS.hash.slice(2)
            mock.onGet(matcher3).reply(200, SAMPLE_CONTRACT_RESULT_DETAILS)

        }

        {
            // Block

            const matcher0 = "api/v1/blocks/" + SAMPLE_BLOCK.number
            mock.onGet(matcher0).reply(200, SAMPLE_BLOCK)

            const matcher1 = "api/v1/blocks/" + SAMPLE_BLOCK.hash.slice(2)
            mock.onGet(matcher1).reply(200, SAMPLE_BLOCK)

            const matcher = "/api/v1/accounts/" + SAMPLE_PATCHED_ACCOUNT.account
            mock.onGet(matcher).reply(200, SAMPLE_PATCHED_ACCOUNT)

        }

        vi.useFakeTimers()
    })

    afterEach(() => {
        mock.reset()
        vi.useRealTimers()
    })

    it("basic", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

    })


    //
    // Account
    //

    it("search account with id", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_ACCOUNT.account
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_ACCOUNT.account)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/0.0.730631",
            "api/v1/contracts/0.0.730631",
            "api/v1/tokens/0.0.730631",
            "api/v1/topics/0.0.730631",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_ACCOUNT.account)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Account " + SAMPLE_ACCOUNT.account)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_ACCOUNT)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search account with evm address", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_ACCOUNT.evm_address
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_ACCOUNT.evm_address)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/00000000000000000000000000000000000b2607",
            "api/v1/contracts/00000000000000000000000000000000000b2607",
            "api/v1/tokens/0.0.730631",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_ACCOUNT.evm_address)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Account " + SAMPLE_ACCOUNT.account)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_ACCOUNT)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])


    })

    it("search account with partial evm address", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        const PARTIAL_ADDRESS = "0x0b2607"
        inputText.value = PARTIAL_ADDRESS
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(PARTIAL_ADDRESS)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/00000000000000000000000000000000000b2607",
            "api/v1/contracts/00000000000000000000000000000000000b2607",
            "api/v1/tokens/0.0.730631",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(PARTIAL_ADDRESS)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Account " + SAMPLE_ACCOUNT.account)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_ACCOUNT)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search account with alias", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_ACCOUNT.alias
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_ACCOUNT.alias)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/CIQAAAH4AY2OFK2FL37TSPYEQGPPUJRP4XTKWHD62HKPQX543DTOFFQ",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_ACCOUNT.alias)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Account " + SAMPLE_ACCOUNT.account)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_ACCOUNT)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search account with public key", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_ACCOUNT.key.key
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_ACCOUNT.key.key)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/?account.publickey=aa2f7b3e759f4531ec2e7941afa449e6a6e610efb52adae89e9cd8e9d40ddcbf&limit=10",
            "api/v1/contracts/results/aa2f7b3e759f4531ec2e7941afa449e6a6e610efb52adae89e9cd8e9d40ddcbf",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_ACCOUNT.key.key)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Account " + SAMPLE_ACCOUNT.account)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_ACCOUNT)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })


    //
    // Contract
    //

    it("search contract with id", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_CONTRACT.contract_id
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_CONTRACT.contract_id)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/0.0.749775",
            "api/v1/contracts/0.0.749775",
            "api/v1/tokens/0.0.749775",
            "api/v1/topics/0.0.749775",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_CONTRACT.contract_id)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(2)
        expect(controller.candidates.value[0].description).toBe("Contract " + SAMPLE_CONTRACT.contract_id)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_CONTRACT)
        expect(controller.candidates.value[1].description).toBe("Account " + SAMPLE_CONTRACT.contract_id)
        expect(controller.candidates.value[1].extra).toBeNull()
        expect(controller.candidates.value[1].nonExistent).toBe(false)
        expect(controller.candidates.value[1].entity).toStrictEqual(SAMPLE_CONTRACT_AS_ACCOUNT)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search contract with evm address", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_CONTRACT.evm_address
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_CONTRACT.evm_address)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/00000000000000000000000000000000000b70cf",
            "api/v1/contracts/00000000000000000000000000000000000b70cf",
            "api/v1/tokens/0.0.749775",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_CONTRACT.evm_address)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(2)
        expect(controller.candidates.value[0].description).toBe("Contract " + SAMPLE_CONTRACT.contract_id)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_CONTRACT)
        expect(controller.candidates.value[1].description).toBe("Account " + SAMPLE_CONTRACT.contract_id)
        expect(controller.candidates.value[1].extra).toBeNull()
        expect(controller.candidates.value[1].nonExistent).toBe(false)
        expect(controller.candidates.value[1].entity).toStrictEqual(SAMPLE_CONTRACT_AS_ACCOUNT)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search contract with partial evm address", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        const PARTIAL_EVM_ADDRESS = "0x0b70cf"
        inputText.value = PARTIAL_EVM_ADDRESS
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(PARTIAL_EVM_ADDRESS)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/00000000000000000000000000000000000b70cf",
            "api/v1/contracts/00000000000000000000000000000000000b70cf",
            "api/v1/tokens/0.0.749775",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(PARTIAL_EVM_ADDRESS)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(2)
        expect(controller.candidates.value[0].description).toBe("Contract " + SAMPLE_CONTRACT.contract_id)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_CONTRACT)
        expect(controller.candidates.value[1].description).toBe("Account " + SAMPLE_CONTRACT.contract_id)
        expect(controller.candidates.value[1].extra).toBeNull()
        expect(controller.candidates.value[1].nonExistent).toBe(false)
        expect(controller.candidates.value[1].entity).toStrictEqual(SAMPLE_CONTRACT_AS_ACCOUNT)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })


    //
    // Token
    //

    it("search token with id", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_TOKEN.token_id
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TOKEN.token_id)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/0.0.29662956",
            "api/v1/contracts/0.0.29662956",
            "api/v1/tokens/0.0.29662956",
            "api/v1/topics/0.0.29662956",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TOKEN.token_id)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Token " + SAMPLE_TOKEN.token_id)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_TOKEN)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search token with evm address", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        const SAMPLE_TOKEN_EVM_ADDRESS = EntityID.parse(SAMPLE_TOKEN.token_id)!.toAddress()
        inputText.value = SAMPLE_TOKEN_EVM_ADDRESS
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TOKEN_EVM_ADDRESS)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/0000000000000000000000000000000001c49eec",
            "api/v1/contracts/0000000000000000000000000000000001c49eec",
            "api/v1/tokens/0.0.29662956",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TOKEN_EVM_ADDRESS)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Token " + SAMPLE_TOKEN.token_id)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_TOKEN)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search token with partial evm address", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        const PARTIAL_EVM_ADDRESS = "0x01c49eec"
        inputText.value = PARTIAL_EVM_ADDRESS
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(PARTIAL_EVM_ADDRESS)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/0000000000000000000000000000000001c49eec",
            "api/v1/contracts/0000000000000000000000000000000001c49eec",
            "api/v1/tokens/0.0.29662956",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(PARTIAL_EVM_ADDRESS)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Token " + SAMPLE_TOKEN.token_id)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })



    //
    // Topic
    //

    it("search topic with id", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_TOPIC.topic_id
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TOPIC.topic_id)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/0.0.31407",
            "api/v1/contracts/0.0.31407",
            "api/v1/tokens/0.0.31407",
            "api/v1/topics/0.0.31407",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TOPIC.topic_id)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Topic " + SAMPLE_TOPIC.topic_id)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_TOPIC)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    //
    // Transaction
    //

    it("search transaction with id", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_TRANSACTION.transaction_id
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TRANSACTION.transaction_id)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/transactions/" + SAMPLE_TRANSACTION.transaction_id,
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TRANSACTION.transaction_id)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Transaction 0.0.29624024@1646025139.152901498")
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_TRANSACTION)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search transaction with timestamp", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_TRANSACTION.consensus_timestamp
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TRANSACTION.consensus_timestamp)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/transactions?timestamp=" + SAMPLE_TRANSACTION.consensus_timestamp,
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_TRANSACTION.consensus_timestamp)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Transaction 0.0.29624024@1646025139.152901498")
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_TRANSACTION)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it.skip("search transaction with hedera hash", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = TRANSACTION_HASH
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(TRANSACTION_HASH)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/UAJJMERS5V6SQQUDN2K7P2OEGVX57YW6BAMZBELQDKLJYHI73E3HDUYHR3UDWKH3IYFIRNGL3DWNE",
            "api/v1/transactions/a012961232ed7d2842836e95f7e9c4356fdfe2de08199091701a969c1d1fd93671d3078ee83b28fb460a88b4cbd8ecd2",
            "api/v1/blocks/a012961232ed7d2842836e95f7e9c4356fdfe2de08199091701a969c1d1fd93671d3078ee83b28fb460a88b4cbd8ecd2",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(TRANSACTION_HASH)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Transaction 0.0.29624024-1646025139-152901498")
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_TRANSACTION)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search transaction with ethereum hash", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        const ETHEREUM_TRANSACTION_HASH = SAMPLE_CONTRACT_RESULT_DETAILS.hash
        expect(SAMPLE_CONTRACT_RESULT_DETAILS.timestamp).toBe(SAMPLE_TRANSACTION.consensus_timestamp)

        inputText.value = ETHEREUM_TRANSACTION_HASH
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(ETHEREUM_TRANSACTION_HASH)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/?account.publickey=c43db9eacf72c91629ac03088535dd9ae41059a2c1eefce3a528e04e7e908d2d&limit=10",
            "api/v1/contracts/results/c43db9eacf72c91629ac03088535dd9ae41059a2c1eefce3a528e04e7e908d2d",
            "api/v1/transactions?timestamp=1646025151.667604000",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(ETHEREUM_TRANSACTION_HASH)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Transaction 0.0.29624024@1646025139.152901498")
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_TRANSACTION)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    //
    // Block
    //

    it("search block with number", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_BLOCK.number.toString()
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_BLOCK.number.toString())
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/0.0.25175998",
            "api/v1/contracts/0.0.25175998",
            "api/v1/tokens/0.0.25175998",
            "api/v1/topics/0.0.25175998",
            "api/v1/blocks/25175998",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_BLOCK.number.toString())
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(2) // SAMPLE_PATCHED_ACCOUNT + SAMPLE_BLOCK
        expect(controller.candidates.value[0].description).toBe("Account " + SAMPLE_PATCHED_ACCOUNT.account)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_PATCHED_ACCOUNT)
        expect(controller.candidates.value[1].description).toBe("Block " + SAMPLE_BLOCK.number)
        expect(controller.candidates.value[1].extra).toBeNull()
        expect(controller.candidates.value[1].nonExistent).toBe(false)
        expect(controller.candidates.value[1].entity).toStrictEqual(SAMPLE_BLOCK)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })

    it("search block with hash", async () => {

        const inputText = ref<string>("")
        const controller = new SearchController(inputText)
        await flushPromises()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        inputText.value = SAMPLE_BLOCK.hash
        await nextTick()
        expect(vi.getTimerCount()).toBe(1)
        expect(controller.visible.value).toBe(false)
        expect(controller.actualInputText.value).toBe("")
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        vi.advanceTimersToNextTimer()
        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_BLOCK.hash)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(0)
        expect(controller.candidates.value).toStrictEqual([])
        expect(controller.defaultCandidate.value).toBeNull()

        await flushPromises()
        expect(fetchGetURLs(mock)).toStrictEqual([
            "api/v1/accounts/5FRQ27MMZBWQ4DJ54UYWTFN336PSUWCFETHRRWRDHK6476BN7F62BIHMHDDLIBDBAEUURFX7RCUGW",
            "api/v1/transactions/e9630d7d8cc86d0e0d3de5316995bbdf9f2a584524cf18da233abdcff82df97da0a0ec38c6b4046101294896ff88a86b",
            "api/v1/blocks/e9630d7d8cc86d0e0d3de5316995bbdf9f2a584524cf18da233abdcff82df97da0a0ec38c6b4046101294896ff88a86b",
        ])

        expect(vi.getTimerCount()).toBe(0)
        expect(controller.visible.value).toBe(true)
        expect(controller.actualInputText.value).toBe(SAMPLE_BLOCK.hash)
        expect(controller.loading.value).toBe(false)
        expect(controller.candidateCount.value).toBe(1)
        expect(controller.candidates.value[0].description).toBe("Block " + SAMPLE_BLOCK.number)
        expect(controller.candidates.value[0].extra).toBeNull()
        expect(controller.candidates.value[0].nonExistent).toBe(false)
        expect(controller.candidates.value[0].entity).toStrictEqual(SAMPLE_BLOCK)
        expect(controller.defaultCandidate.value).toStrictEqual(controller.candidates.value[0])

    })


})

