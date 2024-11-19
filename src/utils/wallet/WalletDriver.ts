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

import {WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {ContractResultDetails} from "@/schemas/MirrorNodeSchemas";

export abstract class WalletDriver {

    public readonly name: string
    public readonly logoURL: string | null
    public readonly iconURL: string | null

    //
    // Public (to be subclassed)
    //

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async connect(network: string): Promise<string[]> {
        throw this.toBeImplemented("connect")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async disconnect(): Promise<void> {
        throw this.toBeImplemented("disconnect")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async associateToken(accountId: string, tokenId: string): Promise<string> {
        throw this.toBeImplemented("associateToken")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async dissociateToken(accountId: string, tokenId: string): Promise<string> {
        throw this.toBeImplemented("dissociateToken")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async callContract(contractId: string, functionData: string, payerId: string): Promise<ContractResultDetails | string> {
        throw this.toBeImplemented("callContract")
    }

    //
    // Public (utilities)
    //

    public extensionNotFound(): WalletDriverError {
        const message = this.name + " extension not found"
        const extra = "Please install and/or activate " + this.name + " extension."
        return new WalletDriverError(message, extra)
    }

    public connectFailure(extra: string): WalletDriverError {
        const message = "Connection to " + this.name + " failed"
        return new WalletDriverError(message, extra)
    }

    public disconnectFailure(extra: string): WalletDriverError {
        const message = "Disconnection from " + this.name + " failed"
        return new WalletDriverError(message, extra)
    }

    public unsupportedOperation(): WalletDriverError {
        const message = this.name + " does not support this operation"
        return new WalletDriverError(message, "This is a bug")
    }

    public callFailure(extra: string): WalletDriverError {
        const message = this.name + " failed during operation execution"
        return new WalletDriverError(message, extra)
    }

    public toBeImplemented(methodName: string): WalletDriverError {
        const message = methodName + " must be subclassed"
        return new WalletDriverError(message, "bug")
    }

    public silentMessage(): string {
        return this.name + " is silent. " +
            "Try to deactivate and re-activate the extension, " +
            "then to restart Chrome, " +
            "and then to re-install the extension."
    }

    //
    // Protected
    //

    protected constructor(name: string, logoURL: string | null, iconURL: string | null) {
        this.name = name
        this.logoURL = logoURL
        this.iconURL = iconURL
    }
}

export const HederaLogo =
    'data:image/svg+xml;utf8,<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40">' +
    '<path d="M20 0a20 20 0 1 0 20 20A20 20 0 0 0 20 0" fill="black"></path>' +
    '<path d="M28.13 28.65h-2.54v-5.4H14.41v5.4h-2.54V11.14h2.54v5.27h11.18v-5.27h2.54zm-13.6-7.42h11.18v-2.79H14.53z" fill="white"></path>' +
    '</svg>'
