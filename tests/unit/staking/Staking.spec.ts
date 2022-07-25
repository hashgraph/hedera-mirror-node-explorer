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

import {flushPromises, mount} from "@vue/test-utils"
import router, {walletManager} from "@/router";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import Staking from "@/pages/Staking.vue";
import WalletChooser from "@/components/staking/WalletChooser.vue";
import {WalletDriver_Mock} from "./WalletDriver_Mock";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {SAMPLE_ACCOUNT_STAKING_ACCOUNT, SAMPLE_COINGECKO, SAMPLE_NETWORK_NODES} from "../Mocks";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

HMSF.forceUTC = true

describe("Staking.vue", () => {

    const TRANSACTION_ID = ""
    const TRANSACTION_HASH = ""
    const TRANSACTION_NODE_ID = ""

    test("no props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/accounts/" + SAMPLE_ACCOUNT_STAKING_ACCOUNT.account
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT_STAKING_ACCOUNT);
        const matcher2 = "/api/v1/network/nodes"
        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_NODES);
        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);

        const testDriver = new WalletDriver_Mock(
            SAMPLE_ACCOUNT_STAKING_ACCOUNT.account,
            TRANSACTION_ID, TRANSACTION_HASH, TRANSACTION_NODE_ID)
        walletManager.getDrivers().push(testDriver)

        const wrapper = mount(Staking, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        await flushPromises()


        // Click "CONNECT WALLET"
        await wrapper.get("#connectWalletButton").trigger("click")
        await flushPromises()
        const walletChooser = wrapper.getComponent(WalletChooser)
        expect(walletChooser.element.classList.contains("is-active")).toBeTruthy()

        // Choose wallet "DriverMock"
        await walletChooser.get("#" + testDriver.name).trigger("click")
        await flushPromises()
        expect(walletManager.getActiveDriver()).toBe(testDriver)
        expect(testDriver.isConnected()).toBeTruthy()
        expect(testDriver.getAccountId()).toBe(SAMPLE_ACCOUNT_STAKING_ACCOUNT.account)

        // Check staking information
        const ndis = wrapper.findAllComponents(NetworkDashboardItem)
        expect(ndis.length).toBeGreaterThanOrEqual(3)
        expect(ndis[0].text()).toBe("Staked toAccount 0.0.5since Mar 3, 2022")
        expect(ndis[1].text()).toBe("My Stake0.31669471HBAR")
        expect(ndis[2].text()).toBe("RewardsDeclined")
        //
        // // Click "STOP STAKING"
        // await wrapper.get("#stopStakingButton").trigger("click")
        // const confirmDialog = wrapper.getComponent(ConfirmDialog)
        // expect(confirmDialog.text()).toBe("Change Staking  for account 0.0.730632Do you want to decline rewards?FillerCANCELCONFIRM")
        // const confirmButtons = confirmDialog.findAll("button")
        // expect(confirmButtons.length).toBe(2) // Cancel and Confirm
        // expect(confirmButtons[1].text()).toBe("CONFIRM")
        // await confirmButtons[1].trigger("click")
        //
        // // Updates mock
        // const PATCHED_ACCOUNT = JSON.parse(JSON.stringify(SAMPLE_ACCOUNT_STAKING_ACCOUNT))
        // PATCHED_ACCOUNT.stake_account_id = null
        // PATCHED_ACCOUNT.stake_node_id = null
        // PATCHED_ACCOUNT.decline_reward = null
        // mock.onGet(matcher1).reply(200, PATCHED_ACCOUNT);
        // jest.spyOn(axios, 'get').mockResolvedValue({data: PATCHED_ACCOUNT})
        // await flushPromises()
        // expect(testDriver.updateAccountCounter).toBe(1)
        //
        // // Check staking information
        // const ndis2 = wrapper.findAllComponents(NetworkDashboardItem)
        // expect(ndis2.length).toBeGreaterThanOrEqual(3)
        // expect(ndis2[0].text()).toBe("None")
        // expect(ndis2[1].text()).toBe("None")
        // expect(ndis2[2].text()).toBe("RewardsNone")
        //

        // Click "DISCONNECT WALLET"
        await wrapper.get("#disconnectWalletButton").trigger("click")
        await flushPromises()
        expect(walletManager.getActiveDriver()).toBe(testDriver)
        expect(testDriver.isConnected()).toBeFalsy()
        expect(testDriver.getAccountId()).toBe(null)

    });

});
