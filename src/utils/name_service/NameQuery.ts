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

import {computed, ref, Ref, watch, WatchStopHandle} from "vue";
import {routeManager} from "@/router";
import {AppStorage, NameRecord} from "@/AppStorage";
import {knsResolve} from "@/utils/name_service/KNS";
import {hnsResolve} from "@/utils/name_service/HNS";
import {KNS} from "@kabuto-sh/ns";
import {KNSCache} from "@/utils/cache/KNSCache";
import {HNSCache} from "@/utils/cache/HNSCache";

export class NameQuery {

    public readonly entityId: Ref<string|null>
    private readonly nameRecord = ref<NameRecord|null>(null)
    private watchHandle: WatchStopHandle|null = null

    //
    // Public
    //

    public constructor(entityId: Ref<string|null>) {
        this.entityId = entityId
    }

    public mount(): void {
        this.watchHandle = watch(this.entityId, this.entityIdDidChange, {immediate: true} )
    }

    public unmount(): void {
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
        this.nameRecord.value = null
    }

    public readonly name = computed(() => this.nameRecord.value?.name ?? null)


    //
    // Private
    //

    private readonly entityIdDidChange = async () => {
        const newValue = this.entityId.value
        if (newValue !== null) {
            const r = AppStorage.getNameRecord(newValue, routeManager.currentNetwork.value)
            if (r !== null) {
                this.nameRecord.value = await this.refreshRecord(r)
            } else {
                this.nameRecord.value = null
            }
        } else {
            this.nameRecord.value = null
        }
    }

    //
    // Private
    //

    private readonly FRESH_DURATION = 24 * 3600 * 1000 // one day in milliseconds
    // private readonly FRESH_DURATION = 20 * 1000

    private async refreshRecord(record: NameRecord): Promise<NameRecord|null> {
        let result: NameRecord|null

        const recordTimestamp = record.timestamp
        const nowTimestamp = new Date().getTime()
        const elapsed = Math.abs(nowTimestamp - recordTimestamp)
        if (elapsed > this.FRESH_DURATION) {
            // Record is old => we resolve again and check
            const newEntityId = await this.resolve(record.name)
            if (newEntityId === record.entityId) {
                // record.name always points to record.entityId  :)
                // => refreshes local storage
                AppStorage.setNameRecord(record.entityId, record.name, routeManager.currentNetwork.value)
            } else {
                // record.name no longer points to record.entityId :(
                // => clears local storage
                AppStorage.clearNameRecord(record.entityId, routeManager.currentNetwork.value)
            }
            result = AppStorage.getNameRecord(record.entityId, record.name)
        } else {
            result = record
        }
        return Promise.resolve(result)
    }

    private async resolve(name: string): Promise<string|null> {
        let result: string|null
        try {
            const promises: Promise<string | null>[] = [
                KNSCache.instance.lookup(name, true),
                HNSCache.instance.lookup(name, true),
            ]
            const responses = await Promise.allSettled(promises)
            result = null
            for (const r of responses) {
                if (r.status == "fulfilled" && r.value !== null) {
                    result = r.value
                }
            }
        } catch {
            result = null
        }
        return result
    }

}
