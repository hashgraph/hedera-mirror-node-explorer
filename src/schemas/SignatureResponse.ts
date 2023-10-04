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

//
// https://www.4byte.directory
// https://www.4byte.directory/api/v1/signatures/
//

/*

REQUEST:
https://www.4byte.directory/api/v1/signatures/?hex_signature=0xb01ef608

{
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
        {
            "id": 842814,
            "created_at": "2022-07-03T20:24:54.756716Z",
            "text_signature": "buyV2(address,uint256,uint256,address)",
            "hex_signature": "0xb01ef608",
            "bytes_signature": "°\u001eö\b"
        }
    ]
}
 */

export interface SignatureResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: SignatureInfo[];
}

export interface SignatureInfo {
    id: number;
    created_at: string;
    text_signature: string;
    hex_signature: string;
    bytes_signature: string;
}
