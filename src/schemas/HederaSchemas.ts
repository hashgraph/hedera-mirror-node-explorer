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

// ---------------------------------------------------------------------------------------------------------------------
//                                                      Account
// ---------------------------------------------------------------------------------------------------------------------

import {EntityID} from "@/utils/EntityID";

export interface AccountsResponse {
    accounts: [AccountInfo] | undefined
    links: Links | undefined
}

export interface AccountInfo {
    account: string | null | undefined // Network entity ID in the format of shard.realm.num
    auto_renew_period: number | null | undefined
    balance: Balance | null | undefined
    deleted: boolean
    expiry_timestamp: string | null | undefined
    key : Key | null | undefined
    max_automatic_token_associations: number | undefined
    memo: string | undefined
    receiver_sig_required: boolean
    alias: string | null | undefined  // RFC4648 no-padding base32 encoded account alias
}

export interface AccountBalanceTransactions extends AccountInfo {
    transactions: Array<Transaction> | undefined
    links: Links | undefined
}

export interface Balance {
    timestamp: string | null
    balance: number | null
    tokens: [TokenBalance]
}

export interface TokenBalance {
    token_id: string | null // Network entity ID in the format of shard.realm.num
    balance: number
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
    transactions: Array<Transaction> | undefined
}

export interface Transaction {

    consensus_timestamp: string | undefined
    entity_id: string |null | undefined             // Network entity ID in the format of shard.realm.num
    bytes: string | null | undefined
    transaction_hash: string | undefined
    valid_start_timestamp: string | undefined
    charged_tx_fee: number | undefined
    memo_base64: string | undefined                 // To be checked
    nonce: number | undefined
    result: string | undefined
    name: TransactionType | undefined
    nft_transfers: NftTransfer[] | undefined
    max_fee: string | undefined
    valid_duration_seconds: string | undefined
    node: string | null |  undefined                // Network entity ID in the format of shard.realm.num
    scheduled: boolean | undefined
    transaction_id: string | undefined
    transfers: Transfer[] | undefined
    token_transfers: TokenTransfer[] | undefined
    assessed_custom_fees: CustomFee[] | undefined
    parent_consensus_timestamp: string | null | undefined

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
}

export interface TokenTransfer extends Transfer {
    token_id: string | null                         // Network entity ID in the format of shard.realm.num
}

export interface CustomFee {
    amount: number | undefined
    collector_account_id: string | undefined        // Network entity ID in the format of shard.realm.num
    effective_payer_account_ids: [string] | undefined
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
    tokens: [Token] | undefined
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
    fixed_fees: [FixedFee] | undefined                    // Network entity ID in the format of shard.realm.num
    fractional_fees: [FractionalFee] | undefined
    royalty_fees: [RoyaltyFee] | null | undefined             // Network entity ID in the format of shard.realm.num
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
    balances: [TokenDistribution] | undefined
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
    nfts: [Nft] | undefined
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
    consensus_timestamp: string,
    topic_id: string | null,
    message: string,
    running_hash: string,
    running_hash_version: number,
    sequence_number: number
}


// ---------------------------------------------------------------------------------------------------------------------
//                                                      Contract
// ---------------------------------------------------------------------------------------------------------------------

export interface ContractsResponse {
    contracts: [Contract] | undefined
    links: Links | undefined
}

export interface Contract {

    admin_key: Key | null | undefined
    auto_renew_period: number | null | undefined
    contract_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    created_timestamp: string | null | undefined
    deleted: boolean | undefined
    evm_address: string | undefined
    expiration_timestamp: string | null | undefined
    file_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    memo: string | undefined
    obtainer_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    proxy_account_id: string | null | undefined   // Network entity ID in the format of shard.realm.num
    solidity_address: string | undefined
    timestamp: TimestampRange | undefined   // timestamp range the entity is valid for

}

export interface ContractResponse extends Contract {
    bytecode: string | null | undefined
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
    call_result: string | null | undefined
    contract_id: string | null | undefined
    created_contract_ids: Array<string> | null | undefined
    error_message: string | null | undefined
    from: string | undefined
    function_parameters: string | undefined
    gas_limit: number | undefined
    gas_used: number | undefined
    timestamp: string | undefined
    to: string | undefined
}

// ---------------------------------------------------------------------------------------------------------------------
//                                                      Node
// ---------------------------------------------------------------------------------------------------------------------

export interface NetworkNodesResponse {
    nodes: [NetworkNode] | undefined
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
    service_endpoints: [ServiceEndPoint] | undefined
    timestamp: TimestampRange | undefined
}

export interface ServiceEndPoint {
    ip_address_v4: string
    port: number
}
// ---------------------------------------------------------------------------------------------------------------------
//                                                      Network
// ---------------------------------------------------------------------------------------------------------------------

export interface NetworkSupplyResponse {
    released_supply:	string | undefined  // The network's released supply of hbars in tinybars
    timestamp:	string | undefined  // The consensus timestamp at which the released supply was valid
    total_supply:	string | undefined  // The network's total supply of hbars in tinybars
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
