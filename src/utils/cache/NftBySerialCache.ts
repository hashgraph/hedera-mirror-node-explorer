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

import { Nft } from "@/schemas/HederaSchemas";
import axios from "axios";
import { SerialCache } from "./base/SerialCache";
import { Ref, ref } from "vue";
import { Lookup } from "./base/EntityCache";

export class NftBySerialCache extends SerialCache<string, Nft | null> {
    public static readonly instance = new NftBySerialCache();

    //
    // Cache
    //

    protected async load(tokenIdSerial: string): Promise<Nft | null> {
        let result: Promise<Nft | null>;
        const tokenIdSerialArray = tokenIdSerial.split("---");
        try {
            const response = await axios.get<Nft>(
                `api/v1/tokens/${tokenIdSerialArray[0]}/nfts/${tokenIdSerialArray[1]}`,
            );
            console.log(response);
            result = Promise.resolve(response.data);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = Promise.resolve(null);
            } else {
                throw error;
            }
        }
        return result;
    }

    public makeLookup(
        key: Ref<string | null>,
        key2?: Ref<string | null>,
    ): Lookup<string, Nft | null> {
        return new Lookup<string, Nft | null>(
            ref(key.value! + "---" + key2?.value),
            this,
        );
    }
}
