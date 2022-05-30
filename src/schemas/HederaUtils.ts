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
import {base32ToAlias, byteToHex, hexToByte} from "@/utils/B64Utils";
import {keccak256} from "js-sha3";

export function makeEthAddressForAccount(account: AccountInfo): string|null {
    let result: string|null

    if (account.alias) {
        // Decodes BASE32 encoding of account.alias
        const buffer = base32ToAlias(account.alias)
        result = byteToHex(new Uint8Array(buffer))
    } else if (account.key?.key && account.key?._type == KeyType.ECDSA_SECP256K1) {
        // Generates Eth. address from key
        const buffer = hexToByte(account.key.key)
        const hash = buffer !== null ? hexToByte(keccak256(buffer)) : null
        if (hash !== null) {
            result = byteToHex(hash.slice(-20))
        } else {
            result = null
        }
    } else if (account.account) {
        // Generates Eth. address from account id
        const entityID = EntityID.parse(account.account, true)
        result = entityID != null ? entityID.toAddress() : null
    } else {
        result = null
    }

    return result
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
