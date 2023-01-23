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

import {EntityLoader} from "@/utils/loader/EntityLoader";
import {NetworkStake} from "@/schemas/HederaSchemas";
import axios, {AxiosResponse} from "axios";

export class StakeLoader extends EntityLoader<NetworkStake> {

    //
    // Public
    //

    public constructor() {
        super()
        this.requestLoad()
    }

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<NetworkStake>|null> {
        return axios.get<NetworkStake>("api/v1/network/stake")
    }
}