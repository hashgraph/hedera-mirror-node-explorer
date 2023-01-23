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

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
    SAMPLE_ACCOUNT,
    SAMPLE_ACCOUNTS,
    SAMPLE_CONTRACT,
    SAMPLE_TOKEN,
    SAMPLE_TOPIC_MESSAGES,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import {SearchRequest} from "@/utils/SearchRequest";
import {base32ToAlias, base64DecToArr, byteToHex} from "@/utils/B64Utils";
import {EntityID} from "@/utils/EntityID";

const mock = new MockAdapter(axios)

// Account

const matcher_account = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account
mock.onGet(matcher_account).reply(200, SAMPLE_ACCOUNT)

const matcher_account_with_alias = "/api/v1/accounts/" + SAMPLE_ACCOUNT.alias
mock.onGet(matcher_account_with_alias).reply(200, SAMPLE_ACCOUNT)

const SAMPLE_ACCOUNT_ADDRESS = EntityID.parse(SAMPLE_ACCOUNT.account)!.toAddress()
const matcher_account_with_address = "/api/v1/accounts/" + SAMPLE_ACCOUNT_ADDRESS
mock.onGet(matcher_account_with_address).reply(200, SAMPLE_ACCOUNT)

const matcher_account_with_public_key = "/api/v1/accounts/?account.publickey="
    + SAMPLE_ACCOUNTS.accounts[0].key.key + "&limit=2"
mock.onGet(matcher_account_with_public_key).reply(200, SAMPLE_ACCOUNTS)


// Transaction

const matcher_transaction = "/api/v1/transactions/" + SAMPLE_TRANSACTION.transaction_id
mock.onGet(matcher_transaction).reply(200, SAMPLE_TRANSACTIONS)

const TRANSACTION_HASH = byteToHex(base64DecToArr(SAMPLE_TRANSACTION.transaction_hash))
const matcher_transaction_with_hash = "/api/v1/transactions/" + TRANSACTION_HASH
mock.onGet(matcher_transaction_with_hash).reply(200, SAMPLE_TRANSACTIONS)

// Token

const matcher_token = "/api/v1/tokens/" + SAMPLE_TOKEN.token_id
mock.onGet(matcher_token).reply(200, SAMPLE_TOKEN)
const SAMPLE_TOKEN_ADDRESS = EntityID.parse(SAMPLE_TOKEN.token_id)!.toAddress()

const SAMPLE_TOPIC_ID = SAMPLE_TOPIC_MESSAGES.messages[0].topic_id
const matcher_topic = "/api/v1/topics/" + SAMPLE_TOPIC_ID + "/messages"
mock.onGet(matcher_topic).reply(200, SAMPLE_TOPIC_MESSAGES)

const matcher_contracts = "/api/v1/contracts/" + SAMPLE_CONTRACT.contract_id
mock.onGet(matcher_contracts).reply(200, SAMPLE_CONTRACT)

const matcher_contracts_with_evm_address = "/api/v1/contracts/" + SAMPLE_CONTRACT.evm_address.slice(2)
mock.onGet(matcher_contracts_with_evm_address).reply(200, SAMPLE_CONTRACT)

const INVALID_EVM_ADDRESS = "0102030405060708090102030405060708"; // 19 bytes : should be 20
const matcher_contracts_with_invalid_evm_address = "/api/v1/contracts/" + INVALID_EVM_ADDRESS
mock.onGet(matcher_contracts_with_invalid_evm_address).reply(400)


