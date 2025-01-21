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

import {computed, ref, Ref, watch} from "vue";
import {InputChangeController} from "@/components/utils/InputChangeController.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {EntityID} from "@/utils/EntityID.ts";
import {extractChecksum, stripChecksum} from "@/schemas/MirrorNodeUtils.ts";
import {routeManager} from "@/router.ts";

export class EntityTextFieldController {

    private readonly inputChangeController: InputChangeController

    //
    // Public
    //

    public constructor(public readonly networkConfig: NetworkConfig, public readonly input: Ref<string>) {
        this.inputChangeController = new InputChangeController(this.input)
        watch(this.entityId, () => {
            if (this.entityId.value !== null) {
                this.input.value = this.entityId.value
            }
        })
    }

    public readonly state = computed(() => {
        let result: EntityTextFieldState
        const trimmedValue = this.inputChangeController.outputText.value.trim()
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

    public readonly entityId = computed(() => {
        let result: string|null
        const trimmedValue = this.inputChangeController.outputText.value.trim()
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
