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

import {Transaction, TransactionResponse, TransactionType} from "@/schemas/MirrorNodeSchemas";
import {dateToTimestamp, EntityDownloader} from "@/utils/downloader/EntityDownloader";
import axios, {AxiosResponse} from "axios";
import {Ref, watch} from "vue";

export abstract class AbstractTransactionDownloader extends EntityDownloader<Transaction, TransactionResponse> {

    public readonly accountId: Ref<string | null>
    public readonly transactionType: Ref<TransactionType | null>

    public readonly wrongSetupError = new Error("this.accountId or this.startDate not set")

    //
    // EntityDownloader
    //

    protected async loadNext(nextURL: string | null): Promise<AxiosResponse<TransactionResponse>> {

        if (nextURL == null) {
            if (this.accountId.value !== null && this.startDate.value !== null) {
                const startTimestamp = dateToTimestamp(this.startDate.value)
                const endTimestamp = this.endDate.value !== null ? dateToTimestamp(this.endDate.value) : null

                nextURL = "api/v1/transactions"
                    + "?account.id=" + this.accountId.value
                    + "&order=asc"
                    + "&timestamp=gte:" + startTimestamp
                if (endTimestamp !== null) {
                    nextURL += "&timestamp=lt:" + endTimestamp
                }
                if (this.transactionType.value !== null) {
                    nextURL += "&transactiontype=" + this.transactionType.value
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


    //
    // Protected
    //

    protected constructor(accountId: Ref<string | null>,
                          transactionType: Ref<TransactionType | null>,
                          startDate: Ref<Date | null>,
                          endDate: Ref<Date | null>,
                          maxTransactionCount: number) {
        super(startDate, endDate, maxTransactionCount)
        this.accountId = accountId
        this.transactionType = transactionType
        watch(this.accountId, () => {
            this.abort().then()
        })
    }
}
