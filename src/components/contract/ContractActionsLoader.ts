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

import {ContractAction, ContractActionsResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, ref, Ref, watch} from "vue";
import {EntityLoader} from "@/utils/loader/EntityLoader";

const MAX_DEPTH_LEVEL = 20

export interface ContractActionWithPath {
    action: ContractAction,
    depthPath: string
}

export class ContractActionsLoader extends EntityLoader<ContractActionsResponse> {

    public readonly transactionIdOrHash: Ref<string | null>

    //
    // Public
    //

    public constructor(transactionIdOrHash: Ref<string | null>) {
        super()
        this.transactionIdOrHash = transactionIdOrHash
        this.watchAndReload([this.transactionIdOrHash])
        watch(this.actions, () => this.makeActionsWithPath())
    }

    public readonly actionsWithPath: Ref<Array<ContractActionWithPath>> = ref([])
    public readonly actions = computed(() => this.entity.value?.actions ?? null)

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<ContractActionsResponse> | null> {
        let result: AxiosResponse<ContractActionsResponse>|null = null
        let url: string|null = "api/v1/contracts/results/" + this.transactionIdOrHash.value + "/actions?limit=100"
        while (url !== null) {
            const next:AxiosResponse<ContractActionsResponse> = await axios.get(url)
            result = result !== null ? this.mergeResponses(result, next) : next
            url = next.data.links?.next ?? null
        }
        return Promise.resolve(result)
    }

    //
    // Private
    //

    private mergeResponses(last: AxiosResponse<ContractActionsResponse>,
                             next: AxiosResponse<ContractActionsResponse>): AxiosResponse<ContractActionsResponse> {
        const lastActions = last.data.actions ?? []
        const nextActions = next.data.actions ?? []
        last.data.actions = lastActions.concat(nextActions)
        return last
    }

    private makeActionsWithPath() {
        let depthVector: Array<number> = []
        const actionsWithPath: Array<ContractActionWithPath> = []

        if (this.actions.value) {
            depthVector = []
            for (const a of this.actions.value) {
                actionsWithPath.push({
                    action: a,
                    depthPath: ContractActionsLoader.buildDepthPath(a.call_depth ?? 0, depthVector)
                } as ContractActionWithPath)
            }
            this.actionsWithPath.value = actionsWithPath
        } else {
            this.actionsWithPath.value = []
        }
    }

    private static buildDepthPath(depth: number, depthVector: Array<number>) {
        let result = ""

        if (depthVector.length >= depth + 1) {
            depthVector[depth]++
            depthVector.splice(depth + 1)
        } else {
            depthVector.push(1)
        }

        for (let i = 0; i < depthVector.length && i < MAX_DEPTH_LEVEL; i++) {
            if (i < MAX_DEPTH_LEVEL - 1) {
                result += (i === 0) ? depthVector[i] : "_" + depthVector[i]
            } else {
                result +='(…)'
            }
        }

        return result
    }
}
