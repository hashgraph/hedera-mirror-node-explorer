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

import {Transaction, TransactionType} from "@/schemas/HederaSchemas";

export function makeSummaryLabel(row: Transaction): string {
    let result: string
    let netAmount: number

    switch (row.name) {
        case TransactionType.CRYPTOTRANSFER:
            netAmount = computeNetAmount(row);
            result = makeTransferLabel(row, netAmount)
            break
        case TransactionType.CONSENSUSCREATETOPIC:
        case TransactionType.CONSENSUSDELETETOPIC:
        case TransactionType.CONSENSUSUPDATETOPIC:
            result = row.entity_id ? "Topic ID: " + row.entity_id : ""
            break
        case TransactionType.CONSENSUSSUBMITMESSAGE:
            result = formatMemo(row.memo_base64 ?? "")
            break
        case TransactionType.CRYPTOCREATEACCOUNT:
        case TransactionType.CRYPTODELETE:
        case TransactionType.CRYPTOUPDATEACCOUNT:
        case TransactionType.TOKENASSOCIATE:
        case TransactionType.TOKENDISSOCIATE:
            result = row.entity_id ? "Account ID: " + row.entity_id : ""
            break
        case TransactionType.TOKENBURN:
        case TransactionType.TOKENMINT:
        case TransactionType.TOKENCREATION:
        case TransactionType.TOKENDELETION:
        case TransactionType.TOKENFEESCHEDULEUPDATE:
        case TransactionType.TOKENFREEZE:
        case TransactionType.TOKENUNFREEZE:
        case TransactionType.TOKENPAUSE:
        case TransactionType.TOKENUNPAUSE:
        case TransactionType.TOKENUPDATE:
        case TransactionType.TOKENGRANTKYC:
            result = row.entity_id ? "Token ID: " + row.entity_id : ""
            break
        case TransactionType.CONTRACTCREATEINSTANCE:
        case TransactionType.CONTRACTDELETEINSTANCE:
        case TransactionType.CONTRACTUPDATEINSTANCE:
        case TransactionType.CONTRACTCALL:
            result = row.entity_id ? "Contract ID: " + row.entity_id : ""
            break
        case TransactionType.FILECREATE:
        case TransactionType.FILEUPDATE:
        case TransactionType.FILEDELETE:
        case TransactionType.FILEAPPEND:
            result = row.entity_id ? "File ID: " + row.entity_id : ""
            break
        case TransactionType.SCHEDULECREATE:
        case TransactionType.SCHEDULEDELETE:
        case TransactionType.SCHEDULESIGN:
            result = row.entity_id ? "Schedule ID: " + row.entity_id : ""
            break
        default:
            result = ""
            break
    }
    return result
}

function makeTransferLabel(row: Transaction, netAmount: number): string {
    const TREASURY = "0.0.98"
    let result: string
    let fromAccount = null
    let toAccount = null
    let foundTreasury = false
    let nbFrom = 0

    if (netAmount > 0 && row.transfers !== undefined) {
        for (const t of row.transfers) {
            if (t.amount < 0) {
                fromAccount = t.account
                nbFrom++
                if (Math.abs(t.amount) == netAmount) {
                    break
                }
            }
        }
        for (const t of row.transfers) {
            if (t.amount > 0) {
                if (t.amount == netAmount) {
                    toAccount = t.account
                    break
                } else if (t.account == TREASURY) {
                    foundTreasury = true
                }
            }
        }

        if (fromAccount && toAccount) {
            result = fromAccount + " \u2192 " + toAccount
        } else if (nbFrom == 1 && foundTreasury) {
            result = fromAccount + " \u2192 " + TREASURY
        } else {
            result = ""
        }
    } else {
        result = ""
    }

    return result
}

export function showPositiveNetAmount(row: Transaction): boolean {
    let result: boolean

    const netAmount = computeNetAmount(row)
    switch (row.name) {
        case TransactionType.CRYPTOTRANSFER:
            result= true
            break
        default:
            result = netAmount > 0
    }
    return result
}

export function makeRelationshipLabel(row: Transaction): string {
    let result: string
    if (row.name === TransactionType.SCHEDULECREATE) {
        result = "Scheduling"
    } else if (row.scheduled) {
        result = "Scheduled"
    } else if (row.nonce && row.nonce > 0) {
        result = "Child"
    } else {
        result = "Parent"
    }
    return result
}

