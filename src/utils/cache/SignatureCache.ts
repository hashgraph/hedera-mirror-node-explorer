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

import axios from "axios";
import {EntityCache} from "@/utils/cache/base/EntityCache";

export class SignatureCache extends EntityCache<string, SignatureResponse | null> {

    public static readonly instance = new SignatureCache()


    //
    // Cache
    //

    protected async load(function4bytes: string): Promise<SignatureResponse | null> {
        let result: SignatureResponse | null
        try {
            // https://www.4byte.directory/docs/
            const url = "https://www.4byte.directory/api/v1/signatures/?format=json&hex_signature=" + function4bytes
            const response = await axios.get<SignatureResponse>(url)
            result = response.data
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status == 404) {
                result = null
            } else {
                throw error
            }
        }
        return Promise.resolve(result)
    }

}

/*
{
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 849268,
            "created_at": "2023-01-11T04:20:07.888724Z",
            "text_signature": "redirectForToken(address,bytes)",
            "hex_signature": "0x618dc65e",
            "bytes_signature": "aÂÃ†^"
        }
    ]
}
 */

export interface SignatureResponse {
    count: number,
    next: string | null,
    previous: string | null,
    results: SignatureRecord[]
}

export interface SignatureRecord {
    id: number,
    created_at: string,
    text_signature: string,
    hex_signature: string,
    bytes_signature: string
}