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

import {computed, Ref, watch} from "vue";
import {routeManager} from "@/router.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {EntityID} from "@/utils/EntityID.ts";
import {BaseTextFieldController} from "@/dialogs/common/BaseTextFieldController.ts"
import {extractChecksum, stripChecksum} from "@/schemas/MirrorNodeUtils.ts";

export class EntityTextFieldController {

    public readonly oldEntityId: Ref<string|null>
    public readonly inputText: Ref<string>
    private readonly networkConfig: NetworkConfig
    private readonly baseTextFieldController: BaseTextFieldController

    //
    // Public
    //

    public constructor(oldEntityId: Ref<string|null>, networkConfig: NetworkConfig) {

        this.oldEntityId = oldEntityId
        this.baseTextFieldController = new BaseTextFieldController(oldEntityId)
        this.inputText = this.baseTextFieldController.inputText
        this.networkConfig = networkConfig

        watch(this.newEntityId, () => {
            if (this.newEntityId.value !== null) {
                this.inputText.value = this.newEntityId.value
            }
        })
    }

    public readonly state = computed(() => {
        let result: EntityTextFieldState
        const trimmedValue = this.baseTextFieldController.newText.value.trim()
        if (trimmedValue !== "") {
            const entityID = EntityID.parse(stripChecksum(trimmedValue), true)
            if (entityID !== null) {
                const checksum = extractChecksum(trimmedValue)
                const network = routeManager.currentNetwork.value
                if (checksum === null ||  this.networkConfig.isValidChecksum(entityID.toString(), checksum, network)) {
                    result = EntityTextFieldState.ok
                } else {
                    result = EntityTextFieldState.invalidChecksum
                }
            } else {
                result = EntityTextFieldState.invalidSyntax
            }
        } else {
            result = EntityTextFieldState.empty
        }
        return result
    })

    public readonly newEntityId = computed(() => {
        let result: string|null
        const trimmedValue = this.baseTextFieldController.newText.value.trim()
        if (trimmedValue !== "") {
            const entityID = EntityID.parse(stripChecksum(trimmedValue), true)
            result = entityID?.toString() ?? null
        } else {
            result = null
        }
        return result
    })
}

export enum EntityTextFieldState {
    empty,
    invalidSyntax, // Invalid entity id syntax
    invalidChecksum, // Checksum does not match
    ok
}
