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

import {TokenAirdrop, TokenAirdropsResponse,} from "@/schemas/HederaSchemas";
import {Ref} from "vue";
import {KeyOperator, SortOrder, TableController} from "@/utils/table/TableController";
import {Router} from "vue-router";
import axios from "axios";

export class PendingAirdropTableController extends TableController<TokenAirdrop, AirdropKey> {

    //
    // Public
    //

    public readonly accountId: Ref<string | null>

    public constructor(
        router: Router,
        accountId: Ref<string | null>,
        pageSize: Ref<number>,
        pageParamName = "p",
        keyParamName = "k"
    ) {
        super(
            router,
            pageSize,
            10 * pageSize.value,
            TableController.SLOW_REFRESH_PERIOD,
            0,
            100,
            pageParamName,
            keyParamName
        )
        this.accountId = accountId
        this.watchAndReload([this.accountId, this.pageSize])
    }

    public getAllAirdrops(limit = 100): Promise<TokenAirdrop[]> {
        let result = PendingAirdropTableController.AIRDROPS_MOCK
        return Promise.resolve(result)
    }

    //
    // TableController
    //

    // private drained = false

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // public async load(key: AirdropKey | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<TokenAirdrop[] | null> {
    //     let result: TokenAirdrop[] | null
    //
    //     if (this.accountId.value === null) {
    //         result = null
    //     } else if (this.drained) {
    //         result = []
    //     } else {
    //         result = PendingAirdropTableController.AIRDROPS_MOCK
    //     }
    //     return Promise.resolve(result)
    // }

    private static AIRDROPS_MOCK = [{
        "amount": 333, "receiver_id": "0.0.1299", "sender_id": "0.0.222", "serial_number": null, "timestamp": {
            "from": "1111111111.111111111", "to": null
        }, "token_id": "0.0.4841213"
    }, {
        "amount": 1, "receiver_id": "0.0.1299", "sender_id": "0.0.222", "serial_number": 1, "timestamp": {
            "from": "1111111111.111111112", "to": null
        }, "token_id": "0.0.4846884"
    }, {
        "amount": 1, "receiver_id": "0.0.1299", "sender_id": "0.0.222", "serial_number": 2, "timestamp": {
            "from": "1111111111.111111112", "to": null
        }, "token_id": "0.0.4846884"
    }, {
        "amount": 1, "receiver_id": "0.0.1299", "sender_id": "0.0.222", "serial_number": 5, "timestamp": {
            "from": "1111111111.111111112", "to": null
        }, "token_id": "0.0.4846884"
    }, {
        "amount": 1, "receiver_id": "0.0.1299", "sender_id": "0.0.222", "serial_number": 6, "timestamp": {
            "from": "1111111111.111111113", "to": null
        }, "token_id": "0.0.4846882"
    }]


    public async load(key: AirdropKey | null, operator: KeyOperator, order: SortOrder, limit: number): Promise<TokenAirdrop[] | null> {
        let result

        if (this.accountId.value === null) {
            result = Promise.resolve(null)
        } else {
            const params = PendingAirdropTableController.makeQueryParams(key, operator, order, limit)
            const url = "api/v1/accounts/" + this.accountId.value + "/airdrops/pending"
            const response = await axios.get<TokenAirdropsResponse>(url, {params: params})
            result = Promise.resolve(response.data.airdrops)
        }
        return result
    }

    public keyFor(row: TokenAirdrop): AirdropKey {
        return {
            sender_id: row.sender_id,
            token_id: row.token_id,
            serial_number: row.serial_number
        }
    }

    public stringFromKey(k: AirdropKey): string {
        return k.sender_id + "-" + k.token_id + "-" + k.serial_number
    }

    public keyFromString(s: string): AirdropKey | null {
        let result: AirdropKey | null
        const items = s.split("-")
        if (items.length == 3) {
            const serial_number = Number(items[3])
            if (isNaN(serial_number)) {
                result = null
            } else {
                result = {
                    sender_id: items[0],
                    token_id: items[2],
                    serial_number
                }
            }
        } else {
            result = null
        }
        return result
    }

    //
    // Private
    //

    private static makeQueryParams(key: AirdropKey|null, operator: KeyOperator, order: SortOrder, limit: number): QueryParams {
        let result: QueryParams = {
            limit: limit,
            order: order
        }

        if (key !== null) {
            if (key.serial_number !== null) {
                switch(operator) {
                    case KeyOperator.lt:
                        result["sender.id"] = KeyOperator.lte + ":" + key.sender_id
                        result["token.id"] = KeyOperator.lte + ":" + key.token_id
                        result["serialnumber"] = KeyOperator.lt + ":" + key.serial_number
                        break
                    case KeyOperator.lte:
                        result["sender.id"] = KeyOperator.lte + ":" + key.sender_id
                        result["token.id"] = KeyOperator.lte + ":" + key.token_id
                        result["serialnumber"] = KeyOperator.lte + ":" + key.serial_number
                        break
                    case KeyOperator.gt:
                        result["sender.id"] = KeyOperator.gte + ":" + key.sender_id
                        result["token.id"] = KeyOperator.gte + ":" + key.token_id
                        result["serialnumber"] = KeyOperator.gt + ":" + key.serial_number
                        break
                    case KeyOperator.gte:
                        result["sender.id"] = KeyOperator.gte + ":" + key.sender_id
                        result["token.id"] = KeyOperator.gte + ":" + key.token_id
                        result["serialnumber"] = KeyOperator.gte + ":" + key.serial_number
                        break
                }
            } else {
                switch(operator) {
                    case KeyOperator.lt:
                        result["sender.id"] = KeyOperator.lte + ":" + key.sender_id
                        result["token.id"] = KeyOperator.lt + ":" + key.token_id
                        break
                    case KeyOperator.lte:
                        result["sender.id"] = KeyOperator.lte + ":" + key.sender_id
                        result["token.id"] = KeyOperator.lte + ":" + key.token_id
                        break
                    case KeyOperator.gt:
                        result["sender.id"] = KeyOperator.gte + ":" + key.sender_id
                        result["token.id"] = KeyOperator.gt + ":" + key.token_id
                        break
                    case KeyOperator.gte:
                        result["sender.id"] = KeyOperator.gte + ":" + key.sender_id
                        result["token.id"] = KeyOperator.gte + ":" + key.token_id
                        break
                }
                // result["serialnumber"]  is left undefined
            }
        }

        return result
    }

}

export interface AirdropKey {
    sender_id: string | null,
    token_id: string | null,
    serial_number: number | null | undefined
}

interface QueryParams {
    limit: number
    order: string
    "sender.id"?: string
    "token.id"?: string
    "serialnumber"?: string
}

// create unique index if not exists token_airdrop__sender_id on token_airdrop (
//      sender_account_id,
//      receiver_account_id,
//      token_id,
//      serial_number
// )
