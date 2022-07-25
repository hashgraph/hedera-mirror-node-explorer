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

import {AccountInfo, KeyType, TokenInfo} from "@/schemas/HederaSchemas";
import {EntityID} from "@/utils/EntityID";
import { hethers } from "hethers";

export function makeEthAddressForAccount(account: AccountInfo): string|null {
    if (account.evm_address) return account.evm_address;
    if (account.key?.key && account.key?._type == KeyType.ECDSA_SECP256K1) {
        // Generates Ethereum address from public key
        return hethers.utils.computeAddress("0x" + account.key.key)
    }
    if (account.account) {
        // Generates Ethereum address from account id
        const entityID = EntityID.parse(account.account, true)
        return entityID != null ? entityID.toAddress() : null
    }
    return null;
}

export function makeEthAddressForToken(token: TokenInfo): string|null {
    let result: string|null
    if (token.token_id) {
        const entityID = EntityID.parse(token.token_id, true)
        result = entityID != null ? entityID.toAddress() : null
    } else {
        result = null
    }
    return result
}

export function makeTokenSymbol(token: TokenInfo | null, maxLength: number): string {
    const symbol = token?.symbol
    const name = token?.name

    const symbolUsable = symbol && symbol.search("://") == -1

    const candidate1 = symbol && symbolUsable && symbol.length <= maxLength ? symbol : null
    const candidate2 = name && name.length <= maxLength ? name : null
    const candidate3 = symbol && symbolUsable ? symbol.slice(0, maxLength) : null
    const candidate4 = name ? name.slice(0, maxLength) : null

    return candidate1 ?? candidate2 ?? candidate3 ?? candidate4 ?? token?.token_id ?? "?"
}

export function isValidEthereumAddress(hexString: string): boolean {
    return hethers.utils.isAddress(hexString)
}
