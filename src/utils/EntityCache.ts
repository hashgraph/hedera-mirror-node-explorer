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

import {AxiosResponse} from "axios";


export abstract class EntityCache<E> {

    public stateDidChangeCB: (() => void) | null = null
    public responseDidChangeCB: (() => void) | null = null

    private readonly updatePeriod: number|null
    private readonly maxUpdateCount: number|null
    private state = EntityCacheState.Stopped
    private timeoutID = -1
    private updateCount = 0
    private response: AxiosResponse<E> | null = null

    //
    // Public
    //

    protected constructor(updatePeriod: number|null = null, maxUpdateCount: number|null = 10) {
        this.updatePeriod = updatePeriod
        this.maxUpdateCount = maxUpdateCount
    }

    public start(): void {
        if (this.state == EntityCacheState.Stopped) {
            this.changeState(EntityCacheState.Ready)
            this.updateCount = 0
            this.updateCache()
        }
    }

    public stop(): void {
        if (this.state != EntityCacheState.Stopped) {
            if (this.state == EntityCacheState.Ready) {
                // assert this.timeoutID != -1
                clearTimeout(this.timeoutID)
                this.timeoutID = -1
            }
            this.changeState(EntityCacheState.Stopped)
        }
    }

    public isStarted(): boolean {
        return this.state != EntityCacheState.Stopped
    }

    public isAutoStopped(): boolean {
        return this.state == EntityCacheState.Stopped && this.updateCount >= this.computeMaxUpdateCount()
    }

    public getState(): EntityCacheState {
        return this.state
    }

    public getResponse(): AxiosResponse<E> | null {
        return this.response
    }

    public getEntity(): E | null {
        let result: E | null
        const newResponse = this.getResponse()
        if (newResponse != null && newResponse.status == 200) {
            result = newResponse.data ?? null
        } else {
            result = null
        }
        return result
    }

    public clear(): void {
        const isStarted = this.isStarted()
        if (isStarted) {
            this.stop()
        }
        this.changeResponse(null)
        this.updateCount = 0
        if (isStarted) {
            this.start()
        }
    }

    //
    // Protected
    //

    protected abstract load(): Promise<AxiosResponse<E>>;

    //
    // Private
    //

    private updateCache(): void {
        const resolve = (newResponse: AxiosResponse<E>) => this.loadDidComplete(newResponse)
        const reject = (/*reason: unknown*/) => this.loadDidComplete(null)
        this.load().then(resolve, reject)
    }

    private loadDidComplete(newResponse: AxiosResponse<E> | null) {
        if (this.state != EntityCacheState.Stopped) {
            if (newResponse != null) {
                this.changeResponse(newResponse)
                this.updateCount += 1
            } // else we keep last response and update count unchanged
            if (this.updatePeriod != null && this.updateCount < this.computeMaxUpdateCount()) {
                this.timeoutID = setTimeout(() => this.updateCache(), this.updatePeriod)
                this.changeState(EntityCacheState.Ready)
            } else {
                this.timeoutID = -1
                this.changeState(EntityCacheState.Stopped)
            }
        }
    }

    private changeState(newState: EntityCacheState): void {
        this.state = newState
        if (this.stateDidChangeCB != null) {
            this.stateDidChangeCB()
        }
    }

    private changeResponse(newResponse: AxiosResponse<E>|null): void {
        this.response = newResponse
        if (this.responseDidChangeCB != null) {
            this.responseDidChangeCB()
        }
    }

    private computeMaxUpdateCount(): number {
        return this.maxUpdateCount != null ? this.maxUpdateCount : 999999999
    }
}

export enum EntityCacheState { Stopped = "STOPPED", Ready = "READY", Updating = "UPDATING"}
