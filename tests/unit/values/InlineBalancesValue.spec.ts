// noinspection DuplicatedCode

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


/*
    Bookmarks
        https://test-utils.vuejs.org/api/

 */

import {afterAll, beforeAll, describe, expect, it} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils";
import {SAMPLE_ACCOUNT} from "../Mocks";
import InlineBalancesValue from "../../../src/components/values/InlineBalancesValue.vue";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import router from "../../../src/router";
import {ref, Ref} from "vue";
import {BalanceAnalyzer} from "../../../src/utils/analyzer/BalanceAnalyzer";

describe("InlineBalancesValue.vue", () => {

    const mock = new MockAdapter(axios);
    const TOKENS = [
        {
            "token_id": "0.0.1001",
            "decimals": "0",
            "name": "Token-1",
            "symbol": "Token-1",
            "type": "FUNGIBLE_COMMON",
        },
        {
            "token_id": "0.0.1002",
            "decimals": "0",
            "name": "Token-2",
            "symbol": "Token-2",
            "type": "FUNGIBLE_COMMON",
        },
        {
            "token_id": "0.0.1003",
            "decimals": "0",
            "name": "Token-3",
            "symbol": "Token-3",
            "type": "FUNGIBLE_COMMON",
        },
        {
            "token_id": "0.0.1004",
            "decimals": "0",
            "name": "Token-4",
            "symbol": "Token-4",
            "type": "FUNGIBLE_COMMON",
        },
        {
            "token_id": "0.0.1005",
            "decimals": "0",
            "name": "Token-5",
            "symbol": "Token-5",
            "type": "FUNGIBLE_COMMON",
        },
        {
            "token_id": "0.0.2001",
            "decimals": "0",
            "name": "NFT-1",
            "symbol": "NFT-1",
            "type": "NON_FUNGIBLE_UNIQUE",
        },
        {
            "token_id": "0.0.2002",
            "decimals": "0",
            "name": "NFT-2",
            "symbol": "NFT-2",
            "type": "NON_FUNGIBLE_UNIQUE",
        },
        {
            "token_id": "0.0.2003",
            "decimals": "0",
            "name": "NFT-3",
            "symbol": "NFT-3",
            "type": "NON_FUNGIBLE_UNIQUE",
        },
        {
            "token_id": "0.0.2004",
            "decimals": "0",
            "name": "NFT-4",
            "symbol": "NFT-4",
            "type": "NON_FUNGIBLE_UNIQUE",
        },
        {
            "token_id": "0.0.2005",
            "decimals": "0",
            "name": "NFT-5",
            "symbol": "NFT-5",
            "type": "NON_FUNGIBLE_UNIQUE",
        },
        {
            "token_id": "0.0.2006",
            "decimals": "0",
            "name": "NFT-6",
            "symbol": "NFT-6",
            "type": "NON_FUNGIBLE_UNIQUE",
        },
    ]

    beforeAll(() => {
        TOKENS.forEach(
            (token) => mock.onGet("/api/v1/tokens/" + token.token_id).reply(200, token))
    })

    afterAll(() => {
        mock.restore()
    })

    it("should display all balances inline without 'Show all tokens' link", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const matcher = "/api/v1/balances"
        const balances = [
            {
                "balance": 10000000000,
                "tokens": [
                    {"token_id": TOKENS[0].token_id, "balance": 1},
                    {"token_id": TOKENS[1].token_id, "balance": 2},
                    {"token_id": TOKENS[2].token_id, "balance": 3},
                    {"token_id": TOKENS[3].token_id, "balance": 4},
                    {"token_id": TOKENS[4].token_id, "balance": 5},
                    {"token_id": TOKENS[5].token_id, "balance": 1},
                    {"token_id": TOKENS[6].token_id, "balance": 2},
                    {"token_id": TOKENS[7].token_id, "balance": 3},
                    {"token_id": TOKENS[8].token_id, "balance": 4},
                    {"token_id": TOKENS[9].token_id, "balance": 5},
                ]
            }
        ]
        mock.onGet(matcher).reply(200, {
            "timestamp": "1646728200.821070000",
            "balances": balances
        })

        const accountId: Ref<string> = ref(SAMPLE_ACCOUNT.account)
        const balanceAnalyzer = new BalanceAnalyzer(accountId, 100);

        const wrapper = mount(InlineBalancesValue, {
            global: {
                plugins: [router]
            }, props: {
                balanceAnalyzer: Object.preventExtensions(balanceAnalyzer)
            },
        });
        await flushPromises()
        expect(wrapper.text()).toBe("None")

        balanceAnalyzer.mount()
        await flushPromises()

        expect(wrapper.text()).toContain("100.00000000" + ">")
        expect(wrapper.text()).toContain("years ago")

        balanceAnalyzer.unmount()
        await flushPromises()

        wrapper.unmount()
        await flushPromises()
    });

    it("should display 10 balances inline and 'Show all tokens' link", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const matcher = "/api/v1/balances"
        const balances = [
            {
                "balance": 10000000000,
                "tokens": [
                    {"token_id": TOKENS[0].token_id, "balance": 1},
                    {"token_id": TOKENS[1].token_id, "balance": 2},
                    {"token_id": TOKENS[2].token_id, "balance": 3},
                    {"token_id": TOKENS[3].token_id, "balance": 4},
                    {"token_id": TOKENS[4].token_id, "balance": 5},
                    {"token_id": TOKENS[5].token_id, "balance": 1},
                    {"token_id": TOKENS[6].token_id, "balance": 2},
                    {"token_id": TOKENS[7].token_id, "balance": 3},
                    {"token_id": TOKENS[8].token_id, "balance": 4},
                    {"token_id": TOKENS[9].token_id, "balance": 5},
                    {"token_id": TOKENS[10].token_id, "balance": 6},
                ]
            }
        ]
        mock.onGet(matcher).reply(200, {
            "timestamp": "1646728200.821070000",
            "balances": balances
        })

        const accountId: Ref<string> = ref(SAMPLE_ACCOUNT.account)
        const balanceAnalyzer = new BalanceAnalyzer(accountId, 100);

        const wrapper = mount(InlineBalancesValue, {
            global: {
                plugins: [router]
            }, props: {
                balanceAnalyzer: Object.preventExtensions(balanceAnalyzer)
            },
        });
        await flushPromises()
        expect(wrapper.text()).toBe("None")

        balanceAnalyzer.mount()
        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toContain("100.00000000" + ">")
        expect(wrapper.text()).toContain("years ago")

        balanceAnalyzer.unmount()
        await flushPromises()

        wrapper.unmount()
        await flushPromises()
    });

    it("should display the zero-balances at the end of the inline balances and no 'Show all tokens' link", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const matcher = "/api/v1/balances"
        const balances = [
            {
                "balance": 10000000000,
                "tokens": [
                    {"token_id": TOKENS[0].token_id, "balance": 0},
                    {"token_id": TOKENS[1].token_id, "balance": 2},
                    {"token_id": TOKENS[2].token_id, "balance": 3},
                    {"token_id": TOKENS[3].token_id, "balance": 0},
                    {"token_id": TOKENS[4].token_id, "balance": 5},
                    {"token_id": TOKENS[5].token_id, "balance": 1},
                    {"token_id": TOKENS[6].token_id, "balance": 2},
                    {"token_id": TOKENS[7].token_id, "balance": 3},
                    {"token_id": TOKENS[8].token_id, "balance": 4},
                    {"token_id": TOKENS[9].token_id, "balance": 5}
                ]
            }
        ]
        mock.onGet(matcher).reply(200, {
            "timestamp": "1646728200.821070000",
            "balances": balances
        })

        const accountId: Ref<string> = ref(SAMPLE_ACCOUNT.account)
        const balanceAnalyzer = new BalanceAnalyzer(accountId, 100);

        const wrapper = mount(InlineBalancesValue, {
            global: {
                plugins: [router]
            }, props: {
                balanceAnalyzer: Object.preventExtensions(balanceAnalyzer)
            },
        });
        await flushPromises()
        expect(wrapper.text()).toBe("None")

        balanceAnalyzer.mount()
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toContain("100.00000000" + ">")
        expect(wrapper.text()).toContain("years ago")

        balanceAnalyzer.unmount()
        await flushPromises()

        wrapper.unmount()
        await flushPromises()
    });

    it("should display the single NFT balance inline and the 'Show all tokens' link", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const accountId: Ref<string> = ref(SAMPLE_ACCOUNT.account)
        const balanceAnalyzer = new BalanceAnalyzer(accountId, 100);

        const matcher = "/api/v1/balances"
        const balances = [
            {
                "balance": 10000000000,
                "tokens": [
                    {"token_id": TOKENS[5].token_id, "balance": 1},
                ]
            }
        ]
        mock.onGet(matcher).reply(200, {
            "timestamp": "1646728200.821070000",
            "balances": balances
        })


        const matcher2: string | null = "api/v1/accounts/" + accountId.value + "/nfts"
        mock.onGet(matcher2).reply(200, {
            "nfts": [
                {
                    "account_id": accountId.value,
                    "serial_number": 1,
                    "token_id": TOKENS[5].token_id
                }
            ]
        })

        const wrapper = mount(InlineBalancesValue, {
            global: {
                plugins: [router]
            }, props: {
                balanceAnalyzer: Object.preventExtensions(balanceAnalyzer)
            },
        });

        balanceAnalyzer.mount()
        await flushPromises()
        // console.log(wrapper.text())

        expect(wrapper.text()).toContain("100.00000000" + ">")
        expect(wrapper.text()).toContain("years ago")

        balanceAnalyzer.unmount()
        await flushPromises()

        wrapper.unmount()
        await flushPromises()
    });
});
