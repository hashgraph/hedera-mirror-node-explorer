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

import {Executable} from "@hashgraph/sdk";
import {WalletDriverError} from "@/utils/wallet/WalletDriverError";

export abstract class WalletDriver {

    public readonly name: string
    public readonly iconURL: string|null

    //
    // Public (to be subclassed)
    //

    public async connect(network: string): Promise<void> {
        throw this.toBeImplemented("Connection to " + network + " aborted because implementation is missing")
    }

    public async disconnect(): Promise<void> {
        throw this.toBeImplemented("Disconnect aborted because implementation is missing")
    }

    public async call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
        throw this.toBeImplemented("Call of " + request.toString() + " aborted because implementation is missing")
    }

    public abstract isConnected(): boolean

    public abstract getNetwork(): string|null

    public abstract getAccountId(): string|null

    //
    // Public (utilities)
    //

    public extensionNotFound(): WalletDriverError {
        const message = this.name + " extension not found"
        const extra = "Please install " + this.name + " extension."
        return new WalletDriverError(message, extra)
    }

    public connectFailure(extra: string): WalletDriverError {
        const message = "Connection of " + this.name + " failed"
        return new WalletDriverError(message, extra)
    }

    public disconnectFailure(extra: string): WalletDriverError {
        const message = "Disconnection from " + this.name + " failed"
        return new WalletDriverError(message, extra)
    }

    public callFailure(extra: string): WalletDriverError {
        const message = this.name + " failed during operation execution"
        return new WalletDriverError(message, extra)
    }

    public toBeImplemented(methodName: string): WalletDriverError {
        const message = methodName + " must be subclassed"
        return new WalletDriverError(message, "bug")
    }


    //
    // Protected
    //

    protected constructor(name: string, iconURL: string|null) {
        this.name = name
        this.iconURL = iconURL
    }
}
