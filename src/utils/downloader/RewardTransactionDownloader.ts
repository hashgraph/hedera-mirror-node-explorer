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

import {TransactionDownloader, TransactionEncoder} from "@/utils/downloader/TransactionDownloader";
import {Transaction} from "@/schemas/HederaSchemas";
import {RewardsTransactionTableController} from "@/components/staking/RewardsTransactionTableController";
import {CSVEncoder} from "@/utils/CSVEncoder";

export class RewardTransactionDownloader extends TransactionDownloader {


    //
    // EntityDownloader
    //

    protected filter(transactions: Transaction[]): Transaction[] {
        const result: Transaction[] = []

        if (this.accountId.value !== null) {
            for (const t of transactions) {
                if (RewardsTransactionTableController.getAmountRewarded(t, this.accountId.value) > 0) {
                    result.push(t)
                }
            }
        } else {
            throw this.wrongSetupError
        }

        return result
    }

    //
    // TransactionDownloader
    //

    protected makeCSVEncoder(dateFormat: Intl.DateTimeFormat): CSVEncoder<Transaction> {
        let result: CSVEncoder<Transaction>
        if (this.accountId.value !== null) {
            result = new TransactionRewardEncoder(this.getEntities(), this.accountId.value, dateFormat)
        } else {
            throw this.wrongSetupError
        }
        return result
    }

    protected makeOutputPrefix(): string {
        return this.accountId.value !== null ? "Hedera Reward " + this.accountId : ""
    }
}


class TransactionRewardEncoder extends TransactionEncoder {

    private readonly accountId: string

    //
    // Public
    //

    constructor(transactions: Transaction[], accountId: string, dateFormat: Intl.DateTimeFormat) {
        super(transactions, dateFormat)
        this.accountId = accountId
    }

    //
    // TransactionEncoder
    //

    protected encodeEntity(t: Transaction): string[][] {
        const timestamp = t.consensus_timestamp ? this.formatTimestamp(t.consensus_timestamp) : ""
        const reward = this.formatAmount(RewardsTransactionTableController.getAmountRewarded(t, this.accountId))
        return [[timestamp, reward]]
    }

    protected encodeHeaderRow(): string[] | null {
        return ["#date","#reward_amount"]
    }
}