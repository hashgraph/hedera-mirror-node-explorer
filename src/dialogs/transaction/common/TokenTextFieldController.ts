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
import {TokenInfo} from "@/schemas/MirrorNodeSchemas.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {
    EntityTextFieldController,
    EntityTextFieldState
} from "@/dialogs/transaction/common/EntityTextFieldController.ts";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache.ts";

export class TokenTextFieldController {

    public readonly input: Ref<string>
    private readonly entityFieldController: EntityTextFieldController
    private readonly tokenInfoRef: Ref<TokenInfo|null> = ref(null)
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
        this.tokenInfoRef.value = null
        this.searchError.value = null
    }

    public readonly state = computed(() => {
        let result: TokenTextFieldState
        switch(this.entityFieldController.state.value) {
            case EntityTextFieldState.empty:
                result = TokenTextFieldState.empty
                break
            case EntityTextFieldState.invalidSyntax:
                result = TokenTextFieldState.invalid
                break
            case EntityTextFieldState.invalidChecksum:
                result = TokenTextFieldState.invalidChecksum
                break
            case EntityTextFieldState.ok:
                if (this.searchError.value !== null) {
                    result = TokenTextFieldState.error
                } else {
                    result = TokenTextFieldState.ok
                }
                break
        }
        return result
    })

    public readonly searching = computed(() => this.searchingRef.value)

    public readonly tokenId = computed(() => this.entityFieldController.entityId.value)

    public readonly tokenInfo = computed(() => this.tokenInfoRef.value)


    //
    // Private
    //

    private readonly entityIdDidChange = async (newValue: string|null) => {
        if (newValue !== null) {
            this.searchingRef.value = true
            try {
                this.tokenInfoRef.value = await TokenInfoCache.instance.lookup(newValue)
                this.searchError.value = null
            } catch(reason) {
                this.tokenInfoRef.value = null
                this.searchError.value = reason
            } finally {
                this.searchingRef.value = false
            }
        } else {
            this.tokenInfoRef.value = null
            this.searchError.value = null
        }
    }
}

export enum TokenTextFieldState {
    empty,
    invalid, // Invalid entity id syntax
    invalidChecksum, // Checksum does not match
    error, // Error while searching on mirror node
    ok
}
