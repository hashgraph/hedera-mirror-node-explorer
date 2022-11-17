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

import {NetworkNode, NetworkNodesResponse} from "@/schemas/HederaSchemas";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import {EntityLoader} from "@/utils/loader/EntityLoader";
import axios, {AxiosResponse} from "axios";
import {computed, ComputedRef, Ref} from "vue";

export class NodeLoader extends EntityLoader<NetworkNodesResponse> {

    public readonly nodeId: Ref<number|null>

    //
    // Public
    //

    public constructor(nodeId: Ref<number|null>) {
        super()
        this.nodeId = nodeId
        this.watchAndReload([this.nodeId])
    }

    public readonly node: ComputedRef<NetworkNode|null> = computed(() => {
        const nodes = this.entity.value?.nodes
        return nodes && nodes.length >= 1 ? nodes[0] : null
    })

    public readonly nodeDescription: ComputedRef<string|null> = computed(() => {
        let result: string|null
        if (this.node.value !== null) {
            if (this.node.value.description) {
                result = this.node.value.description
            } else if (this.node.value.node_account_id) {
                result = operatorRegistry.makeDescription(this.node.value.node_account_id)
            } else {
                result = null
            }
        } else {
            result = null
        }
        return result
    })

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<NetworkNodesResponse>|null> {
        let result: Promise<AxiosResponse<NetworkNodesResponse>|null>
        if (this.nodeId.value != null) {
            const url = "api/v1/network/nodes"
            const queryParams = {params: {'node.id': this.nodeId.value}}
            result = axios.get<NetworkNodesResponse>(url, queryParams)
        } else {
            result = Promise.resolve(null)
        }
        return result
    }


}
