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

import {Nft, Nfts} from "@/schemas/MirrorNodeSchemas";
import {ComputedRef, Ref} from "vue";
import axios from "axios";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";

export class CollectionTableController extends TableController<Nft, number> {

    public readonly accountId: Ref<string | null>
    public readonly tokenId: string

    //
    // Public
    //

    public constructor(router: Router, tokenId: string, accountId: Ref<string | null>, pageSize: ComputedRef<number>) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.SLOW_REFRESH_PERIOD,
            TableController.SLOW_REFRESH_COUNT,
            100
        )
        this.accountId = accountId
        this.tokenId = tokenId
    }

    //
    // TableController
    //

    public async load(serialNumber: number | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<Nft[] | null> {
        if (this.tokenId == null || this.accountId.value == null) {
            return Promise.resolve(null)
        }

        const params = {} as {
            limit: number
            "token.id": string | undefined
            serialnumber: string | undefined
            order: string
        }
        params.limit = limit
        params.order = TableController.invertSortOrder(order)
        const keyOperator = TableController.invertKeyOperator(operator)
        params["token.id"] = this.tokenId

        if (serialNumber !== null) {
            params.serialnumber = keyOperator + ":" + serialNumber
        }

        const {data} = await axios.get<Nfts>(
            `api/v1/accounts/${this.accountId.value}/nfts`,
            {params: params},
        )

        const nfts = data.nfts ?? null

        return Promise.resolve(nfts)
    }

    public keyFor(row: Nft): number {
        return row.serial_number ?? 0
    }

    public stringFromKey(serialNumber: number): string {
        return serialNumber.toString()
    }

    public keyFromString(s: string): number | null {
        return Number(s)
    }
}
