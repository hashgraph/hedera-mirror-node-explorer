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

import {Nft, Nfts} from "@/schemas/MirrorNodeSchemas";
import {ComputedRef, Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";

export class NftHolderTableController extends TableController<Nft, string> {

    public readonly tokenId: Ref<string | null>

    //
    // Public
    //

    public constructor(router: Router, tokenId: ComputedRef<string | null>, pageSize: Ref<number>) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.SLOW_REFRESH_PERIOD,
            TableController.SLOW_REFRESH_COUNT,
            100
        );
        this.tokenId = tokenId
        this.watchAndReload([this.tokenId, this.pageSize])
    }

    //
    // TableController
    //

    public async load(serialNumber: string | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<Nft[] | null> {
        let result
        if (this.tokenId.value) {
            const params = {} as {
                limit: number
                order: string
                serialnumber: string | undefined
            }
            params.limit = limit
            params.order = TableController.invertSortOrder(order)
            const keyOperator = TableController.invertKeyOperator(operator)
            if (serialNumber !== null) {
                params.serialnumber = keyOperator + ":" + serialNumber
            }
            const cb = (r: AxiosResponse<Nfts>): Promise<Nft[] | null> => {
                return Promise.resolve(r.data.nfts ?? [])
            }
            result = axios.get<Nfts>("api/v1/tokens/" + this.tokenId.value + "/nfts", {params: params}).then(cb)
        } else {
            result = Promise.resolve(null)
        }
        return result
    }

    public keyFor(row: Nft): string {
        return row.serial_number?.toString() ?? ""
    }

    public stringFromKey(key: string): string {
        return key;
    }

    public keyFromString(s: string): string | null {
        return s;
    }
}
