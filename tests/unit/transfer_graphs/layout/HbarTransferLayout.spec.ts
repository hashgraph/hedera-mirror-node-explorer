// noinspection DuplicatedCode

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
import {HbarTransferLayout} from "@/components/transfer_graphs/layout/HbarTransferLayout";

describe("HbarTransferLayout.vue", () => {

    //
    // Single source
    //

    test("Single source, only fees", async () => {

        const transaction = {
            "charged_tx_fee": 10,
            "transfers": [
                { "account": "0.0.7",   "amount":  +3 },
                { "account": "0.0.98",  "amount":  +7 },
                { "account": "0.0.100", "amount": -10 }
            ],
        }

        //
        // FULL
        //

        const fullLayout = new HbarTransferLayout(transaction as Transaction)

        expect(fullLayout.transaction).toBe(transaction)
        expect(fullLayout.netAmount).toBe(0)
        expect(fullLayout.rowCount).toBe(2)
        expect(fullLayout.sources.length).toBe(1)
        expect(fullLayout.destinations.length).toBe(2)

        const s0 = fullLayout.sources[0]
        expect(s0.transfer.account).toBe("0.0.100")
        expect(s0.transfer.amount).toBe(-10)
        expect(s0.description).toBe(null)
        expect(s0.payload).toBe(true)

        const d0 = fullLayout.destinations[0]
        expect(d0.transfer.account).toBe("0.0.7")
        expect(d0.transfer.amount).toBe(+3)
        expect(d0.description).toBe("Node 4 - Nomura - Tokyo, Japan")
        expect(d0.payload).toBe(false)

        const d1 = fullLayout.destinations[1]
        expect(d1.transfer.account).toBe("0.0.98")
        expect(d1.transfer.amount).toBe(+7)
        expect(d1.description).toBe("Hedera fee collection account")
        expect(d1.payload).toBe(false)

        //
        // COMPACT
        //

        const compactLayout = new HbarTransferLayout(transaction as Transaction, false)

        expect(compactLayout.transaction).toBe(transaction)
        expect(compactLayout.netAmount).toBe(0)
        expect(compactLayout.rowCount).toBe(0)
        expect(compactLayout.sources.length).toBe(0)
        expect(compactLayout.destinations.length).toBe(0)

    })

    test("Single source, one destination", async () => {

        const transaction = {
            "charged_tx_fee": 10,
            "transfers": [
                { "account": "0.0.100", "amount": -100 },
                { "account": "0.0.7",   "amount":   +3 },
                { "account": "0.0.98",  "amount":   +7 },
                { "account": "0.0.120", "amount":  +90 },
            ],
        }

        //
        // FULL
        //

        const fullLayout = new HbarTransferLayout(transaction as Transaction)

        expect(fullLayout.transaction).toBe(transaction)
        expect(fullLayout.netAmount).toBe(90)
        expect(fullLayout.rowCount).toBe(3)
        expect(fullLayout.sources.length).toBe(1)
        expect(fullLayout.destinations.length).toBe(3)

        const fs0 = fullLayout.sources[0]
        expect(fs0.transfer.account).toBe("0.0.100")
        expect(fs0.transfer.amount).toBe(-100)
        expect(fs0.description).toBe(null)
        expect(fs0.payload).toBe(true)

        const fd0 = fullLayout.destinations[0]
        expect(fd0.transfer.account).toBe("0.0.120")
        expect(fd0.transfer.amount).toBe(+90)
        expect(fd0.description).toBe("Transfer")
        expect(fd0.payload).toBe(true)

        const fd1 = fullLayout.destinations[1]
        expect(fd1.transfer.account).toBe("0.0.7")
        expect(fd1.transfer.amount).toBe(+3)
        expect(fd1.description).toBe("Node 4 - Nomura - Tokyo, Japan")
        expect(fd1.payload).toBe(false)

        const fd2 = fullLayout.destinations[2]
        expect(fd2.transfer.account).toBe("0.0.98")
        expect(fd2.transfer.amount).toBe(+7)
        expect(fd2.description).toBe("Hedera fee collection account")
        expect(fd2.payload).toBe(false)

        //
        // COMPACT
        //

        const compactLayout = new HbarTransferLayout(transaction as Transaction, false)

        expect(compactLayout.transaction).toBe(transaction)
        expect(compactLayout.netAmount).toBe(90)
        expect(compactLayout.rowCount).toBe(1)
        expect(compactLayout.sources.length).toBe(1)
        expect(compactLayout.destinations.length).toBe(1)

        const cs0 = fullLayout.sources[0]
        expect(cs0.transfer.account).toBe("0.0.100")
        expect(cs0.transfer.amount).toBe(-100)
        expect(cs0.description).toBe(null)
        expect(cs0.payload).toBe(true)

        const cd0 = fullLayout.destinations[0]
        expect(cd0.transfer.account).toBe("0.0.120")
        expect(cd0.transfer.amount).toBe(+90)
        expect(cd0.description).toBe("Transfer")
        expect(cd0.payload).toBe(true)
    })

    test("Single source, two destinations", async () => {

        const transaction = {
            "charged_tx_fee": 10,
            "transfers": [
                { "account": "0.0.100", "amount": -100 },
                { "account": "0.0.7",   "amount":   +3 },
                { "account": "0.0.98",  "amount":   +7 },
                { "account": "0.0.120", "amount":  +30 },
                { "account": "0.0.121", "amount":  +60 },
            ],
        }

        //
        // FULL
        //

        const fullLayout = new HbarTransferLayout(transaction as Transaction)

        expect(fullLayout.transaction).toBe(transaction)
        expect(fullLayout.netAmount).toBe(90)
        expect(fullLayout.rowCount).toBe(4)
        expect(fullLayout.sources.length).toBe(1)
        expect(fullLayout.destinations.length).toBe(4)

        const s0 = fullLayout.sources[0]
        expect(s0.transfer.account).toBe("0.0.100")
        expect(s0.transfer.amount).toBe(-100)
        expect(s0.description).toBe(null)
        expect(s0.payload).toBe(true)

        const d0 = fullLayout.destinations[0]
        expect(d0.transfer.account).toBe("0.0.120")
        expect(d0.transfer.amount).toBe(+30)
        expect(d0.description).toBe("Transfer")
        expect(d0.payload).toBe(true)

        const d1 = fullLayout.destinations[1]
        expect(d1.transfer.account).toBe("0.0.121")
        expect(d1.transfer.amount).toBe(+60)
        expect(d1.description).toBe("Transfer")
        expect(d1.payload).toBe(true)

        const d2 = fullLayout.destinations[2]
        expect(d2.transfer.account).toBe("0.0.7")
        expect(d2.transfer.amount).toBe(+3)
        expect(d2.description).toBe("Node 4 - Nomura - Tokyo, Japan")
        expect(d2.payload).toBe(false)

        const d3 = fullLayout.destinations[3]
        expect(d3.transfer.account).toBe("0.0.98")
        expect(d3.transfer.amount).toBe(+7)
        expect(d3.description).toBe("Hedera fee collection account")
        expect(d3.payload).toBe(false)

        //
        // COMPACT
        //

        const compactLayout = new HbarTransferLayout(transaction as Transaction, false)

        expect(compactLayout.transaction).toBe(transaction)
        expect(compactLayout.netAmount).toBe(90)
        expect(compactLayout.rowCount).toBe(2)
        expect(compactLayout.sources.length).toBe(1)
        expect(compactLayout.destinations.length).toBe(2)

        const cs0 = fullLayout.sources[0]
        expect(cs0.transfer.account).toBe("0.0.100")
        expect(cs0.transfer.amount).toBe(-100)
        expect(cs0.description).toBe(null)
        expect(cs0.payload).toBe(true)

        const cd0 = fullLayout.destinations[0]
        expect(cd0.transfer.account).toBe("0.0.120")
        expect(cd0.transfer.amount).toBe(+30)
        expect(cd0.description).toBe("Transfer")
        expect(cd0.payload).toBe(true)

        const cd1 = fullLayout.destinations[1]
        expect(cd1.transfer.account).toBe("0.0.121")
        expect(cd1.transfer.amount).toBe(+60)
        expect(cd1.description).toBe("Transfer")
        expect(cd1.payload).toBe(true)
    })


    //
    // Multiple sources
    //

    test("Multiple sources, only fees", async () => {

        const transaction = {
            "charged_tx_fee": 10,
            "transfers": [
                { "account": "0.0.100", "amount":  -2 },
                { "account": "0.0.101", "amount":  -8 },
                { "account": "0.0.7",   "amount":  +3 },
                { "account": "0.0.98",  "amount":  +7 },
            ],
        }

        //
        // FULL
        //

        const fullLayout = new HbarTransferLayout(transaction as Transaction)

        expect(fullLayout.transaction).toBe(transaction)
        expect(fullLayout.netAmount).toBe(0)
        expect(fullLayout.rowCount).toBe(2)
        expect(fullLayout.sources.length).toBe(2)
        expect(fullLayout.destinations.length).toBe(2)

        const s0 = fullLayout.sources[0]
        expect(s0.transfer.account).toBe("0.0.100")
        expect(s0.transfer.amount).toBe(-2)
        expect(s0.description).toBe(null)
        expect(s0.payload).toBe(true)

        const s1 = fullLayout.sources[1]
        expect(s1.transfer.account).toBe("0.0.101")
        expect(s1.transfer.amount).toBe(-8)
        expect(s1.description).toBe(null)
        expect(s1.payload).toBe(true)

        const d0 = fullLayout.destinations[0]
        expect(d0.transfer.account).toBe("0.0.7")
        expect(d0.transfer.amount).toBe(+3)
        expect(d0.description).toBe("Node 4 - Nomura - Tokyo, Japan")
        expect(d0.payload).toBe(false)

        const d1 = fullLayout.destinations[1]
        expect(d1.transfer.account).toBe("0.0.98")
        expect(d1.transfer.amount).toBe(+7)
        expect(d1.description).toBe("Hedera fee collection account")
        expect(d1.payload).toBe(false)


        //
        // COMPACT
        //

        const compactLayout = new HbarTransferLayout(transaction as Transaction, false)

        expect(compactLayout.transaction).toBe(transaction)
        expect(compactLayout.netAmount).toBe(0)
        expect(compactLayout.rowCount).toBe(0)
        expect(compactLayout.sources.length).toBe(0)
        expect(compactLayout.destinations.length).toBe(0)

    })

    test("Multiple sources, one destination", async () => {

        const transaction = {
            "charged_tx_fee": 10,
            "transfers": [
                { "account": "0.0.100", "amount":  -20 },
                { "account": "0.0.101", "amount":  -80 },
                { "account": "0.0.7",   "amount":   +3 },
                { "account": "0.0.98",  "amount":   +7 },
                { "account": "0.0.120", "amount":  +90 },
            ],
        }

        //
        // FULL
        //

        const fullLayout = new HbarTransferLayout(transaction as Transaction)

        expect(fullLayout.transaction).toBe(transaction)
        expect(fullLayout.netAmount).toBe(90)
        expect(fullLayout.rowCount).toBe(3)
        expect(fullLayout.sources.length).toBe(2)
        expect(fullLayout.destinations.length).toBe(3)

        const s0 = fullLayout.sources[0]
        expect(s0.transfer.account).toBe("0.0.100")
        expect(s0.transfer.amount).toBe(-20)
        expect(s0.description).toBe(null)
        expect(s0.payload).toBe(true)

        const s1 = fullLayout.sources[1]
        expect(s1.transfer.account).toBe("0.0.101")
        expect(s1.transfer.amount).toBe(-80)
        expect(s1.description).toBe(null)
        expect(s1.payload).toBe(true)

        const d0 = fullLayout.destinations[0]
        expect(d0.transfer.account).toBe("0.0.120")
        expect(d0.transfer.amount).toBe(+90)
        expect(d0.description).toBe("Transfer")
        expect(d0.payload).toBe(true)

        const d1 = fullLayout.destinations[1]
        expect(d1.transfer.account).toBe("0.0.7")
        expect(d1.transfer.amount).toBe(+3)
        expect(d1.description).toBe("Node 4 - Nomura - Tokyo, Japan")
        expect(d1.payload).toBe(false)

        const d2 = fullLayout.destinations[2]
        expect(d2.transfer.account).toBe("0.0.98")
        expect(d2.transfer.amount).toBe(+7)
        expect(d2.description).toBe("Hedera fee collection account")
        expect(d2.payload).toBe(false)

        //
        // COMPACT
        //

        const compactLayout = new HbarTransferLayout(transaction as Transaction, false)

        expect(compactLayout.transaction).toBe(transaction)
        expect(compactLayout.netAmount).toBe(90)
        expect(compactLayout.rowCount).toBe(2)
        expect(compactLayout.sources.length).toBe(2)
        expect(compactLayout.destinations.length).toBe(1)

        const cs0 = fullLayout.sources[0]
        expect(cs0.transfer.account).toBe("0.0.100")
        expect(cs0.transfer.amount).toBe(-20)
        expect(cs0.description).toBe(null)
        expect(cs0.payload).toBe(true)

        const cs1 = fullLayout.sources[1]
        expect(cs1.transfer.account).toBe("0.0.101")
        expect(cs1.transfer.amount).toBe(-80)
        expect(cs1.description).toBe(null)
        expect(cs1.payload).toBe(true)

        const cd0 = fullLayout.destinations[0]
        expect(cd0.transfer.account).toBe("0.0.120")
        expect(cd0.transfer.amount).toBe(+90)
        expect(cd0.description).toBe("Transfer")
        expect(cd0.payload).toBe(true)
    })

    test("Multiple sources, two destinations", async () => {

        const transaction = {
            "charged_tx_fee": 10,
            "transfers": [
                { "account": "0.0.100", "amount":  -20 },
                { "account": "0.0.101", "amount":  -80 },
                { "account": "0.0.7",   "amount":   +3 },
                { "account": "0.0.98",  "amount":   +7 },
                { "account": "0.0.120", "amount":  +30 },
                { "account": "0.0.121", "amount":  +60 },
            ],
        }

        //
        // FULL
        //

        const fullLayout = new HbarTransferLayout(transaction as Transaction)

        expect(fullLayout.transaction).toBe(transaction)
        expect(fullLayout.netAmount).toBe(90)
        expect(fullLayout.rowCount).toBe(4)
        expect(fullLayout.sources.length).toBe(2)
        expect(fullLayout.destinations.length).toBe(4)

        const s0 = fullLayout.sources[0]
        expect(s0.transfer.account).toBe("0.0.100")
        expect(s0.transfer.amount).toBe(-20)
        expect(s0.description).toBe(null)
        expect(s0.payload).toBe(true)

        const s1 = fullLayout.sources[1]
        expect(s1.transfer.account).toBe("0.0.101")
        expect(s1.transfer.amount).toBe(-80)
        expect(s1.description).toBe(null)
        expect(s1.payload).toBe(true)

        const d0 = fullLayout.destinations[0]
        expect(d0.transfer.account).toBe("0.0.120")
        expect(d0.transfer.amount).toBe(+30)
        expect(d0.description).toBe("Transfer")
        expect(d0.payload).toBe(true)

        const d1 = fullLayout.destinations[1]
        expect(d1.transfer.account).toBe("0.0.121")
        expect(d1.transfer.amount).toBe(+60)
        expect(d1.description).toBe("Transfer")
        expect(d1.payload).toBe(true)

        const d2 = fullLayout.destinations[2]
        expect(d2.transfer.account).toBe("0.0.7")
        expect(d2.transfer.amount).toBe(+3)
        expect(d2.description).toBe("Node 4 - Nomura - Tokyo, Japan")
        expect(d2.payload).toBe(false)

        const d3 = fullLayout.destinations[3]
        expect(d3.transfer.account).toBe("0.0.98")
        expect(d3.transfer.amount).toBe(+7)
        expect(d3.description).toBe("Hedera fee collection account")
        expect(d3.payload).toBe(false)


        //
        // COMPACT
        //

        const compactLayout = new HbarTransferLayout(transaction as Transaction, false)

        expect(compactLayout.transaction).toBe(transaction)
        expect(compactLayout.netAmount).toBe(90)
        expect(compactLayout.rowCount).toBe(2)
        expect(compactLayout.sources.length).toBe(2)
        expect(compactLayout.destinations.length).toBe(2)

        const cs0 = fullLayout.sources[0]
        expect(cs0.transfer.account).toBe("0.0.100")
        expect(cs0.transfer.amount).toBe(-20)
        expect(cs0.description).toBe(null)
        expect(cs0.payload).toBe(true)

        const cs1 = fullLayout.sources[1]
        expect(cs1.transfer.account).toBe("0.0.101")
        expect(cs1.transfer.amount).toBe(-80)
        expect(cs1.description).toBe(null)
        expect(cs1.payload).toBe(true)

        const cd0 = fullLayout.destinations[0]
        expect(cd0.transfer.account).toBe("0.0.120")
        expect(cd0.transfer.amount).toBe(+30)
        expect(cd0.description).toBe("Transfer")
        expect(cd0.payload).toBe(true)

        const cd1 = fullLayout.destinations[1]
        expect(cd1.transfer.account).toBe("0.0.121")
        expect(cd1.transfer.amount).toBe(+60)
        expect(cd1.description).toBe("Transfer")
        expect(cd1.payload).toBe(true)
    })

})
