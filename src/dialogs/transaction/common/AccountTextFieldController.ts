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

import {computed, ref, Ref, watch, WatchStopHandle} from "vue";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache.ts";
import {AccountBalanceTransactions} from "@/schemas/MirrorNodeSchemas.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {
    EntityTextFieldController,
    EntityTextFieldState
} from "@/dialogs/transaction/common/EntityTextFieldController.ts";

export class AccountTextFieldController {

    public readonly input: Ref<string>
    private readonly entityFieldController: EntityTextFieldController
    private readonly accountInfoRef: Ref<AccountBalanceTransactions|null> = ref(null)
    private readonly searchingRef = ref(false)
    private readonly searchError = ref<unknown>(null)
    private watchStopHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(public readonly networkConfig: NetworkConfig) {
        this.entityFieldController = new EntityTextFieldController(networkConfig)
        this.input = this.entityFieldController.input
    }

    public mount(): void {
        this.watchStopHandle = watch(
            this.entityFieldController.entityId,
            this.entityIdDidChange,
            { immediate: true })
    }

    public unmount(): void {
        if (this.watchStopHandle !== null) {
            this.watchStopHandle()
            this.watchStopHandle = null
        }
        this.accountInfoRef.value = null
        this.searchError.value = null
    }

    public readonly state = computed(() => {
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
            case EntityTextFieldState.ok:
                if (this.searchError.value !== null) {
                    result = AccountTextFieldState.error
                } else {
                    result = AccountTextFieldState.ok
                }
                break
        }
        return result
    })

    public readonly searching = computed(() => this.searchingRef.value)


    public readonly accountId = computed(() => this.entityFieldController.entityId.value)

    public readonly accountInfo = computed(() => this.accountInfoRef.value)


    //
    // Private
    //

    private readonly entityIdDidChange = async (newValue: string|null) => {
        if (newValue !== null) {
            this.searchingRef.value = true
            try {
                this.accountInfoRef.value = await AccountByIdCache.instance.lookup(newValue)
                this.searchError.value = null
            } catch(reason) {
                this.accountInfoRef.value = null
                this.searchError.value = reason
            } finally {
                this.searchingRef.value = false
            }
        } else {
            this.accountInfoRef.value = null
            this.searchError.value = null
        }
    }
}

export enum AccountTextFieldState {
    empty,
    invalid, // Invalid entity id syntax
    invalidChecksum, // Checksum does not match
    error, // Error while searching on mirror node
    ok
}
