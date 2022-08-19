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

import axios, {AxiosResponse} from "axios";
import {computed, Ref, ref} from "vue";


export abstract class EntityLoader<E> {

    private readonly responseRef: Ref<AxiosResponse<E> | null> = ref(null)
    private readonly errorRef: Ref<unknown> = ref(null)
    private requestCounter = 0

    //
    // Public
    //

    public response = computed(() => this.responseRef.value)
    public entity = computed(() => this.responseRef.value?.data ?? null)
    public error = computed(() => this.errorRef.value)
    public got404 = computed(() => this.errorRef.value !== null
                                            && axios.isAxiosError(this.errorRef.value)
                                            && this.errorRef.value?.response?.status === 404)

    //
    // Protected
    //

    protected async load(): Promise<AxiosResponse<E>> {
        throw Error("must be subclassed")
    }

    protected requestLoad(): void {
        this.requestCounter += 1
        const resolve = (newResponse: AxiosResponse<E>) => this.loadDidComplete(newResponse, this.requestCounter)
        const reject = (reason: unknown) => this.loadDidFail(reason, this.requestCounter)
        this.load().then(resolve, reject)
    }

    protected clear(): void {
        this.responseRef.value = null
        this.errorRef.value = null
    }

    //
    // Private
    //

    private loadDidComplete(newResponse: AxiosResponse<E>, requestCounter: number) {
        if (this.requestCounter == requestCounter) {
            this.responseRef.value = newResponse
            this.errorRef.value = null
        }
    }

    private loadDidFail(reason: unknown, requestCounter: number) {
        if (this.requestCounter == requestCounter) {
            this.responseRef.value = null
            this.errorRef.value = reason
        }
    }

}
