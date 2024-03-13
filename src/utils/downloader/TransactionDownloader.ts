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

import {compareTransferByAccount, Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {CSVEncoder} from "@/utils/CSVEncoder";
import {dateToTimestamp} from "@/utils/downloader/EntityDownloader";
import {AbstractTransactionDownloader} from "@/utils/downloader/AbstractTransationDownloader";
import {Ref, watch} from "vue";

export class TransactionDownloader extends AbstractTransactionDownloader {

    public readonly accountId: Ref<string|null>
    public readonly transactionTypes: Ref<Set<string>>

    protected readonly wrongSetupError = new Error("this.accountId or this.startDate not set")

    //
    // Public
    //

    public constructor(accountId: Ref<string|null>,
                       startDate: Ref<Date|null>,
                       endDate: Ref<Date|null>,
                       transactionTypes: Ref<Set<string>>,
                       maxTransactionCount: number) {
        super(startDate, endDate, maxTransactionCount)
        this.accountId = accountId
        this.transactionTypes = transactionTypes
        watch(this.accountId, () => {
            this.abort().then()
        })
    }

    //
    // AbstractTransactionDownloader
    //

    protected async loadNext(nextURL: string|null): Promise<AxiosResponse<TransactionResponse>> {

        if (nextURL == null) {
            if (this.accountId.value !== null && this.startDate.value !== null){
                const startTimestamp = dateToTimestamp(this.startDate.value)
                const endTimestamp = this.endDate.value !== null ? dateToTimestamp(this.endDate.value) : null

                nextURL = "api/v1/transactions"
                    + "?account.id=" + this.accountId.value
                    + "&timestamp=gte:" + startTimestamp
                for (const t of this.transactionTypes.value) {
                    nextURL += "&transactiontype=" + t
                }
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

    protected makeCSVEncoder(dateFormat: Intl.DateTimeFormat): CSVEncoder<Transaction> {
        return new TransactionEncoder(this.entities.value, dateFormat)
    }

    protected makeOutputPrefix(): string {
        return this.accountId.value !== null ? "Hedera Transactions " + this.accountId.value : ""
    }
}

export class TransactionEncoder extends CSVEncoder<Transaction> {

    //
    // CSVEncoder
    //

    protected encodeEntity(t: Transaction): string[][] {
        const result: string[][] = []
        const timestamp = t.consensus_timestamp ? this.formatTimestamp(t.consensus_timestamp) : ""
        const transactionID = t.transaction_id ?? ""
        const type = t.name ?? ""
        const sortedTransfers = t.transfers?.slice() ?? []
        sortedTransfers.sort(compareTransferByAccount)
        for (const transfer of sortedTransfers) {
            const amount = transfer.amount ? this.formatAmount(transfer.amount) : ""
            const accountId = transfer.account ?? ""
            const fromAccountId = transfer.amount < 0 ? accountId : ""
            const toAccountId = transfer.amount >= 0 ? accountId : ""
            result.push([timestamp, fromAccountId, toAccountId, amount, transactionID, type])
        }
        return result
    }

    protected encodeHeaderRow(): string[] | null {
        return ["#date","#from_account_id","#to_account_id","#amount","#transaction_id","#transaction_type"]
    }
}
