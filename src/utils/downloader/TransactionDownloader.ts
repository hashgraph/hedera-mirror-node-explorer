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
import {EntityDownloader} from "@/utils/downloader/EntityDownloader";

export class TransactionDownloader extends EntityDownloader<Transaction, TransactionResponse> {

    private readonly accountId: string
    private readonly monthCount: number
    private readonly now: Date

    //
    // Public
    //

    public constructor(accountId: string, monthCount: number, maxTransactionCount: number, now: Date) {
        super(maxTransactionCount)
        this.accountId = accountId
        this.monthCount = monthCount
        this.now = now
    }


    public getCSV(): string {
        const encoder = new TransactionEncoder(this.getEntities())
        return encoder.encode()
    }

    //
    // EntityDownloader
    //

    protected async loadNext(nextURL: string|null): Promise<AxiosResponse<TransactionResponse>> {
        const startDate = this.computeStartDate()
        const startTimestamp = dateToTimestamp(startDate)

        if (nextURL == null) {
            nextURL = "api/v1/transactions"
                + "?account.id=" + this.accountId
                + "&timestamp=gte:" + startTimestamp
                + "&limit=100"
        }

        return axios.get<TransactionResponse>(nextURL)
    }

    protected entitiesFromResponse(response: TransactionResponse): Transaction[] {
        return response.transactions ?? []
    }

    protected nextURL(response: TransactionResponse): string | null {
        return response.links?.next ?? null
    }

    //
    // Private
    //

    private computeStartDate(): Date {
        const currentMonthIndex = this.now.getFullYear() * 12 + this.now.getMonth() - 1
        const startMonthIndex = currentMonthIndex - this.monthCount
        const startYear = Math.floor(startMonthIndex / 12)
        const startMonth = startMonthIndex % 12 + 1
        return new Date(startYear, startMonth, 1, 0, 0, 0, 0)
    }
}

function dateToTimestamp(date: Date): string {
    const seconds = date.getTime() / 1000.0
    return seconds.toFixed(9)
}

class TransactionEncoder extends CSVEncoder<Transaction> {

    //
    // CSVEncoder
    //

    protected encodeEntity(t: Transaction): string[][] {
        const result: string[][] = []
        const timestamp = t.consensus_timestamp ? this.formatTimestamp(t.consensus_timestamp) : ""
        const type = t.name ?? ""
        for (const transfer of t.transfers ?? []) {
            const amount = transfer.amount ? this.formatAmount(transfer.amount) : ""
            const accountId = transfer.account ?? ""
            result.push([timestamp, type, amount, accountId])
        }
        return result
    }


    //
    // Private
    //

    private readonly locale = "en-US"

    private readonly dateOptions: Intl.DateTimeFormatOptions = {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZoneName: "short"
    }

    private readonly dateFormat = new Intl.DateTimeFormat(this.locale, this.dateOptions)

    private formatTimestamp(t: string): string {
        const seconds = Number.parseFloat(t);
        return isNaN(seconds) ? t : this.dateFormat.format(seconds * 1000)
    }

    private readonly amountFormatter = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 8,
        maximumFractionDigits: 8
    })

    private formatAmount(tbarValue: number): string {
        return this.amountFormatter.format(tbarValue / 100000000)
    }
}
