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

// ---------------------------------------------------------------------------------------------------------------------
//                                                      Account
// ---------------------------------------------------------------------------------------------------------------------

import {EntityID} from "@/utils/EntityID";
import {makeDefaultNodeDescription} from "@/schemas/HederaUtils";

export interface AccountsResponse {
    accounts: AccountInfo[] | undefined
    links: Links | undefined
}

export interface AccountInfo {
    account: string | null              // Network entity ID in the format of shard.realm.num
    auto_renew_period: number | null
    balance: Balance | null
    created_timestamp: string | null
    deleted: boolean | null
    expiry_timestamp: string | null
    key : Key | null
    max_automatic_token_associations: number | null
    memo: string | null
    receiver_sig_required: boolean | null
    alias: string | null                // RFC4648 no-padding base32 encoded account alias
    ethereum_nonce: number | null
    evm_address: string | null          // A network entity encoded as an EVM address in hex.
    decline_reward: boolean | null      // Whether the account declines receiving a staking reward
    staked_account_id: string | null    // The account to which this account is staking
    staked_node_id: number | null       // The id of the node to which this account is staking
    stake_period_start : string | null  // The staking period during which either the staking settings for this account
                                        // changed (such as starting staking or changing stakedNode) or the most recent
                                        // reward was earned, whichever is later. If this account is not currently
                                        // staked to a node, then the value is null
    pending_reward: number | undefined  // The pending reward in tinybars the account will receive in the next
                                        // reward payout. Note the value is updated at the end of each staking period
                                        // and there may be delay to reflect the changes in the past staking period.
}

export interface AccountBalanceTransactions extends AccountInfo {
    transactions: Array<Transaction> | undefined
    links: Links | undefined
}

export interface Balance {
    timestamp: string | null
    balance: number | null
    tokens: TokenBalance[]
}

export interface TokenBalance {
    token_id: string | null // Network entity ID in the format of shard.realm.num
    balance: number
}

export interface TokenRelationshipResponse {
    tokens: Array<TokenRelationship>,
    links: Links
}

export interface TokenRelationship {
    automatic_association: boolean,
    balance: number,
    created_timestamp: string,
    freeze_status: string, // [ NOT_APPLICABLE, FROZEN, UNFROZEN ]
    kyc_status: string,    // [ NOT_APPLICABLE, GRANTED, REVOKED ]
    token_id: string | null,
}

export interface CryptoAllowancesResponse {
    allowances: Array<CryptoAllowance>,
    links: Links
}

export interface CryptoAllowance {
    amount_granted: number,     // The granted amount of the spender's allowance in tinybars.
    owner: string | null,       // Network entity ID in the format of shard.realm.num
    spender: string | null,     // Network entity ID in the format of shard.realm.num
    timestamp: TimestampRange
}

export interface TokenAllowancesResponse {
    allowances: Array<TokenAllowance>,
    links: Links
}

export interface TokenAllowance extends CryptoAllowance {
    token_id: string | null,    // Network entity ID in the format of shard.realm.num
}

// ---------------------------------------------------------------------------------------------------------------------
//                                                   Balance
// ---------------------------------------------------------------------------------------------------------------------

export interface BalancesResponse {
    timestamp: string | null | undefined
    balances: Array<AccountBalance> | undefined
    links: Links | undefined
}

export interface AccountBalance {
    account: string | null // Network entity ID in the format of shard.realm.num
    balance: number
    tokens: Array<TokenBalance>
}

// ---------------------------------------------------------------------------------------------------------------------
//                                                   Transaction
// ---------------------------------------------------------------------------------------------------------------------

export interface TransactionResponse {
    transactions: Array<Transaction> | undefined
    links: Links | undefined
}

export interface TransactionByIdResponse {
    transactions: Array<TransactionDetail> | undefined
}
export interface Transaction {

