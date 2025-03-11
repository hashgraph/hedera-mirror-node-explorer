// SPDX-License-Identifier: Apache-2.0

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
