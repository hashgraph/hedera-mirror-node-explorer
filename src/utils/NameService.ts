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

import {AccountInfo, AccountBalanceTransactions} from "@/schemas/HederaSchemas";
import {KNS, NameNotFoundError} from "@kabuto-sh/ns";
import axios from "axios";

let _nameService: KNS | null = null;

export function nameServiceSetNetwork(name: string): void {
  if (name === "mainnet" || name === "testnet") {
    _nameService = new KNS({ network: name as "mainnet" | "testnet" });
  } else {
    _nameService = null;
  }
}

export async function nameServiceResolve(domain: string): Promise<AccountInfo | null> {
  if (_nameService == null) return null;

  try {
    const accountId = await _nameService.getHederaAddress(domain);
    const response = await axios.get<AccountBalanceTransactions>("api/v1/accounts/" + accountId);

    return response.data;
  } catch (error) {
    if (error instanceof NameNotFoundError) {
      // domain not found
      return null;
    }

    throw error;
  }
}
