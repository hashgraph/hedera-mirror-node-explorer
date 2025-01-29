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

import {computed, Ref} from "vue";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache.ts";
import {AccountBalanceTransactions} from "@/schemas/MirrorNodeSchemas.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {
    EntityTextFieldController,
    EntityTextFieldState
} from "@/dialogs/common/EntityTextFieldController.ts";
import {EntityLookup} from "@/utils/cache/base/EntityCache.ts";

export class AccountTextFieldController {

    public readonly oldAccountId: Ref<string|null>
    public readonly inputText: Ref<string>
    private readonly entityFieldController: EntityTextFieldController
    private readonly accountLookup: EntityLookup<string, AccountBalanceTransactions|null>

    //
    // Public
    //

    public constructor(oldAccountId: Ref<string|null>, networkConfig: NetworkConfig) {
        this.oldAccountId = oldAccountId
        this.entityFieldController = new EntityTextFieldController(this.oldAccountId, networkConfig)
        this.inputText = this.entityFieldController.inputText
        this.accountLookup = AccountByIdCache.instance.makeLookup(this.newAccountId)
    }

    public mount(): void {
        this.accountLookup.mount()
    }

    public unmount(): void {
        this.accountLookup.unmount()
    }

    public readonly newAccountId = computed(() => this.entityFieldController.newEntityId.value)

    public readonly newAccountInfo = computed(() => this.accountLookup.entity.value)

    public readonly isLoaded = computed(() => this.accountLookup.isLoaded.value)

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
}

export enum AccountTextFieldState {
    empty,
    invalid, // Invalid entity id syntax
    invalidChecksum, // Checksum does not match
    ok
}
