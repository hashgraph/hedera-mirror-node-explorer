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

import {TokenRelationship, TokenRelationshipResponse} from "@/schemas/HederaSchemas";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios, {AxiosResponse} from "axios";

export class TokenRelationshipCache extends EntityCache<string, TokenRelationship[] | null> {

    public static readonly instance = new TokenRelationshipCache()

    //
    // Cache
    //

    protected async load(accountId: string): Promise<TokenRelationship[] | null> {
        let result: TokenRelationship[] = []

        let url: string|null = "api/v1/accounts/" + accountId + "/tokens?limit=100"
        let counter = 10
        while (url !== null && counter > 0) {
            const response:AxiosResponse<TokenRelationshipResponse> = await axios.get<TokenRelationshipResponse>(url)
            if (response.data.tokens) {
                result = result.concat(response.data.tokens)
            }
            url = response.data.links.next ?? null
            counter -= 1
        }
        return Promise.resolve(result)
    }

}
