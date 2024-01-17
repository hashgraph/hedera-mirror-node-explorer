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

import {computed, ComputedRef, Ref, ref, watch} from "vue";
import {AxiosResponse} from "axios";
import {CSVEncoder} from "@/utils/CSVEncoder";

export abstract class EntityDownloader<E, R> {

    public readonly startDate: Ref<Date|null>
    public readonly endDate: Ref<Date|null>
    public readonly maxEntityCount: number
    private entities: E[] = []

    private readonly downloadedCountRef = ref(0)
    private readonly firstDownloadedEntityRef: Ref<E|null> = ref(null)
    private readonly lastDownloadedEntityRef: Ref<E|null> = ref(null)
    private readonly drainedRef = ref(false)
    private readonly stateRef = ref(DownloaderState.Fresh)
    private readonly failureReasonRef: Ref<unknown|null> = ref(null)

    private runPromise: Promise<void>|null = null
    private abortRequested = false
    private readonly dateFormat = EntityDownloader.makeDateFormat()
    private readonly now = new Date()

    //
    // Public
    //

    public async run(): Promise<void> {
        await this.abort()

        this.failureReasonRef.value = null
        this.stateRef.value = DownloaderState.Running
        this.runPromise = this.download()
        try {
            await this.runPromise
            this.stateRef.value = this.abortRequested ? DownloaderState.Aborted : DownloaderState.Completed
        } catch(error) {
            this.failureReasonRef.value = error
            this.stateRef.value = DownloaderState.Failure
        } finally {
            this.runPromise = null          // (1)
            this.abortRequested = false     // (2)
        }

        return Promise.resolve()
    }

    public async abort(): Promise<void> {
        if (this.runPromise !== null) {
            this.abortRequested = true
            await this.runPromise
            // assert(this.runPromise == null) because of (1)
            // assert(this.abortRequested == false) because of (2)
        }
        return Promise.resolve()
    }

    public getEntities(): E[] {
        return this.entities
    }

    public readonly state: ComputedRef<DownloaderState>
        = computed(() => this.stateRef.value)
    public readonly downloadedCount: ComputedRef<number>
        = computed(() => this.downloadedCountRef.value)
    public readonly firstDownloadedEntity: ComputedRef<E|null>
        = computed(() => this.firstDownloadedEntityRef.value)
    public readonly lastDownloadedEntity: ComputedRef<E|null>
        = computed(() => this.lastDownloadedEntityRef.value)
    public readonly drained: ComputedRef<boolean>
        = computed(() => this.drainedRef.value)
    public readonly failureReason: ComputedRef<unknown|null>
        = computed(() => this.failureReasonRef.value)

    public progress: ComputedRef<number> = computed(() => {
        let result: number

        if (this.state.value == DownloaderState.Completed) {
            result = 1.0
        } else if (this.startDate.value !== null) {
            const startTime = this.startDate.value.getTime()
            const endTime = this.endDate.value != null ? this.endDate.value.getTime() : this.now.getTime()

            const firstEntity = this.firstDownloadedEntity.value
            const firstTimestamp = firstEntity ? this.entityTimestamp(firstEntity) : null
            const firstTime = firstTimestamp !== null ? timestampToMillis(firstTimestamp) : endTime
            const lastEntity = this.lastDownloadedEntity.value
            const lastTimestamp = lastEntity ? this.entityTimestamp(lastEntity) : null
            const lastTime = lastTimestamp !== null ? timestampToMillis(lastTimestamp) : endTime

            /*

                           |        remaining      |        already         | nothing |
                           |       to download     |       downloaded       |   here  |
                   --------+-----------------------+------------------------+---------+--------> now
                        startTime               lastTime                firstTime   endTime
             */

            const progress = firstTime !== null && lastTime !== null
                ? (firstTime - lastTime) / (firstTime - startTime) : 0
            const result1 = Math.round(progress * 1000) / 1000
            const result2 = this.entities.length / this.maxEntityCount
            result = Math.max(result1, result2)
        } else {
            result = 0
        }

        return result
    })

    public getOutputName(): string {
        let result: string
        if (this.startDate.value !== null) {
            result = this.makeOutputPrefix()
                + " " + this.dateFormat.format(this.startDate.value)
                + " to " + this.dateFormat.format(this.endDate.value ?? this.now)
                + ".csv"
        } else {
            result = ""
        }
        return result
    }


    public csvBlob: ComputedRef<Blob|null> = computed(() => {
        let result: Blob|null
        if (this.state.value == DownloaderState.Completed && this.downloadedCount.value >= 1) {
            const encoder = this.makeCSVEncoder(this.dateFormat)
            result = new Blob([encoder.encode()], { type: "text/csv" })
        } else {
            result = null
        }
        return result
    })

    //
    // Protected (to be subclassed)
    //

    protected constructor(startDate: Ref<Date|null>,
                          endDate: Ref<Date|null>,
                          maxEntityCount: number) {
        this.startDate = startDate
        this.endDate = endDate
        this.maxEntityCount = maxEntityCount
        watch([this.startDate, this.endDate], () => {
            this.abort().then()
        })
    }

    protected async loadNext(nextURL: string|null): Promise<AxiosResponse<R>> {
        throw "To be subclassed (nextURL=" + nextURL + ")"
    }

    protected abstract fetchEntities(response: R): E[]

    protected abstract nextURL(response: R): string|null

    protected abstract entityTimestamp(entity: E): string|null

    protected abstract makeCSVEncoder(dateFormat: Intl.DateTimeFormat): CSVEncoder<E>

    protected abstract makeOutputPrefix(): string

    protected filter(entities: E[]): E[] {
        return entities
    }


    protected checkStartDate(): Date {
        let result: Date
        if (this.startDate.value !== null) {
            result = this.startDate.value
        } else {
            throw new Error("this.startDate is null")
        }
        return result
    }


    //
    // Private
    //

    private async download(): Promise<void> {
        this.entities = []
        this.downloadedCountRef.value = 0
        this.lastDownloadedEntityRef.value = null

        this.drainedRef.value = false
        let nextURL = null
        while (this.entities.length < this.maxEntityCount && !this.drainedRef.value && !this.abortRequested) {
            const newResponse
                = await this.loadNext(nextURL)
            const newEntities
                = this.filter(this.fetchEntities(newResponse.data))
            this.entities
                = this.entities.concat(newEntities)
            this.downloadedCountRef.value
                = this.entities.length
            this.firstDownloadedEntityRef.value
                = this.entities.length >= 1 ? this.entities[0] : null
            this.lastDownloadedEntityRef.value
                = this.entities.length >= 1 ? this.entities[this.entities.length - 1] : null

            nextURL = this.nextURL(newResponse.data)
            this.drainedRef.value = nextURL == null
        }

        return Promise.resolve()
    }

    private static makeDateFormat(): Intl.DateTimeFormat {
        const locale = "en-US"
        const dateOptions: Intl.DateTimeFormatOptions = {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }
        return new Intl.DateTimeFormat(locale, dateOptions)
    }

}


export enum DownloaderState {
    Fresh, Running, Completed, Failure, Aborted
}

export function timestampToMillis(value: string): number|null {
    const seconds = Number.parseFloat(value);
    return isNaN(seconds) ? null : seconds * 1000
}

export function dateToTimestamp(date: Date): string {
    const seconds = date.getTime() / 1000.0
    return seconds.toFixed(9)
}
