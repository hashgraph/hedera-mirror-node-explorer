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

import {ContractResultDetails} from "@/schemas/MirrorNodeSchemas";
import {EIP1193Provider} from "@/utils/wallet/eip1193";

export abstract class WalletClient {

    //
    // Public
    //

    public constructor(
        protected readonly accountId: string,
        protected readonly network: string,
        protected readonly provider: EIP1193Provider) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async associateToken(tokenId: string): Promise<string> {
        throw "to be implemented"
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async dissociateToken(tokenId: string): Promise<string> {
        throw "to be implemented"
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async callContract(contractId: string, functionData: string): Promise<ContractResultDetails | string> {
        throw "to be implemented"
    }


}

export class WalletClientError extends Error {

    public readonly extra: string

    public constructor(message: string, extra: string) {
        super(message)
        this.extra = extra
    }
}

export class WalletClientRejectError extends WalletClientError {

    public constructor() {
        super("User rejected operation ", "")
    }
}

export class WalletClientSetupRequiredError extends WalletClientError {

    public constructor() {
        super("Wallet requires some setup", "")
    }
}
