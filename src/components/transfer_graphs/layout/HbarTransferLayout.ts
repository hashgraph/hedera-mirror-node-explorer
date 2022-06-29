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

import {compareTransferByAccount, Transaction, Transfer} from "@/schemas/HederaSchemas";
import {computeNetAmount} from "@/utils/TransactionTools";
import {operatorRegistry} from "@/schemas/OperatorRegistry";

export class HbarTransferLayout {

    public readonly transaction: Transaction|undefined
    public readonly netAmount: number
    public readonly sources = Array<HbarTransferRow>()
    public readonly destinations = Array<HbarTransferRow>()
    public readonly rowCount: number

    //
    // Public
    //

    public constructor(transaction: Transaction|undefined, full = true) {

        this.transaction = transaction
        this.netAmount = transaction ? computeNetAmount(transaction) : 0

        if (this.transaction?.transfers) {
            const negativeTransfers = new Array<Transfer>()
            const positiveTransfers = new Array<Transfer>()
            for (const t of this.transaction.transfers) {
                if (t.amount < 0) {
                    negativeTransfers.push(t)
                } else {
                    positiveTransfers.push(t)
                }
            }
            negativeTransfers.sort(compareTransferByAccount)
            positiveTransfers.sort(compareTransferByAccount)

            for (const t of negativeTransfers) {
                const payload = t.account === null || operatorRegistry.lookup(t.account) === null
                this.sources.push(new HbarTransferRow(t, null, payload))
            }
            for (const t of positiveTransfers) {
                const payload = t.account === null || operatorRegistry.lookup(t.account) === null
                this.destinations.push(new HbarTransferRow(t, HbarTransferLayout.makeDescription(t), payload))
            }
        }

        if (!full) {
            // We remove "fee" rows (ie rows with payload == false)
            const sRemovalCount = HbarTransferLayout.removeFeeRows(this.sources)
            const dRemovalCount = HbarTransferLayout.removeFeeRows(this.destinations)
            if ((sRemovalCount >= 1 && this.sources.length == 0) ||
                (dRemovalCount >= 1 && this.destinations.length == 0)) {
                // Sources or destinations or both are all "fees"
                this.sources.splice(0)
                this.destinations.splice(0)
            }
        }

        this.rowCount = Math.max(this.sources.length, this.destinations.length)
    }


    //
    // Private
    //

    private static makeDescription(t: Transfer): string {
        return (t.account !== null ? operatorRegistry.makeDescription(t.account) : null) ?? "Transfer"
    }

    private static removeFeeRows(rows: HbarTransferRow[]): number {
        let result = 0
        let i = 0
        while (i < rows.length) {
            if (rows[i].payload) {
                i += 1
            } else {
                rows.splice(i, 1)
                result += 1
            }
        }
        return result
    }
}

export class HbarTransferRow {
    public readonly transfer: Transfer
    public readonly description: string|null
    public readonly payload: boolean

    constructor(transfer: Transfer, description: string|null, payload: boolean) {
        this.transfer = transfer
        this.description = description
        this.payload = payload

    }
}