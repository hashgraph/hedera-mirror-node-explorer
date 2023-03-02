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

import {AccountInfo, KeyType, TokenInfo} from "@/schemas/HederaSchemas";
import {EntityID} from "@/utils/EntityID";
import {ethers} from "ethers";
import {NodeRegistry} from "@/components/node/NodeRegistry";
import {ref} from "vue";

export function makeEthAddressForAccount(account: AccountInfo): string|null {
    if (account.evm_address) return account.evm_address;
    if (account.key?.key && account.key?._type == KeyType.ECDSA_SECP256K1) {
        // Generates Ethereum address from public key
        return ethers.utils.computeAddress("0x" + account.key.key)
    }
    if (account.account) {
        // Generates Ethereum address from account id
        const entityID = EntityID.parse(account.account, true)
        return entityID != null ? ('0x' + entityID.toAddress()) : null
    }
    return null;
}

export function makeEthAddressForToken(token: TokenInfo): string|null {
    let result: string|null
    if (token.token_id) {
        const entityID = EntityID.parse(token.token_id, true)
        result = entityID != null ? ('0x' + entityID.toAddress()) : null
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

export function makeDefaultNodeDescription(nodeId: number | null): string {
    return "Node " + nodeId ?? "?"
}

export function makeOperatorDescription(accountId: string): string | null {
    return accountId === '0.0.98'
        ? "Hedera fee collection account"
        : NodeRegistry.getDescription(ref(null), ref(accountId))
}

const errorStringSelector = '0x08c379a0'
const panicUint256Selector = '0x4e487b71'

export function isSolidityError(message: string | null): boolean {
    return (message !== null && message.startsWith(errorStringSelector))
}

export function isSolidityPanic(message: string | null): boolean {
    return (message !== null && message.startsWith(panicUint256Selector))
}

export function decodeSolidityErrorMessage(message: string | null): string | null {

    let result = message

    if (isSolidityError(result)) {
        const reason = ethers.utils.defaultAbiCoder.decode(
            ['string'],
            ethers.utils.hexDataSlice(result ?? "", 4)
        )
        result = reason.toString() ?? result
    } else if (isSolidityPanic(result)) {
        const code = ethers.utils.defaultAbiCoder.decode(
            ['uint256'],
            ethers.utils.hexDataSlice(result ?? "", 4)
        )
        result = 'Panic(0x' + parseInt(code.toString()).toString(16) + ')'  ?? result
    }

    return result
}