    bytes: string | null | undefined
    charged_tx_fee: number | undefined
    consensus_timestamp: string | undefined
    entity_id: string |null | undefined             // Network entity ID in the format of shard.realm.num
    max_fee: string | undefined
    memo_base64: string | undefined                 // To be checked
    name: TransactionType | undefined
    node: string | null |  undefined                // Network entity ID in the format of shard.realm.num
    nonce: number | undefined
    parent_consensus_timestamp: string | null | undefined
    result: string | undefined
    scheduled: boolean | undefined
    // staking_reward_transfers: ...
    token_transfers: TokenTransfer[] | undefined
    transaction_hash: string | undefined
    transaction_id: string | undefined
    transfers: Transfer[] | undefined
    valid_duration_seconds: string | undefined
    valid_start_timestamp: string | undefined

}

export interface TransactionDetail extends Transaction {

    nft_transfers: NftTransfer[] | undefined
    assessed_custom_fees: CustomFee[] | undefined

}


export interface NftTransfer {
    receiver_account_id: string | null | undefined  // Network entity ID in the format of shard.realm.num
    sender_account_id: string | null | undefined    // Network entity ID in the format of shard.realm.num
    serial_number: number
    token_id: string | null                         // Network entity ID in the format of shard.realm.num}
}

export function compareNftTransfer(t1: NftTransfer, t2: NftTransfer): number {

    let result = compareString(t1.sender_account_id, t2.sender_account_id)

    if (result == 0) {
        result = compareString(t1.token_id, t2.token_id)
    }

    if (result == 0) {
        result = compareString(t1.receiver_account_id, t2.receiver_account_id)
    }

    if (result == 0) {
        result = compareNumber(t1.serial_number, t2.serial_number)
    }

    return result
}

export interface Transfer {
    account: string | null                          // Network entity ID in the format of shard.realm.num
    amount: number
    is_approval: boolean | undefined
}

export interface TokenTransfer extends Transfer {
    token_id: string | null                         // Network entity ID in the format of shard.realm.num
}

export interface CustomFee {
    amount: number | undefined
    collector_account_id: string | undefined        // Network entity ID in the format of shard.realm.num
    effective_payer_account_ids: string[] | undefined
    token_id: string | null | undefined             // Network entity ID in the format of shard.realm.num
}

export enum TransactionType {
    CONSENSUSCREATETOPIC = "CONSENSUSCREATETOPIC",
    CONSENSUSDELETETOPIC = "CONSENSUSDELETETOPIC",
    CONSENSUSSUBMITMESSAGE = "CONSENSUSSUBMITMESSAGE",
    CONSENSUSUPDATETOPIC = "CONSENSUSUPDATETOPIC",
    CONTRACTCALL = "CONTRACTCALL",
    CONTRACTCREATEINSTANCE = "CONTRACTCREATEINSTANCE",
    CONTRACTDELETEINSTANCE = "CONTRACTDELETEINSTANCE",
    CONTRACTUPDATEINSTANCE = "CONTRACTUPDATEINSTANCE",
    CRYPTOADDLIVEHASH = "CRYPTOADDLIVEHASH",
    CRYPTOCREATEACCOUNT = "CRYPTOCREATEACCOUNT",
    CRYPTODELETE = "CRYPTODELETE",
    CRYPTODELETELIVEHASH = "CRYPTODELETELIVEHASH",
    CRYPTOTRANSFER = "CRYPTOTRANSFER",
    CRYPTOUPDATEACCOUNT = "CRYPTOUPDATEACCOUNT",
    CRYPTOAPPROVEALLOWANCE = "CRYPTOAPPROVEALLOWANCE",
    CRYPTODELETEALLOWANCE = "CRYPTODELETEALLOWANCE",
    FILEAPPEND = "FILEAPPEND",
    FILECREATE = "FILECREATE",
    FILEDELETE = "FILEDELETE",
    FILEUPDATE = "FILEUPDATE",
    FREEZE = "FREEZE",
    SCHEDULECREATE = "SCHEDULECREATE",
    SCHEDULEDELETE = "SCHEDULEDELETE",
    SCHEDULESIGN = "SCHEDULESIGN",
    SYSTEMDELETE = "SYSTEMDELETE",
    SYSTEMUNDELETE = "SYSTEMUNDELETE",
    TOKENASSOCIATE = "TOKENASSOCIATE",
    TOKENBURN = "TOKENBURN",
    TOKENCREATION = "TOKENCREATION",
    TOKENDELETION = "TOKENDELETION",
    TOKENDISSOCIATE = "TOKENDISSOCIATE",
    TOKENFEESCHEDULEUPDATE = "TOKENFEESCHEDULEUPDATE",
    TOKENFREEZE = "TOKENFREEZE",
    TOKENGRANTKYC = "TOKENGRANTKYC",
    TOKENMINT = "TOKENMINT",
    TOKENPAUSE = "TOKENPAUSE",
    TOKENREVOKEKYC = "TOKENREVOKEKYC",
    TOKENUNFREEZE = "TOKENUNFREEZE",
    TOKENUNPAUSE = "TOKENUNPAUSE",
    TOKENUPDATE = "TOKENUPDATE",
    TOKENWIPE = "TOKENWIPE",
    UNCHECKEDSUBMIT = "UNCHECKEDSUBMIT",
    ETHEREUMTRANSACTION = "ETHEREUMTRANSACTION",
    NODESTAKEUPDATE = "NODESTAKEUPDATE",
    UTILPRNG = "UTILPRNG"
}

