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

import {TokenRelationshipResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, Ref} from "vue";
import {EntityBatchLoader} from "@/utils/loader/EntityBatchLoader";

export class TokenRelationshipLoader extends EntityBatchLoader<TokenRelationshipResponse> {

    //
    // Public
    //

    public constructor(accountLocator: Ref<string|null>) {
        super(10) // so we get a max of 10 * 100 associated tokens
        this.accountLocator = accountLocator
        this.watchAndReload([this.accountLocator])
    }

    public readonly accountLocator: Ref<string|null> // Entity Id or Alias or EVM Address

    public readonly tokens = computed(() => this.entity.value?.tokens ?? null)

    public lookupTokens(createdTimestamp: string): Array<string> {
        const result = Array<string>()
        for (const t of this.tokens.value ?? []) {
            if (t.created_timestamp === createdTimestamp && t.token_id) {
                result.push(t.token_id)
            }
        }
        return result
    }

    //
    // EntityBatchLoader
    //

    protected async loadNext(nextURL:string | null): Promise<AxiosResponse<TokenRelationshipResponse> | null> {
        let result: Promise<AxiosResponse<TokenRelationshipResponse> | null>
        if (this.accountLocator.value !== null) {
            const params = {
                limit: 100,
            }
            result = axios.get<TokenRelationshipResponse>(
                nextURL ?? "api/v1/accounts/" + this.accountLocator.value + "/tokens",
                {params: params}
            )

        } else {
            result = Promise.resolve(null)
        }
        return result
    }

    protected nextURL(entity: TokenRelationshipResponse): string | null {
        return entity.links?.next ?? null;
    }

    protected mergeResponses(last: AxiosResponse<TokenRelationshipResponse>,
                             next: AxiosResponse<TokenRelationshipResponse>): AxiosResponse<TokenRelationshipResponse> {
        const lastActions = last.data.tokens ?? []
        const nextActions = next.data.tokens ?? []
        last.data.tokens = lastActions.concat(nextActions)
        return last
    }
}
