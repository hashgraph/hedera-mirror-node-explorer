// noinspection DuplicatedCode

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


import {SessionTypes} from "@walletconnect/types";
import {ExplorerSignClient} from "@/utils/wallet/ExplorerSignClient";
import {ContractResultDetails} from "@/schemas/HederaSchemas";

export abstract class WalletAdaptor {

    //
    // Public
    //

    public constructor(
        protected readonly accountId: string,
        protected readonly session: SessionTypes.Struct,
        protected readonly signClient: ExplorerSignClient,
        protected readonly network: string) {}

    public getWalletName(): string {
        return this.session.peer.metadata.name
    }

    //
    // Public (to be subclassed)
    //

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async associateToken(tokenId: string): Promise<string> {
        throw this.toBeImplemented("associateToken")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async dissociateToken(tokenId: string): Promise<string> {
        throw this.toBeImplemented("dissociateToken")
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async callContract(contractId: string, functionData: string): Promise<ContractResultDetails | string> {
        throw this.toBeImplemented("callContract")
    }

    //
    // Protected (tools for subclasses)
    //

    protected toBeImplemented(methodName: string): WalletAdaptorError {
        const message = methodName + " must be subclassed"
        return new WalletAdaptorError(message, "bug")
    }

    protected unsupportedOperation(): WalletAdaptorError {
        const message = this.getWalletName() + " does not support this operation"
        return new WalletAdaptorError(message, "This is a bug")
    }

    protected callFailure(reason: unknown): WalletAdaptorError {
        const extra = reason instanceof Error ? reason.message : JSON.stringify(reason)
        const message = this.getWalletName() + " failed during operation execution"
        return new WalletAdaptorError(message, extra)
    }
}



export class WalletAdaptorError extends Error {

    public readonly extra: string

    public constructor(message: string, extra: string) {
        super(message)
        this.extra = extra
    }
}

export class WalletAdaptorCancelError extends WalletAdaptorError {

    public constructor() {
        super("User cancelled operation ", "")
    }
}