export enum TransactionResult {
    SUCCESS = "success",
    FAILURE = "fail"
}

export function compareTransferByAccount(t1: Transfer, t2: Transfer): number {
    let result: number
    const account1 = t1.account
    const account2 = t2.account
    if (account1 != null && account2 != null) {
        const accountId1 = EntityID.parse(account1)
        const accountId2 = EntityID.parse(account2)
        if (accountId1 != null && accountId2 != null) {
            result = accountId1.compareAccountID(accountId2)
        } else {
            result = account1.localeCompare(account2);
        }
    } else if (account1 != null){
        result = +1
    } else if (account2 != null) {
        result = -1
    } else {
        result = 0
    }
    return result
}

export function compareTokenTransferByTokenId(t1: TokenTransfer, t2: TokenTransfer): number {
    return compareString(t1.token_id, t2.token_id)
}


// ---------------------------------------------------------------------------------------------------------------------
//                                                      Token
// ---------------------------------------------------------------------------------------------------------------------

export interface TokensResponse {
    tokens: Token[] | undefined
    links: Links | undefined
}

export interface Token {
    token_id: string | null
    symbol: string
    admin_key: Key | null
    type: string
}

export interface TokenInfo {

    admin_key: Key | null | undefined
    auto_renew_account: string | null | undefined   // Network entity ID in the format of shard.realm.num
    auto_renew_period: string | number | null | undefined
    created_timestamp: string | undefined
    decimals: string | undefined
    deleted: boolean | null | undefined
    expiry_timestamp: string | null | undefined
    fee_schedule_key: Key | null | undefined
    freeze_default: boolean | undefined
    freeze_key: Key |null | undefined
    initial_supply: string | undefined
    kyc_key: Key | null | undefined
    max_supply: string | undefined
    modified_timestamp: string | undefined
    name: string | undefined
    memo: string | undefined
    pause_key: Key | null | undefined
    pause_status: string | undefined // NOT_APPLICABLE, PAUSED, UNPAUSED
    supply_key: Key | null | undefined
    supply_type: string | undefined // FINITE, INFINITE
    symbol: string | undefined
    token_id: string | null | undefined     // Network entity ID in the format of shard.realm.num
    total_supply: string | undefined
    treasury_account_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    type: string // FUNGIBLE_COMMON, NON_FUNGIBLE_UNIQUE
    wipe_key: Key | null | undefined
    custom_fees: CustomFees | undefined
}

export interface CustomFees {
    created_timestamp: string | undefined
    fixed_fees: FixedFee[] | undefined                    // Network entity ID in the format of shard.realm.num
    fractional_fees: FractionalFee[] | undefined
    royalty_fees: RoyaltyFee[] | null | undefined             // Network entity ID in the format of shard.realm.num
}

export interface FixedFee {
    amount: number | undefined
    collector_account_id: string | undefined            // Network entity ID in the format of shard.realm.num
    denominating_token_id: string | undefined           // Network entity ID in the format of shard.realm.num
}

