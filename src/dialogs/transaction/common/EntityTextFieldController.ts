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

    public readonly input: Ref<string> = ref("")
    private readonly inputChangeController: InputChangeController
    private readonly stateRef = ref(EntityTextFieldState.empty)
    private readonly entityIdRef: Ref<string|null> = ref(null)

    //
    // Public
    //

    public constructor(public readonly networkConfig: NetworkConfig) {
        this.inputChangeController = new InputChangeController(this.input)
        watch(this.inputChangeController.outputText, this.outputTextDidChange)

    }

    public readonly state = computed(() => this.stateRef.value)

    public readonly entityId = computed(() => this.entityIdRef.value)


    //
    // Private
    //

    private readonly outputTextDidChange = async (newValue: string) => {
        const trimmedValue = newValue.trim()
        if (trimmedValue !== "") {
            const entityID = EntityID.parse(stripChecksum(newValue), true)
            if (entityID !== null) {
                const checksum = extractChecksum(newValue)
                const network = routeManager.currentNetwork.value
                if (checksum === null ||  this.networkConfig.isValidChecksum(entityID.toString(), checksum, network)) {
                    this.entityIdRef.value = entityID.toString()
                    this.stateRef.value = EntityTextFieldState.ok
                    this.input.value = this.entityIdRef.value
                } else {
                    this.entityIdRef.value = null
                    this.stateRef.value = EntityTextFieldState.invalidChecksum
                }
            } else {
                this.entityIdRef.value = null
                this.stateRef.value = EntityTextFieldState.invalidSyntax
            }
        } else {
            this.entityIdRef.value = null
            this.stateRef.value = EntityTextFieldState.empty
        }
    }
}

export enum EntityTextFieldState {
    empty,
    invalidSyntax, // Invalid entity id syntax
    invalidChecksum, // Checksum does not match
    ok
}