describe("SearchRequest.ts", () => {

    //
    // Account
    //

    test("account", async () => {
        const r = new SearchRequest(SAMPLE_ACCOUNT.account ?? "")
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_ACCOUNT.account)
        expect(r.account).toStrictEqual(SAMPLE_ACCOUNT)
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    test("account (with eth address)", async () => {
        const r = new SearchRequest(SAMPLE_ACCOUNT_ADDRESS)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_ACCOUNT_ADDRESS)
        expect(r.account).toStrictEqual(SAMPLE_ACCOUNT)
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    test("account (with public key)", async () => {
        const r = new SearchRequest(SAMPLE_ACCOUNT.key.key)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_ACCOUNT.key.key)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([SAMPLE_ACCOUNT])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    test("account (with alias)", async () => {
        const r = new SearchRequest(SAMPLE_ACCOUNT.alias)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_ACCOUNT.alias)
        expect(r.account).toStrictEqual(SAMPLE_ACCOUNT)
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    test("account (with alias expressed in hex)", async () => {
        const SAMPLE_ALIAS_HEX = byteToHex(base32ToAlias(SAMPLE_ACCOUNT.alias)!)
        const r = new SearchRequest(SAMPLE_ALIAS_HEX)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_ALIAS_HEX)
        expect(r.account).toStrictEqual(SAMPLE_ACCOUNT)
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    //
    // Transaction
    //

    test("transaction", async () => {
        const r = new SearchRequest(SAMPLE_TRANSACTION.transaction_id ?? "")
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_TRANSACTION.transaction_id)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([SAMPLE_TRANSACTION])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    test("transaction (with hash)", async () => {
        const r = new SearchRequest(TRANSACTION_HASH)
        await r.run()

        expect(r.searchedId).toBe(TRANSACTION_HASH)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([SAMPLE_TRANSACTION])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    //
    // Token
    //

    test("token", async () => {
        const r = new SearchRequest(SAMPLE_TOKEN.token_id)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_TOKEN.token_id)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toStrictEqual(SAMPLE_TOKEN)
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    test("token (with ethereum address)", async () => {
        const r = new SearchRequest(SAMPLE_TOKEN_ADDRESS)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_TOKEN_ADDRESS)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toStrictEqual(SAMPLE_TOKEN)
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    //
    // Topic
    //

    test("topic", async () => {
        const r = new SearchRequest(SAMPLE_TOPIC_ID)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_TOPIC_ID)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual(SAMPLE_TOPIC_MESSAGES.messages)
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    //
    // Contract
    //

    test("contract", async () => {
        const r = new SearchRequest(SAMPLE_CONTRACT.contract_id)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_CONTRACT.contract_id)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toStrictEqual(SAMPLE_CONTRACT)
        expect(r.getErrorCount()).toBe(0)

    })

    test("contract (with evm address)", async () => {
        const r = new SearchRequest(SAMPLE_CONTRACT.evm_address)
        await r.run()

        expect(r.searchedId).toBe(SAMPLE_CONTRACT.evm_address)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toStrictEqual(SAMPLE_CONTRACT)
        expect(r.getErrorCount()).toBe(0)

    })

    test("unknown id", async () => {
        const UNKNOWN_ID = "1.2.3"
        const r = new SearchRequest(UNKNOWN_ID)
        await r.run()

        expect(r.searchedId).toBe(UNKNOWN_ID)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    test("unknown account alias and invalid evm address", async () => {
        const r = new SearchRequest(INVALID_EVM_ADDRESS)
        await r.run()

        expect(r.searchedId).toBe(INVALID_EVM_ADDRESS)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

        const aliasHex2 = "0x" + INVALID_EVM_ADDRESS
        const r2 = new SearchRequest(aliasHex2)
        await r2.run()

        expect(r2.searchedId).toBe(aliasHex2)
        expect(r2.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r2.transactions).toStrictEqual([])
        expect(r2.tokenInfo).toBeNull()
        expect(r2.topicMessages).toStrictEqual([])
        expect(r2.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

    test("invalid id", async () => {
        const INVAlID_ID = "a.b.c"
        const r = new SearchRequest(INVAlID_ID)
        await r.run()

        expect(r.searchedId).toBe(INVAlID_ID)
        expect(r.account).toBeNull()
        expect(r.accountsWithKey).toStrictEqual([])
        expect(r.transactions).toStrictEqual([])
        expect(r.tokenInfo).toBeNull()
        expect(r.topicMessages).toStrictEqual([])
        expect(r.contract).toBeNull()
        expect(r.getErrorCount()).toBe(0)

    })

})

