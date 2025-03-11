// SPDX-License-Identifier: Apache-2.0

import {Block, BlocksResponse} from "@/schemas/MirrorNodeSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";

export class BlockTableController extends TableController<Block, number> {

    //
    // Public
    //

    public constructor(router: Router, pageSize: Ref<number>) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.FAST_REFRESH_PERIOD,
            TableController.FAST_REFRESH_COUNT,
            100
        );
        this.watchAndReload([this.pageSize])
    }

    //
    // TableController
    //

    public async load(blockNb: number | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<Block[] | null> {

        const params = {} as {
            limit: number
            "block.number": string
            order: string
        }
        params.limit = limit
        params.order = order
        if (blockNb !== null) {
            params["block.number"] = operator + ":" + blockNb
        }
        const cb = (r: AxiosResponse<BlocksResponse>): Promise<Block[] | null> => {
            return Promise.resolve(r.data.blocks ?? [])
        }

        return axios.get<BlocksResponse>("api/v1/blocks", {params: params}).then(cb)
    }

    public keyFor(row: Block): number {
        return row.number ?? -1
    }

    public stringFromKey(key: number): string {
        return key.toString()
    }

    public keyFromString(s: string): number | null {
        return Number(s)
    }
}
