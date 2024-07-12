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
    SearchAgent,
    SearchCandidate,
    TokenSearchAgent,
    TransactionSearchAgent
} from "@/components/search/SearchAgent";

export class SearchController {

    private readonly inputChangeController: InputChangeController
    private readonly accountSearchAgent = new AccountSearchAgent()
    private readonly contractSearchAgent = new ContractSearchAgent()
    private readonly tokenSearchAgent = new TokenSearchAgent()
    private readonly transactionSearchAgent = new TransactionSearchAgent()
    private readonly domainNameSearchAgent = new DomainNameSearchAgent()
    private readonly blockSearchAgent = new BlockSearchAgent()
    private readonly allAgents: SearchAgent<unknown, unknown>[] = [
        this.contractSearchAgent,
        this.accountSearchAgent,
        this.tokenSearchAgent,
        this.transactionSearchAgent,
        this.domainNameSearchAgent,
        this.blockSearchAgent
    ]

    //
    // Public
    //

    public constructor(public readonly inputText: Ref<string>) {
        this.inputChangeController = new InputChangeController(inputText)
        watch(this.actualInputText, this.actualInputTextDidChange)
    }

    public readonly visible = computed(
        () => this.actualInputText.value !== "")

    public readonly actualInputText = computed(
        () => this.inputChangeController.outputText.value)

    public readonly loading = computed(() => {
        let result = false
        for (const a of this.allAgents) {
            result ||= a.loading.value
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

    public readonly candidates = computed(() => {
        let result: SearchCandidate<unknown>[] = []
        for (const a of this.allAgents) {
            result = result.concat(a.candidates.value)
        }
        return result
    })

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

        this.accountSearchAgent.loc.value = entityID ?? hexBytes ?? alias
        this.contractSearchAgent.loc.value = entityID ?? hexBytes
        this.tokenSearchAgent.loc.value = entityID ?? hexBytes
        this.transactionSearchAgent.loc.value = transactionID ?? timestamp
        this.domainNameSearchAgent.loc.value = domainName
        this.blockSearchAgent.loc.value = blockNb ?? hexBytes
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

