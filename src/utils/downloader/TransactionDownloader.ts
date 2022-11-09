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

import {Transaction, TransactionResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {CSVEncoder} from "@/utils/CSVEncoder";
import {DownloaderState, EntityDownloader} from "@/utils/downloader/EntityDownloader";
import {computed, ComputedRef} from "vue";

export class TransactionDownloader extends EntityDownloader<Transaction, TransactionResponse> {

    public readonly accountId: string
    public readonly startDate: Date
    public readonly endDate: Date|null
    public readonly dateFormat = TransactionDownloader.makeDateFormat()
    public readonly now = new Date()

    //
    // Public
    //

    public constructor(accountId: string, startDate: Date, endDate: Date|null, maxTransactionCount: number) {
        super(maxTransactionCount)
        this.accountId = accountId
        this.startDate = startDate
        this.endDate = endDate
    }

    public progress: ComputedRef<number> = computed(() => {
        let result: number

        if (this.state.value == DownloaderState.Completed) {
            result = 1.0
        } else {
            const startTime = this.startDate.getTime()
            const endTime = this.endDate != null ? this.endDate.getTime() : this.now.getTime()

            const firstEntity = this.firstDownloadedEntity.value
            const firstTimestamp = firstEntity?.consensus_timestamp ?? null
            const firstTime = firstTimestamp !== null ? timestampToMillis(firstTimestamp) : endTime
            const lastEntity = this.lastDownloadedEntity.value
            const lastTimestamp = lastEntity?.consensus_timestamp ?? null
            const lastTime = lastTimestamp !== null ? timestampToMillis(lastTimestamp) : endTime

            /*

                           |        remaining      |        already         | nothing |
                           |       to download     |       downloaded       |   here  |
                   --------+-----------------------+------------------------+---------+--------> now
                        startTime               lastTime                firstTime   endTime
             */

            const progress = firstTime !== null && lastTime !== null
                                ? (firstTime - lastTime) / (firstTime - startTime) : 0
            result = Math.round(progress * 1000) / 1000
        }

        return result
    })

    public getOutputName(): string {
        return "Hedera Transactions " + this.accountId
            + " " + this.dateFormat.format(this.startDate)
            + " to " + this.dateFormat.format(this.endDate ?? this.now)
            + ".csv"
    }

    //
    // EntityDownloader
    //

    protected async loadNext(nextURL: string|null): Promise<AxiosResponse<TransactionResponse>> {

        if (nextURL == null) {
            const startTimestamp = dateToTimestamp(this.startDate)
            const endTimestamp = this.endDate !== null ? dateToTimestamp(this.endDate) : null

            nextURL = "api/v1/transactions"
                + "?account.id=" + this.accountId
                + "&timestamp=gte:" + startTimestamp
            if (endTimestamp !== null) {
                nextURL += "&timestamp=lt:" + endTimestamp
            }
            nextURL += "&limit=100"
        }

        return axios.get<TransactionResponse>(nextURL)
    }

    protected fetchEntities(response: TransactionResponse): Transaction[] {
        return response.transactions ?? []
    }

    protected nextURL(response: TransactionResponse): string | null {
        return response.links?.next ?? null
    }

    protected makeCSVEncoder(): CSVEncoder<Transaction> {
        return new TransactionEncoder(this.getEntities(), this.dateFormat)
    }

    //
    // Private
    //

    private static makeDateFormat(): Intl.DateTimeFormat {
        const locale = "en-US"
        const dateOptions: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }
        return new Intl.DateTimeFormat(locale, dateOptions)
    }
}

function dateToTimestamp(date: Date): string {
    const seconds = date.getTime() / 1000.0
    return seconds.toFixed(9)
}

function timestampToMillis(value: string): number|null {
    const seconds = Number.parseFloat(value);
    return isNaN(seconds) ? null : seconds * 1000
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
        for (const transfer of t.transfers ?? []) {
            const amount = transfer.amount ? this.formatAmount(transfer.amount) : ""
            const accountId = transfer.account ?? ""
            result.push([timestamp, transactionID, type, amount, accountId])
        }
        return result
    }


    //
    // Protected
    //

    protected formatTimestamp(t: string): string {
        const seconds = Number.parseFloat(t);
        return isNaN(seconds) ? t : this.dateFormat.format(seconds * 1000)
    }

    protected formatAmount(tbarValue: number): string {
        return this.amountFormatter.format(tbarValue / 100000000)
    }

    //
    // Private
    //

    private readonly amountFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8
    })
}
