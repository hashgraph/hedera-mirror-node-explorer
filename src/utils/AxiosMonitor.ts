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

import axios, {Axios, AxiosRequestConfig, AxiosResponse} from "axios";

export class AxiosMonitor {

    public static readonly instance = new AxiosMonitor()

    private targetAxios: Axios|null = null
    private requestInterceptor: number | null = null
    private responseInterceptor: number | null = null
    private activeRequestCount = 0
    private successfulRequestCount = 0
    private errorResponses = new Map<string, unknown>()
    private stateChangeCB: (() => void) | null = null

    //
    // Public
    //

    public setTargetAxios(newValue: Axios|null): void {
        if (this.targetAxios !== null) {
            if (this.requestInterceptor !== null) {
                this.targetAxios.interceptors.request.eject(this.requestInterceptor)
                this.requestInterceptor = null
            }
            if (this.responseInterceptor !== null) {
                this.targetAxios.interceptors.response.eject(this.responseInterceptor)
                this.responseInterceptor = null
            }
        }
        this.targetAxios = newValue
        if (this.targetAxios !== null) {

            this.requestInterceptor = this.targetAxios.interceptors.request.use(
                (value: AxiosRequestConfig) => this.requestIntercepted(value))

            this.responseInterceptor = this.targetAxios.interceptors.response.use(
                (response: AxiosResponse) => this.requestFullfilled(response),
                (reason: unknown) => this.requestRejected(reason))
        }
    }

    public getActiveRequestCount(): number {
        return this.activeRequestCount
    }

    public getSuccessfulRequestCount(): number {
        return this.successfulRequestCount
    }

    public getErrorResponses(): Map<string, unknown> {
        return this.errorResponses
    }

    public setStateChangeCB(newValue: (() => void) | null): void {
        if (this.stateChangeCB !== null && newValue !== null) {
            console.trace("Will overwrite AxiosMonitor.stateChangeCB: BUG")
        }
        this.stateChangeCB = newValue
    }

    public clearErrorResponses(): void {
        if (this.errorResponses.size >= 1) {
            console.log("Clearing " + this.errorResponses.size + " error responses")
            this.errorResponses.clear()
            this.successfulRequestCount = 0
            this.stateDidChange()
        }
    }

    //
    // Private
    //

    private requestIntercepted(value: AxiosRequestConfig): Promise<AxiosRequestConfig>|AxiosRequestConfig {
        this.activeRequestCount += 1
        this.stateDidChange()
        return value
    }

    private requestFullfilled(response: AxiosResponse): Promise<AxiosResponse> {
        let result: Promise<AxiosResponse>
        if (this.targetAxios !== null) {
            this.activeRequestCount -= 1
            this.successfulRequestCount += 1
            this.errorResponses.delete(this.targetAxios.getUri(response.config))
            this.stateDidChange()
            result = Promise.resolve(response)
        } else {
            throw "AxiosMonitor.targetAxios should not be null : BUG"
        }
        return result
    }

    private requestRejected(reason: unknown): unknown {
        let result: unknown
        if (this.targetAxios !== null) {
            this.activeRequestCount -= 1
            if (axios.isAxiosError(reason) && reason.request?.status != 404) {
                this.errorResponses.set(this.targetAxios.getUri(reason.config), reason)
            }
            this.stateDidChange()
            result = Promise.reject(reason)
        } else {
            throw "AxiosMonitor.targetAxios should not be null : BUG"
        }
        return result
    }

    private stateDidChange(): void {
        if (this.stateChangeCB) {
            this.stateChangeCB()
        }
    }
}