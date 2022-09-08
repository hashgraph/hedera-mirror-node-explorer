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
import {AxiosResponse} from "axios";
import {computed, ComputedRef, Ref, ref, watch, WatchOptions} from "vue";

export class RefreshModeController<E, R> {

    private readonly controller: TableController<E, R>
    private readonly presumedRowCount: number
    private readonly updatePeriod: number
    private readonly maxUpdateCount: number
    private readonly entityRef: Ref<E|null> = ref(null)
    private readonly loadingRef = ref(false)

    private updateCount = 0
    private sessionId = 0
    private timeoutID = -1

    // RefreshModeController must watch with flush='sync'
    // to make sure that watchers are invoked during onBeforeUnmount()
    protected static WATCH_OPTIONS: WatchOptions = { flush: 'sync' }

    //
    // Public
    //

    public constructor(controller: TableController<E, R>, presumedRowCount: number, updatePeriod: number, maxUpdateCount: number) {
        this.controller = controller
        this.presumedRowCount = presumedRowCount
        this.updatePeriod = updatePeriod
        this.maxUpdateCount = maxUpdateCount

        watch(this.started, () => this.startedDidChange(), RefreshModeController.WATCH_OPTIONS)
    }

    public readonly started: Ref<boolean> = ref(false)

    public readonly autoStopped = computed(() => {
        return !this.started.value && this.updateCount >= this.maxUpdateCount
    })

    public readonly entity = computed(() => this.entityRef.value)

    public readonly rows: ComputedRef<R[]> = computed(
        () => this.entityRef.value !== null ? this.controller.fetchRows(this.entityRef.value) : [])

    public readonly loading: ComputedRef<boolean> = computed(
        () => this.loadingRef.value)

    public readonly totalRowCount: ComputedRef<number> = computed(() => {
        let result: number
        if (this.entityRef.value === null) {
            result = this.presumedRowCount
        } else if (this.lastNextURL.value === null) { // All entities are buffered
            result = this.rows.value.length
        } else {
            const k = Math.ceil((this.rows.value.length + 1) / this.presumedRowCount)
            result = k * this.presumedRowCount
        }
        return result
    })

    public clear(): void {
        this.entityRef.value = null
        if (this.started.value) {
            this.stop()
            this.start()
        }
    }

    //
    // Private
    //

    private readonly lastNextURL = computed(
        () => this.entityRef.value !== null ? this.controller.nextURL(this.entityRef.value) : null)

    private startedDidChange(): void {
        if (this.started.value) {
            this.start()
        } else {
            this.stop()
        }
    }

    private start() {
        this.updateCount = 0
        this.updateEntity()
    }

    private stop() {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        this.sessionId += 1
    }

    private updateEntity(): void {
        const capturedSessionId = this.sessionId
        const resolve = (newResponse: AxiosResponse<E>|null) => this.loadDidComplete(newResponse, capturedSessionId)
        const reject = (/*reason: unknown*/) => this.loadDidComplete(null, capturedSessionId)
        this.controller.load().then(resolve, reject)
    }

    private loadDidComplete(newResponse: AxiosResponse<E> | null, sessionId: number) {
        if (this.sessionId == sessionId) {
            this.timeoutID = -1
            if (newResponse != null) {
                this.entityRef.value = newResponse.data
                this.updateCount += 1
            } // else we keep this.entity, this.totalRowCount and this.updateCount unchanged
            if (this.updateCount < this.maxUpdateCount) {
                this.timeoutID = window.setTimeout(() => {
                    this.updateEntity()
                }, this.updatePeriod)
            } else {
                this.started.value = false
            }
        }
    }


}