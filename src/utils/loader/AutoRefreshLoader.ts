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

import {EntityLoader} from "@/utils/loader/EntityLoader";
import {computed, ComputedRef, ref, Ref, watch} from "vue";

export abstract class AutoRefreshLoader<E> extends EntityLoader<E> {

    public static readonly HUGE_COUNT = 9999999

    private readonly refreshPeriod: number
    private readonly maxRefreshCount: number
    private readonly refreshCount = ref(0)
    private timeoutID = -1


    //
    // Public
    //

    public readonly autoRefresh: Ref<boolean> = ref(false)

    public readonly autoStopped: ComputedRef<boolean> = computed(() => this.refreshCount.value >= this.maxRefreshCount)

    public readonly mounted: Ref<boolean> = ref(false)

    //
    // Protected
    //

    protected constructor(refreshPeriod: number, maxRefreshCount = 10) {
        super()
        this.refreshPeriod = refreshPeriod
        this.maxRefreshCount = maxRefreshCount

        watch(this.mounted, () => this.mountedDidChange(), { flush: 'sync' })
        watch(this.autoRefresh, () => this.autoRefreshDidChange(), { flush: 'sync' })
    }

    //
    // EntityLoader
    //

    protected concludeLoad(): void {
        this.refreshCount.value += 1
        if (this.refreshCount.value < this.maxRefreshCount) {
            this.timeoutID = window.setTimeout(() => {
                this.requestLoad()
            }, this.refreshPeriod)
        } else {
            this.autoRefresh.value = false
        }
    }

    public requestLoad(): void {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        super.requestLoad();
    }

    //
    // Private
    //

    private mountedDidChange() {
        if (this.mounted.value) {
            this.autoRefresh.value = true
        } else {
            this.autoRefresh.value = false
            this.clear()
        }
    }

    private autoRefreshDidChange() {
        if (this.autoRefresh.value) {
            this.startRefreshing()
        } else {
            this.stopRefreshing()
        }
    }

    private startRefreshing(): void {
        this.refreshCount.value = 0
        this.requestLoad()
    }

    private stopRefreshing() {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        this.incrementSessionId()
    }
}
