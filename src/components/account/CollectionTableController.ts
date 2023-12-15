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

import {
    Nft,
    Nfts,
    NftTransactionHistory,
    TokenBalancesResponse,
    TokenDistribution,
    TokenRelationship
} from "@/schemas/HederaSchemas";
import {ComputedRef, Ref} from "vue";
import axios, {AxiosResponse} from "axios";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";

export class CollectionTableController extends TableController<Nft, string> {

    public readonly accountId: Ref<string | null>
    public readonly tokenId: string

    //
    // Public
    //

    public constructor(router: Router, tokenId: string, accountId: Ref<string | null>, pageSize: ComputedRef<number>) {
        super(router, pageSize, 10 * pageSize.value, 5000, 10, 100)
        this.accountId = accountId
        this.tokenId = tokenId
    }

    //
    // TableController
    //

    public async load(tokenId: string | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<Nft[] | null> {
        if (this.accountId.value == null) {
            return Promise.resolve(null)
        }

        const params = {} as {
            limit: number
            "token.id": string | undefined
            order: string
        }
        params.limit = 10000
        params.order = order
        if (tokenId !== null) {
            params["token.id"] = operator + ":" + tokenId
        }

        const { data } = await axios.get<Nfts>(
          `api/v1/accounts/${this.accountId.value}/nfts`,
          {params: params},
        )

        const collectionsMap = new Map();
        for (const nft of data.nfts!) {
            let collection = collectionsMap.get(nft.token_id);
            if (collection === undefined) {
                collection = { count: 0, nfts: [] };
                collectionsMap.set(nft.token_id, collection);
            }
            collection.count += 1;
            collection.nfts.push(nft);
        }

        const nfts = collectionsMap.get(this.tokenId).nfts

        return nfts
    }

    public keyFor(row: Nft): string {
        return row.token_id ?? ""
    }

    public stringFromKey(key: string): string {
        return key;
    }

    public keyFromString(s: string): string | null {
        return s;
    }
}
