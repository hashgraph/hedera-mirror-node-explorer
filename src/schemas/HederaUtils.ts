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

import {
    KeyType,
    Transfer,
    TokenInfo,
    AccountInfo,
    Transaction,
    NetworkNode, NftTransfer,
    HTS_PRECOMPILE_CONTRACT_ID,
    TokenRelationship, TokenTransfer,
    REDIRECT_FOR_TOKEN_FUNCTION_SIGHASH,
} from "@/schemas/HederaSchemas";
import {ethers} from "ethers";
import {EntityID} from "@/utils/EntityID";
import * as hashgraph from "@hashgraph/proto";

export function makeEthAddressForAccount(account: AccountInfo): string | null {
    if (account.evm_address) return account.evm_address;
    if (account.key?.key && account.key?._type == KeyType.ECDSA_SECP256K1) {
        // Generates Ethereum address from public key
        return ethers.computeAddress("0x" + account.key.key)
    }
    if (account.account) {
        // Generates Ethereum address from account id
        const entityID = EntityID.parse(account.account, true)
        return entityID != null ? ('0x' + entityID.toAddress()) : null
    }
    return null;
}

export function makeEthAddressForToken(token: TokenInfo): string | null {
    let result: string | null
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
        result = description.slice(0, 9) + " "
    } else if (description.slice(0, 10).toLowerCase() === "hosted for") {
        result = description.slice(0, 10) + " "
    } else {
        result = ""
    }
    return result
}

export function makeNodeOwnerDescription(node: NetworkNode, short = false): string {
    const description = makeNodeDescription(node)
    let result: string
    if (description?.slice(0, 9).toLowerCase() === "hosted by") {
        result = description.slice(10)
    } else if (description.slice(0, 10).toLowerCase() === "hosted for") {
        result = description.slice(11)
    } else {
        result = description
    }
    return short ? result.split('|')[0].trimEnd() : result
}

export function makeDefaultNodeDescription(nodeId: number | null): string {
    return nodeId ? "Node " + nodeId : "?"
}

export function makeOperatorDescription(accountId: string, nodes: NetworkNode[], isFee = false): string | null {
    let result: string | null
    if (accountId === "0.0.98") {
        result = "Hedera fee collection account"
    } else if (accountId === "0.0.800") {
        result = isFee ? "Staking reward account fee" : "Staking reward account"
    } else {
        const node = lookupNodeByAccountId(accountId, nodes)
        result = node !== null
            ? isFee ? `Node fee (${makeNodeOwnerDescription(node, true)})` : makeNodeDescription(node)
            : null
    }
    return result
}

export function isFeeTransfer(t: Transfer, nodes: NetworkNode[]): boolean {
    return t.account !== null
        && t.amount > 0
        && makeOperatorDescription(t.account, nodes) !== null
}

const errorStringSelector = '0x08c379a0'
const panicUint256Selector = '0x4e487b71'

export function decodeSolidityErrorMessage(message: string | null): string | null {
    let result: string | null

    // https://blog.soliditylang.org/2020/12/16/solidity-v0.8.0-release-announcement/
    // Section "Revert on assertion failures and similar conditions instead of using the invalid opcode"

    try {
        if (message === null) {
            result = null
        } else if (message.startsWith(errorStringSelector)) {
            const reason = ethers.AbiCoder.defaultAbiCoder().decode(
                ['string'],
                ethers.dataSlice(message ?? "", 4)
            )
            result = reason.toString() ?? null
        } else if (message.startsWith(panicUint256Selector)) {
            const code = ethers.AbiCoder.defaultAbiCoder().decode(
                ['uint256'],
                ethers.dataSlice(message ?? "", 4)
            )
            result = 'Panic(0x' + parseInt(code.toString()).toString(16) + ')'
        } else if (!message.startsWith("0x")) {
            result = message
        } else {
            result = null;
        }
    } catch (reason) {
        result = null
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

export function makeRewardRate(rewardInTinyBar: number): number {
    // rely on mirror node to provide the actual reward rate (tiny bars rewarded per hbar staked)
    // here we simply convert to hbars
    return (rewardInTinyBar ?? 0) / 100000000
}

export function makeAnnualizedRate(rewardInTinyBar: number): string {
    const formatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 3
    })
    return formatter.format(makeRewardRate(rewardInTinyBar) * 365);
}

export function isCouncilNode(node: NetworkNode): boolean {
    // TEMPORARY IMPLEMENTATION
    // This will need to rely on a new specific flag to be provided by REST API
    const accountNum = EntityID.parse(node.node_account_id ?? "")?.num
    return accountNum ? accountNum < 1000 : true
}

