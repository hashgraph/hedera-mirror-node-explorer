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

import {EntityLoader} from "@/utils/EntityLoader";
import {AccountBalanceTransactions} from "@/schemas/HederaSchemas";
import {makeEthAddressForAccount} from "@/schemas/HederaUtils";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import {computed, ref, Ref, watch} from "vue";
import axios, {AxiosResponse} from "axios";

export class AccountLoader extends EntityLoader<AccountBalanceTransactions> {

    //
    // Public
    //

    public constructor() {
        super()
        watch(this.accountLocator, () => this.accountLocatorDidChange())
    }

    public readonly accountLocator: Ref<string|null> = ref(null) // Entity Id or Alias or EVM Address

    public readonly accountId: Ref<string|null> = computed(() => this.entity.value?.account ?? null)

    public readonly stakedNodeId: Ref<number|null> = computed(() => this.entity.value?.staked_node_id ?? null)

    public readonly accountInfo: Ref<string|null> = computed(() => {
        return this.accountId.value !== null ? operatorRegistry.makeDescription(this.accountId.value) : null
    })

    public readonly nodeId: Ref<number|null> = computed(() => {
        return this.accountId.value !== null ? operatorRegistry.lookup(this.accountId.value)?.nodeId ?? null : null
    })

    public readonly ethereumAddress = computed(() => {
        return this.entity.value !== null ? makeEthAddressForAccount(this.entity.value) : null
    })


    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<AccountBalanceTransactions>> {
        const url = "api/v1/accounts/" + this.accountLocator.value
        const params = {
            limit: 1
        }
        return axios.get<AccountBalanceTransactions>(url, { params: params})
    }

    //
    // Private
    //

    private accountLocatorDidChange() {
        if (this.accountLocator.value != null) {
            this.requestLoad()
        } else {
            this.clear()
        }
    }

}
