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

import {EntityCache} from "@/utils/cache/base/EntityCache";
import {Nft, Nfts} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";

export class NftCollectionCache extends EntityCache<string, NftCollectionInfo[]> {

    public static readonly instance = new NftCollectionCache()

    //
    // Cache
    //

    protected async load(accountId: string): Promise<NftCollectionInfo[]> {
        let result: NftCollectionInfo[] = []
        let nextURL: string | null = "api/v1/accounts/" + accountId + "/nfts"
        const params = {
            limit: 25
        }
        while (nextURL !== null) {
            const response: AxiosResponse<Nfts>
                = await axios.get<Nfts>(nextURL, {params: params})
            this.appendNfts(response.data.nfts ?? [], result)
            nextURL = response.data.links?.next ?? null
        }
        return Promise.resolve(result)
    }

    //
    // Private
    //

    private static readonly SAMPLE_COUNT = 10

    private appendNfts(nfts: Nft[], result: NftCollectionInfo[]) {
        for (const nft of nfts) {
            this.appendNft(nft, result)
        }
    }

    private appendNft(nft: Nft, result: NftCollectionInfo[]) {

        //
        // Nfts[] are returned in a specific order.
        // See https://testnet.mirrornode.hedera.com/api/v1/docs/#/accounts/listNftByAccountId
        // Logic below assumes this ordering
        //

        const lastCollection = result.length >= 1 ? result[result.length - 1] : null
        if (lastCollection !== null && lastCollection.tokenId === nft.token_id) {
            lastCollection.collectionSize += 1
            if (lastCollection.samples.length < NftCollectionCache.SAMPLE_COUNT) {
                lastCollection.samples.push(nft)
            }
        } else {
            result.push(new NftCollectionInfo(nft.token_id ?? null, nft))
        }
    }
}

export class NftCollectionInfo {

    public readonly tokenId: string | null
    public collectionSize: number
    public samples: Nft[]

    public constructor(tokenId: string | null, firstSample: Nft) {
        this.tokenId = tokenId
        this.collectionSize = 1
        this.samples = [firstSample]
    }
}