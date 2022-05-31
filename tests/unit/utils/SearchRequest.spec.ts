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

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
    SAMPLE_ACCOUNT,
    SAMPLE_CONTRACT,
    SAMPLE_TOKEN,
    SAMPLE_TOPIC_MESSAGES,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import {SearchRequest} from "@/utils/SearchRequest";
import {base32ToAlias, byteToHex} from "@/utils/B64Utils";

const mock = new MockAdapter(axios)

const matcher_account = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account
mock.onGet(matcher_account).reply(200, SAMPLE_ACCOUNT)

const matcher_account_with_alias = "/api/v1/accounts/" + SAMPLE_ACCOUNT.alias
mock.onGet(matcher_account_with_alias).reply(200, SAMPLE_ACCOUNT)

const matcher_transaction = "/api/v1/transactions/" + SAMPLE_TRANSACTION.transaction_id
mock.onGet(matcher_transaction).reply(200, SAMPLE_TRANSACTIONS)

const matcher_token = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
mock.onGet(matcher_token).reply(200, SAMPLE_TOKEN)

const SAMPLE_TOPIC_ID = SAMPLE_TOPIC_MESSAGES.messages[0].topic_id
const matcher_topic = "/api/v1/topics/" + SAMPLE_TOPIC_ID + "/messages"
mock.onGet(matcher_topic).reply(200, SAMPLE_TOPIC_MESSAGES)

const matcher_contracts = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
mock.onGet(matcher_contracts).reply(200, SAMPLE_CONTRACT)

const matcher_contracts_with_evm_address = "/api/v1/contracts/" + SAMPLE_CONTRACT.evm_address.slice(2)
mock.onGet(matcher_contracts_with_evm_address).reply(200, SAMPLE_CONTRACT)


describe("SearchRequest.ts", () => {

    test("account", async () => {
        const r = new SearchRequest(SAMPLE_ACCOUNT.account ?? "")
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_ACCOUNT.account)
        expect(r.account).toStrictEqual(SAMPLE_ACCOUNT)
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()

    })

    test("account (with alias)", async () => {
        const aliasHex = byteToHex(new Uint8Array(base32ToAlias(SAMPLE_ACCOUNT.alias)))
        const r = new SearchRequest(aliasHex)
        await r.run()

        expect(r.searchedId).toBe(aliasHex)
        expect(r.account).toStrictEqual(SAMPLE_ACCOUNT)
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()

        const aliasHex2 = "0x" + aliasHex
        const r2 = new SearchRequest(aliasHex2)
        await r2.run()

        expect(r2.searchedId).toBe(aliasHex2)
        expect(r2.account).toStrictEqual(SAMPLE_ACCOUNT)
        expect(r2.transactions).toStrictEqual([])
        expect(r2.tokenInfo).toBeNull()
        expect(r2.topicMessages).toStrictEqual([])
        expect(r2.contract).toBeNull()

    })

    test("transaction", async () => {
        const r = new SearchRequest(SAMPLE_TRANSACTION.transaction_id ?? "")
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_TRANSACTION.transaction_id)
        expect(r.account).toBeNull()
        expect(r.transactions).toStrictEqual([SAMPLE_TRANSACTION])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()

    })

    test("token", async () => {
        const r = new SearchRequest(SAMPLE_TOKEN.token_id)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_TOKEN.token_id)
        expect(r.account).toBeNull()
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toStrictEqual(SAMPLE_TOKEN)
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()

    })

    test("topic", async () => {
        const r = new SearchRequest(SAMPLE_TOPIC_ID)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_TOPIC_ID)
        expect(r.account).toBeNull()
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual(SAMPLE_TOPIC_MESSAGES.messages)
        expect(r.contract).toBeNull()

    })

    test("contract", async () => {
        const r = new SearchRequest(SAMPLE_CONTRACT.contract_id)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_CONTRACT.contract_id)
        expect(r.account).toBeNull()
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toStrictEqual(SAMPLE_CONTRACT)

    })

    test("contract (with evm address)", async () => {
        const r = new SearchRequest(SAMPLE_CONTRACT.evm_address)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_CONTRACT.evm_address)
        expect(r.account).toBeNull()
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toStrictEqual(SAMPLE_CONTRACT)

    })

    test("unknown id", async () => {
        const UNKNOWN_ID = "1.2.3"
        const r = new SearchRequest(UNKNOWN_ID)
        await r.run()

        expect(r.searchedId).toBe(UNKNOWN_ID)
        expect(r.account).toBeNull()
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()

    })

    test("invalid id", async () => {
        const INVAlID_ID = "a.b.c"
        const r = new SearchRequest(INVAlID_ID)
        await r.run()

        expect(r.searchedId).toBe(INVAlID_ID)
        expect(r.account).toBeNull()
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()

    })

})