export function makeTypeLabel(type: TransactionType | undefined): string {
    let result: string
    switch (type) {

        case TransactionType.CONSENSUSCREATETOPIC:
            result = "HCS Create Topic";
            break;
        case TransactionType.CONSENSUSUPDATETOPIC:
            result = "HCS Update Topic";
            break;
        case TransactionType.CONSENSUSDELETETOPIC:
            result = "HCS Delete Topic";
            break;
        case TransactionType.CONSENSUSSUBMITMESSAGE:
            result = "HCS Submit Message"
            break;

        case TransactionType.CONTRACTCALL:
            result = "Contract Call"
            break;
        case TransactionType.CONTRACTDELETEINSTANCE:
            result = "Contract Delete"
            break;
        case TransactionType.CONTRACTCREATEINSTANCE:
            result = "Contract Create"
            break;
        case TransactionType.CONTRACTUPDATEINSTANCE:
            result = "Contract Update"
            break;

        case TransactionType.CRYPTOADDLIVEHASH:
            result = "Crypto Add Live Hash"
            break;
        case TransactionType.CRYPTOCREATEACCOUNT:
            result = "Crypto Create Account"
            break;
        case TransactionType.CRYPTODELETE:
            result = "Crypto Delete Account"
            break;
        case TransactionType.CRYPTOUPDATEACCOUNT:
            result = "Crypto Update Account"
            break;
        case TransactionType.CRYPTODELETELIVEHASH:
            result = "Crypto Delete Live Hash"
            break
        case TransactionType.CRYPTOTRANSFER:
            result = "Crypto Transfer"
            break

        case TransactionType.FILECREATE:
            result = "File Create";
            break;
        case TransactionType.FILEDELETE:
            result = "File Delete";
            break;
        case TransactionType.FILEAPPEND:
            result = "File Append";
            break;
        case TransactionType.FILEUPDATE:
            result = "File Update";
            break;

        case TransactionType.FREEZE:
            result = "Freeze";
            break;

        case TransactionType.SCHEDULECREATE:
            result = "Schedule Create";
            break;
        case TransactionType.SCHEDULEDELETE:
            result = "Schedule Delete";
            break;
        case TransactionType.SCHEDULESIGN:
            result = "Schedule Sign";
            break;

        case TransactionType.SYSTEMDELETE:
            result = "System Delete";
            break;
        case TransactionType.SYSTEMUNDELETE:
            result = "System Undelete";
            break;

        case TransactionType.TOKENBURN:
            result = "Token Burn";
            break;
        case TransactionType.TOKENCREATION:
            result = "Token Create";
            break;
        case TransactionType.TOKENDELETION:
            result = "Token Delete";
            break;
        case TransactionType.TOKENUPDATE:
            result = "Token Update";
            break;
        case TransactionType.TOKENASSOCIATE:
            result = "Token Associate";
            break;
        case TransactionType.TOKENDISSOCIATE:
            result = "Token Dissociate";
            break;
        case TransactionType.TOKENFEESCHEDULEUPDATE:
            result = "Token Fee Schedule Update";
            break;
        case TransactionType.TOKENFREEZE:
            result = "Token Freeze";
            break;
        case TransactionType.TOKENGRANTKYC:
            result = "Token KYC Grant";
            break;
        case TransactionType.TOKENMINT:
            result = "Token Mint";
            break;
        case TransactionType.TOKENPAUSE:
            result = "Token Pause";
            break;
        case TransactionType.TOKENREVOKEKYC:
            result = "Token KYC Revoke";
            break;
        case TransactionType.TOKENUNFREEZE:
            result = "Token Unfreeze";
            break;
        case TransactionType.TOKENUNPAUSE:
            result = "Token Unpause";
            break;
        case TransactionType.TOKENWIPE:
            result = "Token Wipe";
            break;

        case TransactionType.UNCHECKEDSUBMIT:
            result = "Unchecked Submit";
            break;

        default:
            result = type ?? "?"
            break
    }

    return result.toUpperCase()
}

export function makeOperatorAccountLabel(row: Transaction): string {

    //
    // Derived from transaction id
    //      account-timestamp-fraction
    //      0.0.3107590-1639489392-138251957

    let result: string
    const transactionId = row.transaction_id;
    if (transactionId != null) {
        const index = transactionId.indexOf("-")
        result = index != -1 ? transactionId.substring(0, index) : "?";
    } else {
        result = "?"
    }
    return result
}

function formatMemo(memo64: string): string {
    let result: string
    try {
        result = atob(memo64)
    } catch {
        result = memo64
    }
    return result
}

export function computeNetAmount(row: Transaction): number {
    let result = 0
    if (row.transfers !== undefined) {
        for (const t of row.transfers) {
            if (t.amount > 0) {
                result += t.amount
            }
        }
    }
    result -= row.charged_tx_fee ?? 0
    return result
}
