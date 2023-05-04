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

import {AccountInfo, KeyType, NetworkNode, TokenInfo} from "@/schemas/HederaSchemas";
import {EntityID} from "@/utils/EntityID";
import {ethers} from "ethers";

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

export function makeNodeDescription(node: NetworkNode): string {
    let result: string
    if (node.description) {
        result = node.description
    } else {
        result = makeDefaultNodeDescription(node.node_id ?? null)
    }
    return result
}

export function makeNodeDescriptionPrefix(node: NetworkNode): string {
    const description = makeNodeDescription(node)
    let result: string
    if (description.slice(0, 9).toLowerCase() === "hosted by") {
        result = description.slice(0,9) + " "
    } else if (description.slice(0, 10).toLowerCase() === "hosted for") {
        result = description.slice(0,10) + " "
    } else {
        result = ""
    }
    return result
}

export function makeNodeOwnerDescription(node: NetworkNode): string {
    const description = makeNodeDescription(node)
    let result: string
    if (description?.slice(0, 9).toLowerCase() === "hosted by") {
        result = description.slice(10)
    } else if (description.slice(0, 10).toLowerCase() === "hosted for") {
        result = description.slice(11)
    } else {
        result = description
    }
    return result
}

export function makeDefaultNodeDescription(nodeId: number | null): string {
    return "Node " + nodeId ?? "?"
}

export function makeOperatorDescription(accountId: string, nodes: NetworkNode[]): string | null {
    let result: string|null
    if (accountId === "0.0.98") {
        result = "Hedera fee collection account"
    } else {
        const node = lookupNodeByAccountId(accountId, nodes)
        result = node !== null ? makeNodeDescription(node) : null
    }
    return result
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

export function makeUnclampedStake(node: NetworkNode): number {
    return (node.stake_rewarded ?? 0) + (node.stake_not_rewarded ?? 0)
}

export function makeStakePercentage(node: NetworkNode, stakeTotal: number): string {
    const formatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 1
    })
    return formatter.format(node.stake ? node.stake / stakeTotal : 0)
}

export function makeRewardRate(node: NetworkNode): number {
    // rely on mirror node to provide the actual reward rate (tiny bars rewarded per hbar staked)
    // here we simply convert to hbars
    return (node.reward_rate_start ?? 0) / 100000000
}

export function makeAnnualizedRate(node: NetworkNode): string {
    const formatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 2
    })
    return formatter.format(makeRewardRate(node) * 365);
}

export function isCouncilNode(node: NetworkNode): boolean {
    // TEMPORARY IMPLEMENTATION
    // This will need to rely on a new specific flag to be provided by REST API
    const accountNum = EntityID.parse(node.node_account_id ?? "")?.num
    return accountNum ? accountNum < 1000 : true
}

export function lookupNodeByAccountId(accountId: string, nodes: NetworkNode[]): NetworkNode|null {
    let result: NetworkNode|null = null
    for (const n of nodes) {
        if (n.node_account_id == accountId) {
            result = n
            break
        }
    }
    return result
}
