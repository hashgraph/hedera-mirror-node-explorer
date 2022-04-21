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

import {EntityCache} from "@/utils/EntityCache";
import {BalancesResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";

export class BalanceCache extends EntityCache<BalancesResponse> {

    private readonly limit: number
    private accountId: string|undefined

    //
    // Public
    //

    public constructor(accountId: string|undefined , limit = 100, updatePeriod: number|null = null) {
        super(updatePeriod)
        this.limit = limit
        this.accountId = accountId
    }

    public setAccountId(accountId: string | undefined): void {
        this.accountId = accountId
        this.clear()
    }

    //
    // EntityCache
    //

    protected load(): Promise<AxiosResponse<BalancesResponse>> {
        const params = {
            'account.id': this.accountId,
            limit: this.limit,
            order: 'asc'
        }
        return axios.get<BalancesResponse>("api/v1/balances", { params: params} )
    }
}
