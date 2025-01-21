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

import {computed, ref, Ref} from "vue";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache.ts";
import {AccountBalanceTransactions} from "@/schemas/MirrorNodeSchemas.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {
    EntityTextFieldController,
    EntityTextFieldState
} from "@/dialogs/transaction/common/EntityTextFieldController.ts";
import {EntityLookup} from "@/utils/cache/base/EntityCache.ts";

export class AccountTextFieldController {

    private readonly entityFieldController: EntityTextFieldController
    private readonly accountLookup: EntityLookup<string, AccountBalanceTransactions|null>

    //
    // Public
    //

    public constructor(public readonly networkConfig: NetworkConfig, public readonly input: Ref<string> = ref("")) {
        this.entityFieldController = new EntityTextFieldController(networkConfig, input)
        this.accountLookup = AccountByIdCache.instance.makeLookup(this.accountId)
    }

    public mount(): void {
        this.accountLookup.mount()
    }

    public unmount(): void {
        this.accountLookup.unmount()
    }

    public readonly state = computed<AccountTextFieldState>(() => {
        let result: AccountTextFieldState
        switch(this.entityFieldController.state.value) {
            case EntityTextFieldState.empty:
                result = AccountTextFieldState.empty
                break
            case EntityTextFieldState.invalidSyntax:
                result = AccountTextFieldState.invalid
                break
            case EntityTextFieldState.invalidChecksum:
                result = AccountTextFieldState.invalidChecksum
                break
            default:
            case EntityTextFieldState.ok:
                result = AccountTextFieldState.ok
                break
        }
        return result
    })


    public readonly accountId = computed(() => this.entityFieldController.entityId.value)

    public readonly accountInfo = computed(() => this.accountLookup.entity.value)

    public readonly isLoaded = computed(() => this.accountLookup.isLoaded())
}

export enum AccountTextFieldState {
    empty,
    invalid, // Invalid entity id syntax
    invalidChecksum, // Checksum does not match
    ok
}