export interface FractionalFee {
    amount: FractionAmount | undefined
    collector_account_id: string | undefined            // Network entity ID in the format of shard.realm.num
    denominating_token_id: string | undefined           // Network entity ID in the format of shard.realm.num
    maximum: number | undefined
    mininum: number | undefined
    net_of_transfers: boolean | undefined
}

export interface RoyaltyFee {
    amount: FractionAmount | undefined
    collector_account_id: string | undefined            // Network entity ID in the format of shard.realm.num
    fallback_fee: FallbackFee | undefined              // Network entity ID in the format of shard.realm.num
}

export interface FallbackFee {
    amount: number | undefined
    denominating_token_id: string | undefined           // Network entity ID in the format of shard.realm.num
}

export interface FractionAmount {
    numerator: number | undefined
    denominator: number | undefined
}

export interface TokenBalancesResponse {
    timestamp: string | null | undefined
    balances: TokenDistribution[] | undefined
    links: Links | undefined
}

export interface TokenDistribution {
    account: string | null // Network entity ID in the format of shard.realm.num
    balance: number
}

// ---------------------------------------------------------------------------------------------------------------------
//                                               Nft
// ---------------------------------------------------------------------------------------------------------------------

export interface Nfts {
    nfts: Nft[] | undefined
    links: Links | undefined
}

export interface Nft {
    account_id: string | null | undefined // Network entity ID in the format of shard.realm.num
    created_timestamp: string | null | undefined
    deleted: boolean
    metadata: string | undefined
    modified_timestamp: string | null | undefined
    serial_number: number | undefined
    token_id: string | null | undefined // Network entity ID in the format of shard.realm.num
}

// ---------------------------------------------------------------------------------------------------------------------
//                                               TopicMessagesResponse
// ---------------------------------------------------------------------------------------------------------------------

export interface TopicMessagesResponse {
    messages: Array<TopicMessage> | undefined
    links: Links | undefined
}

export interface TopicMessage {
    chunk_info: ChunkInfo | null,
    consensus_timestamp: string,
    topic_id: string | null,
    message: string,
    running_hash: string,
    running_hash_version: number,
    sequence_number: number
}

export interface ChunkInfo {
    initial_transaction_id: TransactionId,
    number: number,
    total: number
}

export interface TransactionId {
    account_id: string | null,
    nonce: number | null,
    scheduled: boolean | null,
    transaction_valid_start: string
}

// ---------------------------------------------------------------------------------------------------------------------
//                                                      Contract
// ---------------------------------------------------------------------------------------------------------------------

export interface ContractsResponse {
    contracts: Contract[] | undefined
    links: Links | undefined
}

export interface Contract {

    admin_key: Key | null | undefined
    auto_renew_account: string | null | undefined   // Network entity ID in the format of shard.realm.num
    auto_renew_period: number | null | undefined
    contract_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    created_timestamp: string | null | undefined
    deleted: boolean | undefined
    evm_address: string | undefined
    expiration_timestamp: string | null | undefined
    file_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    max_automatic_token_associations: number | null | undefined
    memo: string | undefined
    obtainer_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    permanent_removal: boolean | null | undefined
    proxy_account_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    timestamp: TimestampRange | undefined   // timestamp range the entity is valid for
}

export interface ContractResponse extends Contract {
    bytecode: string | null | undefined
    runtime_bytecode: string | null | undefined
}

export interface TimestampRange {
    from: string | undefined    // The inclusive from timestamp in seconds
    to: string | null | undefined   // The exclusive to timestamp in seconds
}

export interface ContractResultsResponse {
    results: Array<ContractResult> | undefined
    links: Links | undefined
}

export interface ContractResult {
    amount: number | null | undefined
    bloom: string | null | undefined
    call_result: string | null | undefined
    contract_id: string | null | undefined
    created_contract_ids: Array<string> | null | undefined
    error_message: string | null | undefined
    from: string | undefined
    function_parameters: string | undefined
    gas_limit: number | undefined
    gas_used: number | null | undefined
    hash: string | null | undefined
    result: string | undefined
    status: string | undefined
    timestamp: string | undefined
    to: string | undefined
}

