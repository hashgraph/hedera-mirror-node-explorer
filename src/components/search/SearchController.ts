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

import {computed, ref, Ref, watch} from "vue";
import {EntityID} from "@/utils/EntityID";
import {TransactionID} from "@/utils/TransactionID";
import {base32ToAlias, hexToByte} from "@/utils/B64Utils";
import {Timestamp} from "@/utils/Timestamp";
import {
    AccountSearchAgent,
    BlockSearchAgent,
    ContractSearchAgent,
    DomainNameSearchAgent,
    FullTokenNameSearchAgent,
    NarrowTokenNameSearchAgent,
    SearchAgent,
    TokenSearchAgent,
    TopicSearchAgent,
    TransactionSearchAgent
} from "@/components/search/SearchAgent";
import {nameServiceProviders} from "@/utils/name_service/provider/AllProviders";

export class SearchController {

    /*

    inputText syntax                      | Description      | Tentative searches
    =====================================+==================+======================================================
    shard.realm.num[-checksum]           | Entity ID        | api/v1/accounts/{shard.realm.num}
                                         |                  | api/v1/contracts/{shard.realm.num}
                                         |                  | api/v1/tokens/{shard.realm.num}
                                         |                  | api/v1/topics/{shard.realm.num}
                                         |                  | api/v1/topics/{shard.realm.num}/messages
    -------------------------------------+------------------+------------------------------------------------------
    integer[-checksum]                   | Incomplete       | api/v1/accounts/0.0.{integer}
                                         | Entity ID        | api/v1/contracts/0.0.{integer}
                                         |                  | api/v1/tokens/0.0.{integer}
                                         |                  | api/v1/topics/0.0.{integer}
                                         |                  | api/v1/topics/0.0.{integer}/messages
    -------------------------------------+------------------+------------------------------------------------------
    shard.realm.num@seconds.nanoseconds  | Transaction ID   | api/v1/transactions/normalize({inputText})
    -------------------------------------+------------------+------------------------------------------------------
    shard.realm.num@seconds              | Incomplete       | api/v1/transactions/normalize({inputText}.000000000)
                                         | Transaction ID   |
    -------------------------------------+------------------+------------------------------------------------------
    shard.realm.num-seconds-nanoseconds  | Transaction ID   | api/v1/transactions/{inputText}
                                         | (normalized)     |
    -------------------------------------+------------------+------------------------------------------------------
    hexadecimal 48 bytes                 | Hedera Hash      | api/v1/transactions/{inputText}
                                         |                  | api/v1/blocks/{inputText}
    -------------------------------------+------------------+------------------------------------------------------
    hexadecimal 32 bytes                 | EVM Hash         | api/v1/contracts/results/{inputText}
                                         |                  |  + api/v1/transactions/{result.timestamp}
    -------------------------------------+------------------+------------------------------------------------------
    hexadecimal 20 bytes                 | Ethereum Address | api/v1/accounts/{inputText}
                                         |                  | api/v1/contracts/{inputText}
                                         |                  | api/v1/token/ethereumToEntityID({inputText})
    -------------------------------------+------------------+------------------------------------------------------
    hexadecimal < 20 bytes               | Incomplete       | api/v1/accounts/padded({inputText})
                                         | Ethereum Address | api/v1/contracts/padded({inputText})
                                         |                  | api/v1/token/ethereumToEntityID(padded({inputText}))
    -------------------------------------+------------------+------------------------------------------------------
    hexadecimal 32/33 bytes              | Public Key       | api/v1/accounts/?account.publickey={inputText}
    -------------------------------------+------------------+------------------------------------------------------
    hexadecimal n bytes                  | Account Alias    | api/v1/accounts/base32({inputText})
                                         | in hex form      |
    -------------------------------------+------------------+------------------------------------------------------
    base32                               | Account Alias    | api/v1/accounts/{inputText}
    -------------------------------------+------------------+------------------------------------------------------
    /\.[a-z|ℏ]+$/                        | Kabuto domain    | Kabuto API
                                         | HNS domain       | HNS API
    -------------------------------------+------------------+------------------------------------------------------

     */

    private readonly inputChangeController: InputChangeController
    private readonly accountSearchAgent = new AccountSearchAgent()
    private readonly contractSearchAgent = new ContractSearchAgent()
    private readonly tokenSearchAgent = new TokenSearchAgent()
    private readonly topicSearchAgent = new TopicSearchAgent()
    private readonly transactionSearchAgent = new TransactionSearchAgent()
    private readonly blockSearchAgent = new BlockSearchAgent()
    private readonly narrowTokenNameSearchAgent = new NarrowTokenNameSearchAgent()
    public readonly fullTokenNameSearchAgent = new FullTokenNameSearchAgent()

