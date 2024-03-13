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

import {compareTransferByAccount, Transaction, TransactionResponse, TransactionType} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {CSVEncoder} from "@/utils/CSVEncoder";
import {dateToTimestamp} from "@/utils/downloader/EntityDownloader";
import {Ref, watch} from "vue";
import {lookupTokenTransfer} from "@/schemas/HederaUtils";
import {AbstractTransactionDownloader} from "@/utils/downloader/AbstractTransationDownloader";

export class TokenTransferDownloader extends AbstractTransactionDownloader {

    public readonly accountId: Ref<string|null>
    public readonly tokenId: Ref<string|null>

    protected readonly wrongSetupError = new Error("this.accountId or this.startDate not set")

    //
    // Public
    //

    public constructor(accountId: Ref<string|null>,
                       startDate: Ref<Date|null>,
                       endDate: Ref<Date|null>,
                       tokenId: Ref<string|null>,
                       maxTransactionCount: number) {
        super(startDate, endDate, maxTransactionCount)
        this.accountId = accountId
        this.tokenId = tokenId
        watch(this.accountId, () => {
            this.abort().then()
        })
    }

    //
    // EntityDownloader
    //

    protected async loadNext(nextURL: string|null): Promise<AxiosResponse<TransactionResponse>> {

        if (nextURL == null) {
            if (this.accountId.value !== null && this.startDate.value !== null){
                const startTimestamp = dateToTimestamp(this.startDate.value)
                const endTimestamp = this.endDate.value !== null ? dateToTimestamp(this.endDate.value) : null

                nextURL = "api/v1/transactions"
                    + "?account.id=" + this.accountId.value
                    + "&transactiontype=" + TransactionType.CRYPTOTRANSFER
                    + "&timestamp=gte:" + startTimestamp
                if (endTimestamp !== null) {
                    nextURL += "&timestamp=lt:" + endTimestamp
                }
                nextURL += "&limit=100"
            } else {
                throw this.wrongSetupError
            }
        }

        return axios.get<TransactionResponse>(nextURL)
    }

    protected filter(transactions: Transaction[]): Transaction[] {
        const result: Transaction[] = []

        const tokenId = this.tokenId.value
        for (const t of transactions ?? []) {
            const match = tokenId !== null ? lookupTokenTransfer(t, tokenId) !== null : t.token_transfers.length >= 1
            if (match) {
                result.push(t)
            }
        }

        return result
    }

    protected makeCSVEncoder(dateFormat: Intl.DateTimeFormat): CSVEncoder<Transaction> {
        return new TokenTransferEncoder(this.tokenId, this.getEntities(), dateFormat)
    }

    protected makeOutputPrefix(): string {
        return this.accountId.value !== null ? "Hedera Token Transfers " + this.accountId.value : ""
    }
}

export class TokenTransferEncoder extends CSVEncoder<Transaction> {

    public readonly tokenId: Ref<string|null>

    //
    // Public
    //

    public constructor(tokenId: Ref<string|null>, entities: Transaction[], dateFormat: Intl.DateTimeFormat) {
        super(entities, dateFormat)
        this.tokenId = tokenId
    }

    //
    // CSVEncoder
    //

    protected encodeEntity(t: Transaction): string[][] {
        const result: string[][] = []
        const timestamp = t.consensus_timestamp ? this.formatTimestamp(t.consensus_timestamp) : ""
        const transactionID = t.transaction_id ?? ""
        const type = t.name ?? ""
        const sortedTransfers = t.token_transfers?.slice() ?? []
        sortedTransfers.sort(compareTransferByAccount)
        const targetTokenId = this.tokenId.value
        for (const transfer of sortedTransfers) {
            const tokenId = transfer.token_id
            if (targetTokenId == null || targetTokenId == tokenId) {
                const amount = transfer.amount ? this.formatAmount(transfer.amount) : ""
                const accountId = transfer.account ?? ""
                const fromAccountId = transfer.amount < 0 ? accountId : ""
                const toAccountId = transfer.amount >= 0 ? accountId : ""
                result.push([timestamp, tokenId ?? "null", fromAccountId, toAccountId, amount, transactionID, type])
            }
        }
        return result
    }

    protected encodeHeaderRow(): string[] | null {
        return ["#date","#token_id","#from_account_id","#to_account_id","#amount","#transaction_id","#transaction_type"]
    }
}
