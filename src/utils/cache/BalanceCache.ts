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

import axios from "axios";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import {BalancesResponse, TokenBalance} from "@/schemas/HederaSchemas";

interface TokenResponse {
    links: {
        next: string | null
    },
    tokens: TokenBalance[]
}

export class BalanceCache extends EntityCache<string, BalancesResponse | null> {

    public static readonly instance = new BalanceCache()
    //
    // Cache
    //

    protected async load(accountId: string): Promise<BalancesResponse | null> {
        let result: Promise<BalancesResponse|null>
        try {
            const params = {
                'account.id': accountId,
            }

            const balanceResponse = await axios.get<BalancesResponse>("api/v1/balances", { params: params} )
            const tokensReponse = await axios.get<TokenResponse>(`api/v1/accounts/${accountId}/tokens?limit=100&order=desc`)

            if (balanceResponse.data.balances && balanceResponse.data.balances.length >= 1) {
                balanceResponse.data.balances[0].tokens = (await this.requestNextTokenBatch(tokensReponse.data, [])) as TokenBalance[]
            }

            result = Promise.resolve(balanceResponse.data)
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = Promise.resolve(null)
            } else {
                throw error
            }
        }
        return result
    }


    /**
     * @notice The `api/v1/accounts/${accountId}/tokens` endpoint can return a maximum of 100 records. 
     *         If more records are available, a `links.next` endpoint will be returned in the response. 
     *         Make a new request at `links.next` endpoint to fetch the next batch of records.
     * 
     * @dev Recursively make request to mirror node using the `tokensReponse.links.next` url to fetch all records
     */
    private requestNextTokenBatch: any = async (tokensReponse: TokenResponse, tokens: TokenBalance[]) => {
        if (!tokensReponse.links.next) {
            tokens.push(...tokensReponse.tokens)
            return tokens
        }

        tokens.push(...tokensReponse.tokens)
        const nextTokensReponses = await axios.get(tokensReponse.links.next)
        return await this.requestNextTokenBatch(nextTokensReponses.data, tokens)
    }

}
