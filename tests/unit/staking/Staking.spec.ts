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
import {
    SAMPLE_ACCOUNT_STAKING_ACCOUNT,
    SAMPLE_COINGECKO,
    SAMPLE_NETWORK_NODES,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ProgressDialog from "@/components/staking/ProgressDialog.vue";
import {waitFor} from "@/utils/TimerUtils";
import {TransactionID} from "@/utils/TransactionID";

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

    test("no props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        // Account for which we want to update staking
        // => we clone existing mocked account because we're going to mute this mock
        const TARGET_ACCOUNT = JSON.parse(JSON.stringify(SAMPLE_ACCOUNT_STAKING_ACCOUNT))
        const TARGET_ACCOUNT_ID = TARGET_ACCOUNT.account

        // Transaction used to represent stake update operation
        const STAKE_UPDATE_TRANSACTION = SAMPLE_TRANSACTION
        const STAKE_UPDATE_TRANSACTIONS = SAMPLE_TRANSACTIONS
        const STAKE_UPDATE_TRANSACTION_ID = STAKE_UPDATE_TRANSACTION.transaction_id

        // Adds test driver to WalletManager
        const testDriver = new WalletDriver_Mock(TARGET_ACCOUNT, STAKE_UPDATE_TRANSACTION_ID)
        walletManager.getDrivers().push(testDriver)

        // Mocks axios
        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/accounts/" + testDriver.account.account
        mock.onGet(matcher1).reply(200, testDriver.account)
        const matcher2 = "/api/v1/network/nodes"
        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_NODES);
        const matcher3 = "https://api.coingecko.com/api/v3/coins/hedera-hashgraph"
        mock.onGet(matcher3).reply(200, SAMPLE_COINGECKO);
        const matcher4 = "/api/v1/transactions/" + STAKE_UPDATE_TRANSACTION_ID
        mock.onGet(matcher4).reply(200, STAKE_UPDATE_TRANSACTIONS)

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
        expect(testDriver.getAccountId()).toBe(TARGET_ACCOUNT_ID)

        // Check staking information
        const ndis = wrapper.findAllComponents(NetworkDashboardItem)
        expect(ndis.length).toBeGreaterThanOrEqual(3)
        expect(ndis[0].text()).toBe("Staked toAccount 0.0.5since Mar 3, 2022")
        expect(ndis[1].text()).toBe("My Stake0.31669471HBAR")
        expect(ndis[2].text()).toBe("RewardsDeclined")

        // Click "STOP STAKING"
        await wrapper.get("#stopStakingButton").trigger("click")
        const confirmDialog = wrapper.getComponent(ConfirmDialog)
        expect(confirmDialog.text()).toBe("Change Staking  for account 0.0.730632Do you want to decline rewards?FillerCANCELCONFIRM")
        const confirmButtons = confirmDialog.findAll("button")
        expect(confirmButtons.length).toBe(2) // Cancel and Confirm
        expect(confirmButtons[1].text()).toBe("CONFIRM")
        await confirmButtons[1].trigger("click")
        await flushPromises()

        // Wait ...
        const progressDialog = wrapper.getComponent(ProgressDialog);
        expect(progressDialog.text()).toBe("Stopping stakingCompleting operation…This may take a few secondsCLOSE");
        await waitFor(3000)
        await flushPromises()
        expect(progressDialog.text()).toBe("Stopping stakingOperation completedwith transaction ID:0.0.29624024@1646025139.152901498CLOSE")
        expect(progressDialog.text()).toMatch(TransactionID.normalize(STAKE_UPDATE_TRANSACTION_ID))

        // Click "CLOSE"
        const closeButton = progressDialog.get("button")
        expect(closeButton.attributes().disabled).toBeUndefined()
        expect(closeButton.text()).toBe("CLOSE")
        await closeButton.trigger("click")
        await flushPromises()

        // Check staking information
        expect(ndis[0].text()).toBe("Staked toNone")
        expect(ndis[1].text()).toBe("My StakeNone")
        expect(ndis[2].text()).toBe("RewardsNone")

        // Check driver
        expect(testDriver.updateAccountCounter).toBe(1)
        expect(testDriver.account.staked_node_id).toBeNull()
        expect(testDriver.account.staked_account_id).toBeNull()
        expect(testDriver.account.decline_reward).toBeNull()

        // Click "DISCONNECT WALLET"
        await wrapper.get("#disconnectWalletButton").trigger("click")
        await flushPromises()
        expect(walletManager.getActiveDriver()).toBe(testDriver)
        expect(testDriver.isConnected()).toBeFalsy()
        expect(testDriver.getAccountId()).toBe(null)

    });

});
