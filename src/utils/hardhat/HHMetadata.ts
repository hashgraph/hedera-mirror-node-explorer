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


/*
    {
      "id": "759551f1ce3dc2f5642a2c18c92437f1",
      "_format": "hh-sol-build-info-1",
      "solcVersion": "0.8.19",
      "solcLongVersion": "0.8.19+commit.7dd6d404",
      "input": { ... },
      "output": { ... },
    }
 */

import {SolcInput} from "@/utils/solc/SolcInput";
import {SolcOutput} from "@/utils/solc/SolcOutput";

export interface HHMetadata {

    id: string
    _format: unknown[]
    solcVersion: string
    solcLongVersion: string
    input: SolcInput
    output: SolcOutput

}
