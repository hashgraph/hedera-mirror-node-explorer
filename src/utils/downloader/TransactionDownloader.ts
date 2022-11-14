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
import {dateToTimestamp, EntityDownloader} from "@/utils/downloader/EntityDownloader";
import {Ref, watch} from "vue";

export class TransactionDownloader extends EntityDownloader<Transaction, TransactionResponse> {

    public readonly accountId: Ref<string|null>

    protected readonly wrongSetupError = new Error("this.accountId or this.startDate not set")

    //
    // Public
    //

    public constructor(accountId: Ref<string|null>,
                       startDate: Ref<Date|null>,
                       endDate: Ref<Date|null>,
                       maxTransactionCount: number) {
        super(startDate, endDate, maxTransactionCount)
        this.accountId = accountId
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

    protected fetchEntities(response: TransactionResponse): Transaction[] {
        return response.transactions ?? []
    }

    protected nextURL(response: TransactionResponse): string | null {
        return response.links?.next ?? null
    }

    protected entityTimestamp(entity: Transaction): string | null {
        return entity.consensus_timestamp ?? null
    }

    protected makeCSVEncoder(dateFormat: Intl.DateTimeFormat): CSVEncoder<Transaction> {
        return new TransactionEncoder(this.getEntities(), dateFormat)
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
            result.push([timestamp, transactionID, type, amount, fromAccountId, toAccountId])
        }
        return result
    }

    protected encodeHeaderRow(): string[] | null {
        return ["#date","#transaction_id","#transaction_type","#amount","#from_account_id","#to_account_id"]
    }
}
