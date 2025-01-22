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
import {TokenInfo, TokenRelationship} from "@/schemas/MirrorNodeSchemas.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {
    EntityTextFieldController,
    EntityTextFieldState
} from "@/dialogs/transaction/common/EntityTextFieldController.ts";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache.ts";
import {EntityLookup} from "@/utils/cache/base/EntityCache.ts";
import {TokenAssociationCache} from "@/utils/cache/TokenAssociationCache.ts";

export class TokenTextFieldController {

    private readonly entityFieldController: EntityTextFieldController
    private readonly tokenLookup: EntityLookup<string, TokenInfo|null>
    private readonly tokenAssociationLookup: EntityLookup<string, TokenRelationship[] | null>

    //
    // Public
    //

    public constructor(
        public readonly networkConfig: NetworkConfig,
        public readonly accountId: Ref<string|null> = ref(null),
        public readonly input: Ref<string> = ref("")) {
        this.entityFieldController = new EntityTextFieldController(networkConfig, input)
        this.tokenLookup = TokenInfoCache.instance.makeLookup(this.tokenId)
        this.tokenAssociationLookup = TokenAssociationCache.instance.makeTokenAssociationLookup(this.accountId,this.tokenId)
    }

    public mount(): void {
        this.tokenLookup.mount()
        this.tokenAssociationLookup.mount()
    }

    public unmount(): void {
        this.tokenLookup.unmount()
        this.tokenAssociationLookup.unmount()
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

    public readonly isLoaded = computed(() => this.tokenLookup.isLoaded.value)

    public readonly isTokenAssociationLoaded = computed(() => this.tokenAssociationLookup.isLoaded.value)

    public readonly isTokenAssociated = computed(() => {
        const associations = this.tokenAssociationLookup.entity.value ?? []
        return associations && associations.length >= 1
    })
}


export enum TokenTextFieldState {
    empty,
    invalid, // Invalid entity id syntax
    invalidChecksum, // Checksum does not match
    ok
}
