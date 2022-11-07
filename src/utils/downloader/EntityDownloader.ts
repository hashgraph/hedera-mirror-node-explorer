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

import {Ref, ref} from "vue";
import {AxiosResponse} from "axios";

export abstract class EntityDownloader<E, R> {

    private readonly maxEntityCount: number
    private entities: E[] = []

    private readonly downloadedCountRef = ref(0)
    private readonly lastDownloadedEntityRef: Ref<E|null> = ref(null)
    private readonly drainedRef = ref(false)
    private readonly stateRef: Ref<DownloaderState> = ref(DownloaderState.Fresh)
    private readonly failureReasonRef: Ref<unknown|null> = ref(null)

    private abortRequested = false

    //
    // Public
    //

    public async run(): Promise<void> {
        if (this.stateRef.value != DownloaderState.Running) {
            this.stateRef.value = DownloaderState.Running
            this.failureReasonRef.value = null
            try {
                await this.download()
            } catch(error) {
                this.failureReasonRef.value = error
            } finally {
                this.stateRef.value = DownloaderState.Completed
            }
        } else {
            console.warn("aborting because downloader is already running")
        }
        return Promise.resolve()
    }

    public getEntities(): E[] {
        return this.entities
    }

    public requestAbort(): void {
        this.abortRequested = true
    }


    //
    // Protected (to be subclassed)
    //

    protected constructor(maxEntityCount: number) {
        this.maxEntityCount = maxEntityCount
    }

    protected async loadNext(nextURL: string|null): Promise<AxiosResponse<R>> {
        throw "To be subclassed (nextURL=" + nextURL + ")"
    }

    protected abstract entitiesFromResponse(response: R): E[]

    protected abstract nextURL(response: R): string|null

    //
    // Private
    //

    private async download(): Promise<void> {
        this.entities = []
        this.downloadedCountRef.value = 0
        this.lastDownloadedEntityRef.value = null

        this.drainedRef.value = false
        let nextURL = null
        while (this.entities.length < this.maxEntityCount && !this.drainedRef.value) {
            const newResponse
                = await this.loadNext(nextURL)
            const newEntities
                = this.entitiesFromResponse(newResponse.data)
            this.entities
                = this.entities.concat(newEntities)
            this.downloadedCountRef.value
                = this.entities.length
            this.lastDownloadedEntityRef.value
                = this.entities.length >= 1 ? this.entities[this.entities.length - 1] : null

            nextURL = this.nextURL(newResponse.data)
            this.drainedRef.value = nextURL == null
        }

        return Promise.resolve()
    }

}


export enum DownloaderState {
    Fresh, Running, Completed
}
