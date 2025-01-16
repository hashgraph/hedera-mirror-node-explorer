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

import {Ref, watch} from "vue";

export abstract class TaskController {

    //
    // To be subclassed
    //

    public abstract canBeExecuted(): boolean

    public async execute(): Promise<void> {
        throw "Must be subclassed"
    }

    protected mount(): void {
        // Dialog did start showing
    }

    protected unmount(): void {
        // Dialog did stop showing
    }

    //
    // Protected
    //

    protected constructor(public readonly showDialog: Ref<boolean>) {
        watch(this.showDialog, (show) => {
            if (show) {
                this.mount()
            } else {
                this.unmount()
            }
        })
    }

}
