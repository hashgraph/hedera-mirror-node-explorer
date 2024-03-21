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

import {Transaction} from "@/schemas/HederaSchemas";
import {CSVEncoder} from "@/utils/CSVEncoder";
import {lookupNFTTransfer} from "@/schemas/HederaUtils";
import {TokenTransferDownloader} from "@/utils/downloader/TokenTransferDownloader";

export class NFTTransferDownloader extends TokenTransferDownloader {

    //
    // EntityDownloader
    //

    protected filter(candidates: Transaction[]): Transaction[] {
        const result: Transaction[] = []

        const tokenId = this.tokenId.value
        for (const c of candidates) {
            const match = tokenId !== null ? lookupNFTTransfer(c, tokenId) !== null : c.nft_transfers.length >= 1
            if (match) {
                result.push(c)
            }
        }

        return result
    }

    protected makeCSVEncoder(dateFormat: Intl.DateTimeFormat): CSVEncoder<Transaction> {
        return new NFTTransferEncoder(this.entities.value, dateFormat)
    }

    protected makeOutputPrefix(): string {
        return this.accountId.value !== null ? "Hedera NFT Transfers " + this.accountId.value : ""
    }
}

export class NFTTransferEncoder extends CSVEncoder<Transaction> {

    //
    // CSVEncoder
    //

    protected encodeEntity(t: Transaction): string[][] {
        const result: string[][] = []
        const timestamp = t.consensus_timestamp ? this.formatTimestamp(t.consensus_timestamp) : ""
        const transactionID = t.transaction_id ?? ""
        const type = t.name ?? ""
        const transfers = t.nft_transfers ?? []
        for (const transfer of transfers) {
            const tokenId = transfer.token_id
            const serialNumber = transfer.serial_number.toString()
            const fromAccountId = transfer.sender_account_id ?? ""
            const toAccountId = transfer.receiver_account_id ?? ""
            result.push([timestamp, tokenId ?? "null", serialNumber, fromAccountId, toAccountId, transactionID, type])
        }
        return result
    }

    protected encodeHeaderRow(): string[] | null {
        return ["#date","#token_id","#serial_number","#from_account_id","#to_account_id","#transaction_id","#transaction_type"]
    }
}
