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

import {computed, Ref} from "vue";
import {TaskController} from "@/dialogs/core/task/TaskController.ts";
import {ContractCallBuilder} from "@/components/values/abi/ContractCallBuilder.ts";

export class ContractAbiController extends TaskController {

    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>, private readonly contractCallBuilder: ContractCallBuilder) {
        super(showDialog)
    }


    public readonly errorMessage = computed(() => {
        let result: string
        const lastError = this.contractCallBuilder.lastError.value
        if (lastError instanceof Error) {
            result = lastError.message
        } else if (lastError !== null) {
            result = JSON.stringify(lastError)
        } else {
            result = "No error details"
        }
        return result
    })

    //
    // TaskController
    //

    public canBeExecuted(): boolean {
        return this.contractCallBuilder.functionData.value !== null
    }

    public async execute(): Promise<void> {

        this.contractCallBuilder.saveInputParams()
        await this.contractCallBuilder.execute()
        if (this.contractCallBuilder.lastError.value !== null) {
            throw this.contractCallBuilder.lastError.value
        }

    }

}
