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
import {TokenInfo} from "@/schemas/MirrorNodeSchemas.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {
    EntityTextFieldController,
    EntityTextFieldState
} from "@/dialogs/transaction/common/EntityTextFieldController.ts";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache.ts";
import {EntityLookup} from "@/utils/cache/base/EntityCache.ts";

export class TokenTextFieldController {

    private readonly entityFieldController: EntityTextFieldController
    private readonly tokenLookup: EntityLookup<string, TokenInfo|null>
    // private readonly tokenInfoRef: Ref<TokenInfo|null> = ref(null)
    // private readonly searchingRef = ref(false)
    // private readonly searchError = ref<unknown>(null)
    // private watchStopHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(public readonly networkConfig: NetworkConfig, public readonly input: Ref<string> = ref("")) {
        this.entityFieldController = new EntityTextFieldController(networkConfig, input)
        this.tokenLookup = TokenInfoCache.instance.makeLookup(this.tokenId)
    }

    public mount(): void {
        this.tokenLookup.mount()
    }

    public unmount(): void {
        this.tokenLookup.unmount()
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
            default:
            case EntityTextFieldState.ok:
                result = TokenTextFieldState.ok
                break
        }
        return result
    })

    public readonly tokenId = computed(() => this.entityFieldController.entityId.value)

    public readonly tokenInfo = computed(() => this.tokenLookup.entity.value)

    public readonly isLoaded = computed(() => this.tokenLookup.isLoaded())

}

export enum TokenTextFieldState {
    empty,
    invalid, // Invalid entity id syntax
    invalidChecksum, // Checksum does not match
    ok
}
