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


import {WalletClient} from "@/utils/wallet/client/WalletClient";

export abstract class WalletSession {


    //
    // Public
    //

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async makeClient(accountId: string): Promise<WalletClient|null> {
        throw "to be implemented"
    }

    public async revoke(): Promise<void> {
        throw "to be implemented"
    }

    public abstract getWalletDN(): string

    public abstract getWalletUUID(): string|null

    //
    // Protected
    //

    protected constructor(public readonly name: string,
                          public readonly iconURL: string|null,
                          public readonly usableAccountIds: string[],
                          public readonly otherAccountIds: string[]) {}


}
