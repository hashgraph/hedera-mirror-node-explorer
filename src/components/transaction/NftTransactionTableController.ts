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

import {KeyOperator, SortOrder, TableController,} from "@/utils/table/TableController"
import {NftTransactionHistory, NftTransactionTransfer,} from "@/schemas/MirrorNodeSchemas"
import {ComputedRef, ref, Ref, watch, WatchStopHandle} from "vue"
import axios from "axios"
import {LocationQuery, Router} from "vue-router"
import {fetchStringQueryParam} from "@/utils/RouteManager"

export class NftTransactionTableController extends TableController<
    NftTransactionTransfer,
    string
> {
    private readonly tokenId: Ref<string | null>
    private readonly serialNumber: Ref<string | null>

    //
    // Public
    //

    public constructor(
        router: Router,
        tokenId: Ref<string | null>,
        serialNumber: Ref<string | null>,
        pageSize: ComputedRef<number>,
        pageParamName = "p",
        keyParamName = "k",
    ) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.SLOW_REFRESH_PERIOD,
            TableController.SLOW_REFRESH_COUNT,
            100,
            pageParamName,
            keyParamName,
        )
        this.tokenId = tokenId
        this.serialNumber = serialNumber
        this.watchAndReload([
            this.transactionType,
            this.tokenId,
            this.serialNumber,
        ])
    }

    public readonly transactionType: Ref<string> = ref("")

    //
    // TableController
    //

    public async load(
        consensusTimestamp: string | null,
        operator: KeyOperator,
        order: SortOrder,
        limit: number,
    ): Promise<NftTransactionTransfer[] | null> {
        if (this.tokenId.value === null || this.serialNumber.value === null) {
            return Promise.resolve(null)
        }

        const params = {} as {
            limit: number
            order: string
            timestamp: string | undefined
        }
        params.limit = limit
        params.order = order

        if (consensusTimestamp !== null) {
            params.timestamp = operator + ":" + consensusTimestamp
        }

        const r = await axios.get<NftTransactionHistory>(
            `api/v1/tokens/${this.tokenId.value}/nfts/${this.serialNumber.value}/transactions`,
            {params: params},
        )
        return r.data.transactions ?? []
    }

    public keyFor(row: NftTransactionTransfer): string {
        return row.consensus_timestamp ?? ""
    }

    public keyFromString(s: string): string | null {
        return s
    }

    public stringFromKey(key: string): string {
        return key
    }

    public mount(): void {
        // Must be done before calling mount()
        this.transactionType.value = this.fetchTransactionTypeParam()
        super.mount()
        this.watchTransactionTypeHandle = watch(this.transactionType, () =>
            this.updateRouteQuery(),
        )
    }

    public unmount(): void {
        if (this.watchTransactionTypeHandle !== null) {
            this.watchTransactionTypeHandle()
        }
        this.watchTransactionTypeHandle = null
        super.unmount()
    }

    protected makeRouteQuery(): LocationQuery {
        const result = super.makeRouteQuery()
        if (this.transactionType.value != "") {
            result[this.typeParamName] =
                this.transactionType.value.toLowerCase()
        } else {
            delete result[this.typeParamName]
        }
        return result
    }

    //
    // Private
    //

    private readonly typeParamName = "type"
    private watchTransactionTypeHandle: WatchStopHandle | null = null

    public fetchTransactionTypeParam(): string {
        return (
            fetchStringQueryParam(
                this.typeParamName,
                this.router.currentRoute.value,
            )?.toUpperCase() ?? ""
        )
    }
}
