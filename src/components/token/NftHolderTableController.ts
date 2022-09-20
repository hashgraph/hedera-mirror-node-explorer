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

import {TableController} from "@/utils/table/TableController";
import {Nft, Nfts} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import axios, {AxiosResponse} from "axios";

export class NftHolderTableController extends TableController<Nft, string> {

    public readonly tokenId: Ref<string | null>

    //
    // Public
    //

    public constructor(tokenId: Ref<string | null>, pageSize: Ref<number>) {
        super(pageSize, 10 * pageSize.value, 5000, 10, 100);
        this.tokenId = tokenId
        this.watchAndReload([this.tokenId])
    }

    //
    // TableController
    //

    public async loadAfter(serialNumber: string | null, limit: number): Promise<Nft[] | null> {
        return this.load(serialNumber, "gt", limit)
    }

    public async loadBefore(serialNumber: string, limit: number): Promise<Nft[] | null> {
        return this.load(serialNumber, "lte", limit)
    }

    public keyFor(row: Nft): string {
        return row.serial_number?.toString() ?? ""
    }

    //
    // Private
    //

    private load(serialNumber: string | null, operator: string, limit: number): Promise<Nft[] | null> {
        let result
        if (this.tokenId.value) {
            const params = {} as {
                limit: number
                order: string
                serialnumber: string | undefined
            }
            params.limit = limit
            params.order = 'asc'
            if (serialNumber !== null) {
                params.serialnumber = operator + ":" + serialNumber
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
}
