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

import {EntityLoader} from "@/utils/loader/EntityLoader";
import {AxiosResponse} from "axios";

export abstract class EntityBatchLoader<E> extends EntityLoader<E> {

    //
    // Public
    //

    public constructor(recursionLimit: number = 100) {
        super()
        this.recursionLimit = recursionLimit
    }

    //
    // Protected
    //

    protected async loadNext(nextURL: string|null): Promise<AxiosResponse<E>|null> {
        throw "To be subclassed (nextURL=" + nextURL + ")"
    }

    protected abstract nextURL(entity: E): string|null

    protected abstract mergeResponses(last: AxiosResponse<E>, next: AxiosResponse<E>): AxiosResponse<E>

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<E>|null> {
        return this.recurseLoad(null, null, this.recursionLimit)
    }

    //
    // Private
    //

    private readonly recursionLimit: number

    private async recurseLoad(nextURL: string|null, previous: AxiosResponse<E>|null, recursionCount: number): Promise<AxiosResponse<E>|null> {
        let result: Promise<AxiosResponse<E>|null>

        if (recursionCount < 0) {
            console.warn("EntityBatchLoader gave up after too many iterations…")
            result = Promise.resolve(previous)
        } else {
            const executor = (
                resolve: (response: AxiosResponse<E>|null|Promise<AxiosResponse<E>|null>) => void,
                reject: (reason: unknown) => void) => {

                this.loadNext(nextURL).then(
                    (response: AxiosResponse<E>|null) => {
                        if (response !== null) {
                            const next = previous != null ? this.mergeResponses(previous, response) : response
                            const afterNextURL = this.nextURL(response.data)
                            if (afterNextURL !== null) {
                                resolve(this.recurseLoad(afterNextURL, next, recursionCount - 1))
                            } else {
                                resolve(next)
                            }
                        } else {
                            resolve(null)
                        }
                    }, reject)
            }
            result = new Promise<AxiosResponse<E>|null>(executor)
        }

        return result
    }

}