export interface ContractResultDetails extends ContractResult {
    access_list: string | null | undefined
    block_gas_used: number | null | undefined // integer
    block_hash: string | null | undefined
    block_number: number | null | undefined // integer
    chain_id: string | null | undefined
    gas_price: string | null | undefined
    logs: ContractResultLog[] | undefined
    max_fee_per_gas: string | null | undefined
    max_priority_fee_per_gas: string | null | undefined
    nonce: number | null | undefined // integer
    r: string | null | undefined
    s: string | null | undefined
    state_changes: ContractResultStateChange[] | undefined
    transaction_index: number | null | undefined // integer
    type: number | null | undefined // The type of the wrapped ethereum transaction, 0 (Pre-Eip1559) or 2 (Post-Eip1559)
    v: number | null | undefined
}

export interface ContractResultLog {
    address: string | undefined
    bloom: string | null | undefined
    contract_id: string | null | undefined
    data: string | null | undefined
    index: number | undefined // integer
    topics: string[] | undefined
}

export interface ContractResultStateChange {
    address: string | undefined
    contract_id: string | null | undefined
    slot: string | undefined
    value_read: string | undefined
    value_written: string | null | undefined
}

export interface ContractActionsResponse {
    actions: Array<ContractAction> | undefined
    links: Links | undefined
}

export interface ContractAction {
    call_depth: number | undefined,
    call_operation_type: string | undefined,
    call_type: string | undefined,
    caller: string | null | undefined, // Network entity ID in the format of shard.realm.num
    caller_type: string | undefined,   // enum EntityType
    from: string | undefined,
    gas: number | undefined,
    gas_used: number | undefined,
    index: number | undefined,
    input: string | null | undefined,
    recipient: string | null | undefined,
    recipient_type: string | null | undefined, // enum EntityType
    result_data: string | null | undefined,
    result_data_type: string | undefined,      // enum ResultDataType
    timestamp: string | undefined,
    to: string | null | undefined,
    value: number | undefined
}

export enum EntityType {
    ACCOUNT = "ACCOUNT",
    CONTRACT = "CONTRACT"
}

export enum ResultDataType {
    OUTPUT = "OUTPUT",
    REVERT_REASON = "REVERT_REASON",
    ERROR = "ERROR"
}

// ---------------------------------------------------------------------------------------------------------------------
//                                                      Node
// ---------------------------------------------------------------------------------------------------------------------

export interface NetworkNodesResponse {
    nodes: NetworkNode[] | undefined
    links: Links | undefined
}

export interface NetworkNode {
    description: string | null | undefined
    file_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    memo: string | undefined
    node_id: number | undefined
    node_account_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    node_cert_hash: string | null | undefined
    public_key: string | null | undefined   // hex encoded X509 RSA public key used to sign stream files
    service_endpoints: ServiceEndPoint[] | undefined
    timestamp: TimestampRange | undefined
    max_stake: number | null // The maximum stake (rewarded or not rewarded) this node can have as consensus weight
    min_stake: number | null // The minimum stake (rewarded or not rewarded) this node must reach before having non-zero consensus weight
    stake: number | null // The node consensus weight at the beginning of the staking period
    stake_not_rewarded: number | null // The sum (balance + stakedToMe) for all accounts staked to this node with declineReward=true at the beginning of the staking period
    stake_rewarded: number | null // The sum (balance + staked) for all accounts staked to the node that are not declining rewards at the beginning of the staking period
    staking_period: TimestampRange | null
    reward_rate_start: number | null
}

export interface ServiceEndPoint {
    ip_address_v4: string
    port: number
}

export function makeShortNodeDescription(description: string): string {
    const separator = description.indexOf('|') ?? -1
    return (separator !== -1) ? (description.slice(0, separator) ?? null) : description
}

export function makeNodeSelectorDescription(node: NetworkNode): string {
    const percentFormatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 1
    })
    const unclampedStakeAmount = (node.stake_rewarded ?? 0) + (node.stake_not_rewarded ?? 0)
    const percentMin = node.min_stake ? unclampedStakeAmount / node.min_stake : 0
    const percentMax = node.max_stake ? (node.stake_rewarded ?? 0) / node.max_stake : 0

    let result = node.node_id
        + ' - '
        + (node.description ?? makeDefaultNodeDescription(node.node_id ?? null))

    if (percentMin !== 0 && percentMin < 1) {
        result += " - Not Rewarding (total stake is " + percentFormatter.format(percentMin) + " of min)"
    } else if (percentMax !== 0) {
        result += " - Rewarding (staked for reward is " + percentFormatter.format(percentMax) + " of max)"
    }
    return result
}

