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

import {EthereumAddress} from "@/utils/EthereumAddress";

describe("EthereumAddress", () => {

    test("Parsing from a long-zero address", () => {

        const longZeroAddress = "0x000000000000000000000000000000000010400e"
        const compactAddress = "0x00…10400e"
        const entityId = "0.0.1064974"

        const address = EthereumAddress.parse(longZeroAddress)

        expect(address?.isLongZeroForm()).toBe(true)
        expect(address?.toString()).toBe(longZeroAddress)
        expect(address?.toCompactString()).toBe(compactAddress)
        expect(address?.toEntityID()?.toString()).toBe(entityId)
    })

    test("Parsing from a native evm address", () => {

        const nativeEvmAddress = "0xe6d5514b8de7ef9e5f5c4cc2e8ca0207129deb65"
        const compactAddress = "0xe6…9deb65"

        const address = EthereumAddress.parse(nativeEvmAddress)

        expect(address?.isLongZeroForm()).toBe(false)
        expect(address?.toString()).toBe(nativeEvmAddress)
        expect(address?.toCompactString()).toBe(compactAddress)
        expect(address?.toEntityID()).toBe(null)
    })

    test("Parsing from an invalid address", () => {

        const invalidEvmAddress = "0xe6d5514b8de7ef9e5f5c4cc2e8ca0207129deb6500"

        const address = EthereumAddress.parse(invalidEvmAddress)

        expect(address).toBe(null)
    })

})