export function lookupNodeByAccountId(accountId: string, nodes: NetworkNode[]): NetworkNode | null {
    let result: NetworkNode | null = null
    for (const n of nodes) {
        if (n.node_account_id == accountId) {
            result = n
            break
        }
    }
    return result
}

export function lookupTokenRelationship(relations: TokenRelationship[], targetTokenId: string): TokenRelationship | null {
    let result: TokenRelationship | null = null
    for (const r of relations) {
        if (r.token_id == targetTokenId) {
            result = r
            break
        }
    }
    return result
}

export function labelForResponseCode(responseCode: bigint): string | null {
    const responseCodeEnum = hashgraph.proto.ResponseCodeEnum;
    const result = Object.keys(responseCodeEnum).find((key: any) => BigInt(responseCodeEnum[key]) === responseCode);
    return result || null;
}

export function lookupTokenTransfer(transaction: Transaction, tokenId: string): TokenTransfer | null {
    let result: TokenTransfer | null = null
    for (const t of transaction.token_transfers) {
        if (t.token_id == tokenId) {
            result = t
            break
        }
    }
    return result
}

export function lookupNFTTransfer(transaction: Transaction, tokenId: string): NftTransfer | null {
    let result: NftTransfer | null = null
    for (const t of transaction.nft_transfers) {
        if (t.token_id == tokenId) {
            result = t
            break
        }
    }
    return result
}

export function decodeRedirectForTokenInput(inputArgs: string): ethers.Result {
    const tokenAddress = `0x${inputArgs.slice(2, 42)}`
    const encodedFunctionSelector = `0x${inputArgs.slice(42)}`
    return new ethers.Result(tokenAddress, encodedFunctionSelector)
}

export function resolveFunctionFragmentForHTSProxyContract(functionFragment: ethers.FunctionFragment, inputArgs: string): ethers.FunctionFragment {
    let encodedFunction4BytesSignature = ""

    try {
        const inputResult = ethers.AbiCoder.defaultAbiCoder().decode(functionFragment.inputs, inputArgs)
        encodedFunction4BytesSignature = inputResult[1].slice(0, 10)
    } catch (failure) {
        const f = failure as ethers.EthersError
        if (f.code === "BUFFER_OVERRUN" || f.code === "INVALID_ARGUMENT") {
            const inputResult = decodeRedirectForTokenInput(inputArgs)
            encodedFunction4BytesSignature = inputResult[1].slice(0, 10)
        }
    }

    // @notice this is the list of supported method which is collected based on HIP-218 https://hips.hedera.com/hip/hip-218
    const ABI_FOR_SUPPORTED_METHODS = [
        "function name() public view returns (string name)",
        "function symbol() public view returns (string symbol)",
        "function decimals() public view returns (uint8 decimals)",
        "function totalSupply() external view returns (uint256 totalSupply)",
        "function setApprovalForAll(address _operator, bool _approved) external",
        "function ownerOf(uint256 _tokenId) external view returns (address ownerOf)",
        "function tokenURI(uint256 _tokenId) external view returns (string tokenURI)",
        "function balanceOf(address _owner) external view returns (uint256 balanceOf)",
        "function balanceOf(address account) external view returns (uint256 balanceOf)",
        "function approve(address spender, uint256 amount) external returns (bool approve)",
        "function tokenByIndex(uint256 _index) external view returns (uint256 tokenByIndex)",
        "function getApproved(uint256 _tokenId) external view returns (address getApproved)",
        "function transferFrom(address _from, address _to, uint256 _tokenId) external payable",
        "function transfer(address recipient, uint256 amount) external returns (bool transfer)",
        "function safeTransferFrom(address _from, address _to, uint256 _tokenId) external payable",
        "function allowance(address owner, address spender) external view returns (uint256 allowance)",
        "function safeTransferFrom(address _from, address _to, uint256 _tokenId, bytes data) external payable",
        "function isApprovedForAll(address _owner, address _operator) external view returns (bool isApprovedForAll)",
        "function transferFrom(address sender, address recipient, uint256 amount) external returns (bool transferFrom)",
        "function tokenOfOwnerByIndex(address _owner, uint256 _index) external view returns (uint256 tokenOfOwnerByIndex)",
      ];
      
    const iface = new ethers.Interface(ABI_FOR_SUPPORTED_METHODS)
    return ethers.FunctionFragment.from({...functionFragment, outputs: iface.getFunction(encodedFunction4BytesSignature)?.outputs})
}

export function isRedirectForTokenTx(contractId: string|null, functionHash: string|null): boolean {
    return contractId === HTS_PRECOMPILE_CONTRACT_ID &&
        functionHash === REDIRECT_FOR_TOKEN_FUNCTION_SIGHASH
}