// ---------------------------------------------------------------------------------------------------------------------
//                                                      Network
// ---------------------------------------------------------------------------------------------------------------------

export interface NetworkExchangeRateSetResponse{
    current_rate: ExchangeRate,
    next_rate: ExchangeRate,
    timestamp:	string
}

export interface ExchangeRate {
    cent_equivalent: number,
    expiration_time: number,
    hbar_equivalent: number
}

export interface NetworkSupplyResponse {
    released_supply:	string | undefined  // The network's released supply of hbars in tinybars
    timestamp:	string | undefined  // The consensus timestamp at which the released supply was valid
    total_supply:	string | undefined  // The network's total supply of hbars in tinybars
}

export interface  NetworkStake {
    max_staking_reward_rate_per_hbar: number,
    node_reward_fee_fraction: number,
    stake_total: number,
    staking_period: TimestampRange,
    staking_period_duration: number,
    staking_periods_stored: number,
    staking_reward_fee_fraction: number,
    staking_reward_rate: number,
    staking_start_threshold: number
}

// ---------------------------------------------------------------------------------------------------------------------
//                                                      Block
// ---------------------------------------------------------------------------------------------------------------------

export interface BlocksResponse {
    blocks: Array<Block> | undefined
    links: Links | undefined
}

export interface Block {
    count: number | undefined // integer - minimum 0
    gas_used: number | null | undefined // integer - minimum 0
    hapi_version: string | undefined
    hash: string | undefined
    logs_bloom: string | null | undefined // pattern ^0x[0-9a-fA-F]{512}$
    name: string | undefined
    number: number | undefined
    previous_hash: string | undefined
    size: number | null | undefined // integer
    timestamp: TimestampRange | undefined
}

export interface TimestampRange {
    from: string | undefined // pattern: ^\d{1,10}(\.\d{1,9})?$
    to: string | null | undefined // pattern: ^\d{1,10}(\.\d{1,9})?$
}

// ---------------------------------------------------------------------------------------------------------------------
//                                               StakingRewardTransfer
// ---------------------------------------------------------------------------------------------------------------------

export interface StakingRewardsResponse {
    rewards: Array<StakingReward> | undefined
    links: Links | undefined
}

export interface StakingReward {
    account_id: string|null
    amount: number
    timestamp: string
}

// ---------------------------------------------------------------------------------------------------------------------
//                                                      Misc
// ---------------------------------------------------------------------------------------------------------------------

export interface Key {
    _type: KeyType | undefined
    key: string | undefined
}

export enum KeyType {
    ECDSA_SECP256K1 = "ECDSA_SECP256K1",
    ED25519 = "ED25519",
    ProtobufEncoded = "ProtobufEncoded"
}

export interface Links {
    next: string | null | undefined
}

export const infiniteDuration = 31556888202959784

// ---------------------------------------------------------------------------------------------------------------------
//                                                      Private
// ---------------------------------------------------------------------------------------------------------------------

function compareString(s1: string|null|undefined, s2: string|null|undefined): number {
    let result: number

    if (s1 && s2) {
        result = s1.localeCompare(s2)
    } else if (s1) {
        // s2 is null or undefined
        result = +1
    } else if (s2) {
        // s1 is null or undefined
        result = -1
    } else {
        result = 0
    }
    return result
}

function compareNumber(n1: number|null|undefined, n2: number|null|undefined): number {
    let result: number

    if (n1 && n2) {
        if (n1 < n2) {
            result = -1
        } else if (n1 > n2) {
            result = +1
        } else {
            result = 0
        }
    } else if (n1) {
        // n2 is null or undefined
        result = +1
    } else if (n2) {
        // n1 is null or undefined
        result = -1
    } else {
        result = 0
    }
    return result
}
