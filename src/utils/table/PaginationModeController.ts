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

import {TableController} from "@/utils/table/TableController";
import {computed, ComputedRef, ref, Ref} from "vue";
import axios, {AxiosResponse} from "axios";

export class PaginationModeController<E, R> {

    private readonly controller: TableController<E, R>
    private readonly presumedRowCount: number
    private readonly entities: Ref<E[]> = ref([])
    private readonly loadingRef = ref(false)
    private readonly currentIndexRef: Ref<number> = ref(-1)

    //
    // Public
    //

    public constructor(controller: TableController<E, R>, primaryRowCount: number) {
        this.controller = controller
        this.presumedRowCount = primaryRowCount
    }

    public readonly rows: ComputedRef<R[]> = computed(
        () => this.currentEntity.value !== null ? this.controller.fetchRows(this.currentEntity.value) : [])

    public readonly loading: ComputedRef<boolean> = computed(
        () => this.loadingRef.value)

    public readonly currentIndex: ComputedRef<number> = computed(
        () => this.currentIndexRef.value)

    public readonly totalRowCount: ComputedRef<number> = computed(() => {
        let result: number
        if (this.entities.value.length === 0) {
            result = this.presumedRowCount
        } else if (this.lastNextURL.value === null) { // All entities are buffered
            result = this.bufferedRowCount.value
        } else {
            const k = Math.ceil((this.bufferedRowCount.value + 1) / this.presumedRowCount)
            result = k * this.presumedRowCount
        }
        return result
    })

    public fetch(i: number): void {
        this.loadingRef.value = true
        this.makeFetchPromise(i).finally(() => {
            this.loadingRef.value = false
        })
    }

    public clear(): void {
        this.entities.value = []
        this.currentIndexRef.value = -1
    }

    //
    // Private
    //

    private makeFetchPromise(i: number): Promise<void> {
        let result: Promise<void>

        if (i < this.entities.value.length) {
            this.currentIndexRef.value = i
            result = Promise.resolve()
        } else {
            const executor = (resolve: (p: Promise<void>|void) => void) => {
                const cb = (r: AxiosResponse<E>|null) => {
                    if (r !== null) {
                        this.entities.value = this.entities.value.concat([r.data]) // Must replace array for reactivity
                        resolve(this.makeFetchPromise(i))
                    } else {
                        resolve()
                    }
                }

                if (this.entities.value.length >= 1) {
                    if (this.lastNextURL.value !== null) {
                        axios.get(this.lastNextURL.value).then(cb)
                    } else {
                        cb(null)
                    }
                } else {
                    this.controller.loadLatest(null).then(cb)
                }
            }
            result = new Promise<void>(executor)
        }

        return result
    }

    private readonly lastEntity = computed(
        () => this.entities.value.length >= 1 ? this.entities.value[this.entities.value.length - 1] : null)

    private readonly currentEntity = computed(
        () => this.currentIndexRef.value >= 0 ? this.entities.value[this.currentIndexRef.value] : null)

    private readonly lastNextURL = computed(
        () => this.lastEntity.value !== null ? this.controller.nextURL(this.lastEntity.value) : null)

    private readonly bufferedRowCount = computed(() => {
        let result = 0
        for (const e of this.entities.value) {
            result += this.controller.fetchRows(e).length
        }
        return result
    })
}
