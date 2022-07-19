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

import {WalletUnexpectedError} from "@/utils/wallet/WalletManager";
import {Executable} from "@hashgraph/sdk";

export abstract class WalletDriver {

    public readonly name: string
    public readonly iconURL: string|null

    //
    // Public
    //

    public async connect(network: string): Promise<void> {
        return Promise.reject<void>(new WalletUnexpectedError("Not yet implemented"))
    }

    public async disconnect(): Promise<void> {
        return Promise.reject<void>(new WalletUnexpectedError("Not yet implemented"))
    }

    public async call<RequestT, ResponseT, OutputT>(request: Executable<RequestT, ResponseT, OutputT>): Promise<OutputT> {
        return Promise.reject<OutputT>(new WalletUnexpectedError("Not yet implemented"))
    }

    public abstract isConnected(): boolean

    public abstract getNetwork(): string|null

    public abstract getAccountId(): string|null

    //
    // Protected
    //

    protected constructor(name: string, iconURL: string|null) {
        this.name = name
        this.iconURL = iconURL
    }

}