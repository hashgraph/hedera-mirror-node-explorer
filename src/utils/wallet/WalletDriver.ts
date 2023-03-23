/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

import {AccountAllowanceApproveTransaction, AccountUpdateTransaction} from "@hashgraph/sdk";
import {Signer} from "@hashgraph/sdk/lib/Signer";
import {TransactionID} from "@/utils/TransactionID";
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

    public abstract getSigner(): Signer|null

    //
    // Public (utilities)
    //

    public getAccountId(): string|null {
        return this.getSigner()?.getAccountId()?.toString() ?? null
    }

    public isConnected(): boolean {
        return this.getSigner() !== null
    }


    public async executeTransaction(t: AccountAllowanceApproveTransaction|AccountUpdateTransaction): Promise<string> {
        let result: Promise<string>

        const signer = this.getSigner()
        if (signer !== null) {
            try {
                await t.freezeWithSigner(signer)
                const response = await signer.call(t)
                if (response) {
                    const transactionId = TransactionID.normalize(response.transactionId.toString(), false);
                    result = Promise.resolve(transactionId)
                } else { // When user clicks on "Reject" button HashConnectSigner.call() returns undefined :(
                    result = Promise.reject(this.callFailure(this.name + " wallet did reject operation"))
                }
            } catch(reason) {
                throw this.callFailure(reason.message)
            }
        } else {
            throw this.callFailure("Signer not found (bug)")
        }
        return result
    }

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

    public silentMessage(): string {
        return this.name + " wallet is silent";
    }

    //
    // Protected
    //

    protected constructor(name: string, iconURL: string|null) {
        this.name = name
        this.iconURL = iconURL
    }
}
