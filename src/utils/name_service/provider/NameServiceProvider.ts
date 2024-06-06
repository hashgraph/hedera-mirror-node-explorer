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

export abstract class NameServiceProvider {

    //
    // Public
    //

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async resolve(name: string, network: string): Promise<string|null> {
        throw "must be subclassed"
    }


    //
    // Protected
    //

    protected constructor(
        public readonly providerAlias: string,
        public readonly providerDisplayName: string,
        public readonly providerHomeURL: string|null) {}
}
