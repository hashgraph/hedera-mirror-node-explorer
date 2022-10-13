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

import {ContractAction, ContractActionsResponse} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";
import {computed, ref, Ref, watch} from "vue";
import {EntityBatchLoader} from "@/utils/EntityBatchLoader";

export interface ContractActionWithPath {
    action: ContractAction,
    depthPath: string
}

export class ContractActionsLoader extends EntityBatchLoader<ContractActionsResponse> {

    public readonly transactionIdOrHash: Ref<string | null>

    //
    // Public
    //

    public constructor(transactionIdOrHash: Ref<string | null>) {
        super()
        this.transactionIdOrHash = transactionIdOrHash
        this.watchAndReload([this.transactionIdOrHash])

        watch([this.actions], () => this.addPathtoActions())
    }

    private depthVector: Array<number> = []

    private addPathtoActions() {
        if (this.actions.value) {
            for (const a of this.actions.value) {
                this.actionsWithPath.value.push({
                    action: a,
                    depthPath: this.buildDepthPath(a)
                } as ContractActionWithPath)
            }
        }
    }

    private buildDepthPath(a: ContractAction) {
            let result = ""
        if (a.call_depth != undefined) {
            for (let i = 0; i <= a.call_depth + 1; i++) {
                result += "_" + i
            }
        }
        return result
    }

    public readonly actionsWithPath: Ref<Array<ContractActionWithPath>> = ref([])
    public readonly actions = computed(() => this.entity.value?.actions ?? null)

    //
    // EntityBatchLoader
    //

    protected async loadNext(nextURL:string | null): Promise<AxiosResponse<ContractActionsResponse> | null> {
        let result: Promise<AxiosResponse<ContractActionsResponse> | null>
        if (this.transactionIdOrHash.value !== null) {
            // const sampleActions: AxiosResponse<ContractActionsResponse> = {
            //     data: SAMPLE_CONTRACT_ACTIONS as ContractActionsResponse,
            //     status: 200,
            //     statusText: "",
            //     headers: {},
            //     config: {}
            // }
            // result = Promise.resolve(sampleActions)

            result = axios.get<ContractActionsResponse>(
                nextURL ?? "api/v1/contracts/results/" + this.transactionIdOrHash.value + "/actions"
            )

        } else {
            result = Promise.resolve(null)
        }
        return result
    }

    protected nextURL(entity: ContractActionsResponse): string | null {
        return entity.links?.next ?? null;
    }

    protected mergeResponses(last: AxiosResponse<ContractActionsResponse>, next: AxiosResponse<ContractActionsResponse>): AxiosResponse<ContractActionsResponse> {
        const lastActions = last.data.actions ?? []
        const nextActions = next.data.actions ?? []
        last.data.actions = lastActions.concat(nextActions)
        return last
    }
}