    private readonly allAgents: SearchAgent<unknown, unknown>[] = []
    public readonly domainNameSearchAgents: DomainNameSearchAgent[] = []

    //
    // Public
    //

    public constructor(public readonly inputText: Ref<string>) {
        this.inputChangeController = new InputChangeController(inputText)
        this.allAgents.push(
            this.narrowTokenNameSearchAgent,
            this.fullTokenNameSearchAgent,
            this.contractSearchAgent,
            this.accountSearchAgent,
            this.tokenSearchAgent,
            this.topicSearchAgent,
            this.transactionSearchAgent,
            this.blockSearchAgent,
        )
        for (const p of nameServiceProviders) {
            const a = new DomainNameSearchAgent(p)
            this.domainNameSearchAgents.push(a)
            this.allAgents.push(a)
        }
        watch(this.actualInputText, this.actualInputTextDidChange)
    }

    public readonly visible = computed(
        () => this.actualInputText.value !== "")

    public readonly actualInputText = computed(
        () => this.inputChangeController.outputText.value)

    public readonly loading = computed(() => {
        let result = false
        for (const a of this.allAgents) {
            if (a.loading.value) {
                result = true
                break
            }
        }
        return result
    })

    public readonly visibleAgents = computed(() => {
        const result: SearchAgent<unknown, unknown>[] = []
        for (const a of this.allAgents) {
            if (a.candidates.value.length >= 1) {
                result.push(a)
            }
        }
        return result
    })

    public readonly loadingDomainNameSearchAgents = computed(() => {
        const result: DomainNameSearchAgent[] = []
        for (const a of this.domainNameSearchAgents) {
            if (a.loading.value) {
                result.push(a)
            }
        }
        return result
    })

    public readonly candidateCount = computed(() => {
        let result = 0
        for (const a of this.allAgents) {
            result += a.candidates.value.length
        }
        return result
    })

    public findAgentById(id: string): SearchAgent<unknown, unknown>|null {
        let result: SearchAgent<unknown, unknown>|null = null
        for (const a of this.allAgents) {
            if (id == a.id) {
                result = a
                break
            }
        }
        return result
    }

    //
    // Private
    //

    private actualInputTextDidChange = (): void => {

        const searchedText = this.actualInputText.value
        const entityID = EntityID.parseWithChecksum(searchedText, true)
        const transactionID = TransactionID.parse(searchedText, true)
        const hexBytes = hexToByte(searchedText)
        const alias = base32ToAlias(searchedText) != null ? searchedText : null
        const timestamp = Timestamp.parse(searchedText)
        const domainName = /\.[a-zA-Z|ℏ]+$/.test(searchedText) ? searchedText : null
        const blockNb = EntityID.parsePositiveInt(searchedText)

        // const isTokenName = searchedText.length >= 3 && isASCII(searchedText)
        const isTokenName = searchedText.length >= 3
            && isASCII(searchedText)
            && entityID === null
            && transactionID === null
            && hexBytes === null
            && timestamp === null
        const tokenName = isTokenName ? searchedText : null

        this.accountSearchAgent.loc.value = entityID ?? hexBytes ?? alias
        this.contractSearchAgent.loc.value = entityID ?? hexBytes
        this.tokenSearchAgent.loc.value = entityID ?? hexBytes
        this.topicSearchAgent.loc.value = entityID
        this.transactionSearchAgent.loc.value = transactionID ?? timestamp ?? hexBytes
        this.blockSearchAgent.loc.value = blockNb ?? hexBytes
        this.narrowTokenNameSearchAgent.loc.value = tokenName
        this.fullTokenNameSearchAgent.loc.value = tokenName

        for (const a of this.domainNameSearchAgents) {
            a.loc.value = domainName
        }
    }
}

class InputChangeController {

    public readonly outputText = ref<string>("")
    private timeoutID = -1

    //
    // Public
    //

    public constructor(private readonly inputText: Ref<string>, private readonly millis: number = 500) {
        watch(this.inputText, this.inputTextDidChange, { immediate: true})
    }

    //
    // Private
    //

    private readonly inputTextDidChange = () => {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        if (this.inputText.value == "") {
            this.outputText.value = this.inputText.value
        } else {
            this.timeoutID = window.setTimeout(() => {
                this.outputText.value = this.inputText.value
                this.timeoutID = -1
            }, this.millis)
        }
    }
}

function isASCII(s: string): boolean {
    let result = true
    for (let i = 0; i < s.length; i += 1) {
        if (s.charCodeAt(i) > 255) { // 255 … or 127 ?
            result = false
            break
        }
    }
    return result
}
