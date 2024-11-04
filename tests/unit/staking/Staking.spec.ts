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

import {describe, expect, test} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import router, {walletManager} from "@/router";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import Staking from "@/pages/Staking.vue";
import TopNavBar from "@/components/TopNavBar.vue";
import WalletInfo from "@/components/wallet/WalletInfo.vue"
import WalletChooser from "@/components/staking/WalletChooser.vue";
import {WalletDriver_Mock} from "./WalletDriver_Mock";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
    SAMPLE_ACCOUNT_STAKING_ACCOUNT,
    SAMPLE_NETWORK_EXCHANGERATE,
    SAMPLE_NETWORK_NODES,
    SAMPLE_TRANSACTION,
    SAMPLE_TRANSACTIONS
} from "../Mocks";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import ProgressDialog from "@/components/staking/ProgressDialog.vue";
import {waitFor} from "@/utils/TimerUtils";
import StakingDialog from "@/components/staking/StakingDialog.vue";
import {nextTick} from "vue";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("Staking.vue", () => {

    test("no props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const POLLING = 2 // ms

        // Account for which we want to update staking
        // => we clone existing mocked account because we're going to mute this mock
        const TARGET_ACCOUNT = JSON.parse(JSON.stringify(SAMPLE_ACCOUNT_STAKING_ACCOUNT))
        TARGET_ACCOUNT.pending_reward = undefined
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
        for (const node of SAMPLE_NETWORK_NODES.nodes) {
            const body = {params: {"node.id": node.node_id}}
            const response = {nodes: [node]}
            mock.onGet(matcher2, body).reply(200, response)
        }

        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_NODES)
        const matcher3 = "/api/v1/network/exchangerate"
        mock.onGet(matcher3).reply(200, SAMPLE_NETWORK_EXCHANGERATE);
        const matcher4 = "/api/v1/transactions/" + STAKE_UPDATE_TRANSACTION_ID
        mock.onGet(matcher4).reply(200, STAKE_UPDATE_TRANSACTIONS)
        const matcher5 = "/api/v1/transactions"
        mock.onGet(matcher5).reply(200, SAMPLE_TRANSACTIONS)
        const matcher8 = "/api/v1/accounts/" + testDriver.account.account + "/rewards"
        mock.onGet(matcher8).reply(200, {rewards: []})

        const wrapper = mount(Staking, {
            global: {
                plugins: [router, Oruga]
            },
            props: {polling: POLLING},
        });

        const topNavBarWrapper = mount(TopNavBar, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        });

        const walletInfoWrapper = topNavBarWrapper.getComponent(WalletInfo)

        await flushPromises()


        //
        // 1) Connection to Wallet
        //

        // 1.1) Clicks "CONNECT WALLET" from TopNavBar comopnent
        await topNavBarWrapper.get("#connectWalletButton").trigger("click")
        await flushPromises()
        const walletChooser = topNavBarWrapper.getComponent(WalletChooser)
        expect(walletChooser.get(".modal").element.classList.contains("is-active")).toBeTruthy()

        // 1.2) Chooses wallet "DriverMock"
        await walletChooser.get("#" + testDriver.name).trigger("click")
        await nextTick()
        await walletChooser.get("#connectButton").trigger("click")
        await flushPromises()
        expect(walletManager.getActiveDriver()).toStrictEqual(testDriver)
        expect(walletManager.connected.value).toBeTruthy()
        expect(walletManager.accountId.value).toBe(TARGET_ACCOUNT_ID)
        expect(walletManager.accountIds.value).toStrictEqual([TARGET_ACCOUNT_ID])

        // 1.3) Checks staking information
        const ndis = wrapper.findAllComponents(NetworkDashboardItem)
        expect(ndis.length).toBeGreaterThanOrEqual(3)
        expect(ndis[0].text()).toBe("Staked toAccount 0.0.5")
        expect(ndis[1].text()).toBe("My Stake0.31669471HBAR")
        expect(ndis[2].text()).toBe("Pending RewardNone")

        //
        // 2) Stake to account 0.0.7
        //

        // 2.1) Clicks "CHANGE STAKING"
        await wrapper.get("#showStakingDialog").trigger("click")
        await flushPromises()

        // 2.2) Checks StakingDialog content
        const stakingDialog = wrapper.getComponent(StakingDialog)
        const stakingModals = stakingDialog.findAll(".modal")
        expect(stakingModals.length).toBeGreaterThanOrEqual(2)
        const stakingModal = stakingModals[1]
        expect(stakingModal.element.classList.contains("is-active")).toBeTruthy()
        expect(stakingModal.get("#amountStakedValue").text()).toBe("0.31669471ℏ$0.07792")
        expect(stakingModal.get("#currentlyStakedToValue").text()).toBe("Account 0.0.5")
        const buttons = stakingModal.findAll("button")
        expect(buttons.length).toBe(2) // Cancel and Change
        const changeButton = buttons[1]
        expect(changeButton.text()).toBe("CHANGE")
        expect(changeButton.attributes("disabled")).toBeDefined()

        // 2.3) Select "Stake To Account" radio box
        const stakingRadios = stakingModal.findAll<HTMLInputElement>("input[type='radio']")
        expect(stakingRadios.length).toBe(2)
        const stakingToAccountRadio = stakingRadios[1]
        await stakingToAccountRadio.setValue(true)

        // 2.4) Enters "0.0.7" in "Stake to Account" input
        const newStakeToAccountInput = stakingModal.get<HTMLInputElement>("input[type='text']")
        // await newStakeToAccountInput.trigger("click")
        await newStakeToAccountInput.setValue("0.0.7")
        expect(newStakeToAccountInput.element.value).toBe("0.0.7")

        // 2.5) And clicks "CHANGE"
        await changeButton.trigger("click")
        await nextTick()

        // 2.6) Confirms
        const confirmChangeStaking = async (expectedText: string) => {
            const changeConfirmDialog = stakingDialog.getComponent(ConfirmDialog)
            expect(changeConfirmDialog.text()).toBe(expectedText)
            const changeConfirmButtons = changeConfirmDialog.findAll("button")
            expect(changeConfirmButtons.length).toBe(2) // Cancel and Confirm
            expect(changeConfirmButtons[1].text()).toBe("CONFIRM")
            await changeConfirmButtons[1].trigger("click")
            await nextTick()
        }
        await confirmChangeStaking("Change Staking  for account 0.0.730632Do you want to stake to account 0.0.7-bmurp ?CANCELCONFIRM")

        // 2.7) Waits for progress dialog and closes ...
        const waitAndClose = async (busyText: string, completeText: string) => {
            const progressDialog = wrapper.getComponent(ProgressDialog);
            // expect(progressDialog.text()).toBe(busyText);
            await waitFor(POLLING * 2)
            await flushPromises()
            expect(progressDialog.text()).toBe(completeText)

            const closeButton = progressDialog.get("button")
            expect(closeButton.attributes().disabled).toBeUndefined()
            expect(closeButton.text()).toBe("CLOSE")
            await closeButton.trigger("click")
            await flushPromises()
        }
        await waitAndClose("Updating stakingConnecting to Hedera Network using your wallet…Check your wallet for any approval requestCLOSE",
            "Updating stakingOperation completedwith transaction ID:0.0.29624024@1646025139.152901498CLOSE")

        // 2.8) Checks staking information
        expect(ndis[0].text()).toBe("Staked toAccount 0.0.7")
        expect(ndis[1].text()).toBe("My Stake0.31669471HBAR")
        expect(ndis[2].text()).toBe("Pending RewardNone")

        // 2.9) Checks driver
        expect(testDriver.updateAccountCounter).toBe(1)
        expect(testDriver.account.staked_node_id).toBeNull()
        expect(testDriver.account.staked_account_id).toBe("0.0.7")
        expect(testDriver.account.decline_reward).toBeTruthy()

        //
        // 3) Stake to node id 2
        //

        // 3.1) Clicks "CHANGE STAKING"
        await wrapper.get("#showStakingDialog").trigger("click")
        await flushPromises()

        // 3.2) Checks StakingDialog content
        expect(stakingModal.element.classList.contains("is-active")).toBeTruthy()
        expect(stakingModal.get("#amountStakedValue").text()).toBe("0.31669471ℏ$0.07792")
        expect(stakingModal.get("#currentlyStakedToValue").text()).toBe("Account 0.0.7")
        expect(changeButton.text()).toBe("CHANGE")
        // expect(changeButton.attributes("disabled")).toBeDefined()

        // 3.3) Select "Stake To Node" radio box
        const stakingToNodeRadio = stakingRadios[0]
        await stakingToNodeRadio.setValue(true)

        // 3.4) Choose node #2
        const stakeToNodeSelect = stakingModal.get<HTMLSelectElement>("select")
        const stakeToNodeOptions = stakeToNodeSelect.findAll("option")
        expect(stakeToNodeOptions.length).toBe(SAMPLE_NETWORK_NODES.nodes.length)
        for (let i = 0; i < 3; i += 1) {
            expect(stakeToNodeOptions[i].element.value).toBe(i.toString())
        }
        await stakeToNodeSelect.setValue("2")
        expect(stakeToNodeSelect.element.value).toBe("2")

        // 3.5) And clicks "CHANGE"
        await changeButton.trigger("click")
        await nextTick()

        // 3.6) Confirms
        await confirmChangeStaking("Change Staking  for account 0.0.730632Do you want to stake to Node 2 - Hosted by Hedera ?CANCELCONFIRM")

        // 3.7) Waits for progress dialog and closes ...
        await waitAndClose("Updating stakingConnecting to Hedera Network using your wallet…Check your wallet for any approval requestCLOSE",
            "Updating stakingOperation completedwith transaction ID:0.0.29624024@1646025139.152901498CLOSE")

        // 3.9) Checks driver
        expect(testDriver.updateAccountCounter).toBe(2)
        expect(testDriver.account.staked_node_id).toBe(2)
        expect(testDriver.account.staked_account_id).toBeNull()
        expect(testDriver.account.decline_reward).toBeTruthy()

        // 3.8) Checks staking information
        expect(ndis[0].text()).toBe("Staked toNode 2 - Hosted by Hedera since Nov 11, 2022, 00:00 UTC")
        expect(ndis[1].text()).toBe("My Stake0.31669471HBAR")
        expect(ndis[2].text()).toBe("Pending RewardNone")


        //
        // 4) Accept reward
        //

        // 4.1) Clicks "CHANGE STAKING"
        await wrapper.get("#showStakingDialog").trigger("click")
        await flushPromises()

        // 4.2) Checks StakingDialog content
        expect(stakingModal.element.classList.contains("is-active")).toBeTruthy()
        expect(stakingModal.get("#amountStakedValue").text()).toBe("0.31669471ℏ$0.07792")
        expect(stakingModal.get("#currentlyStakedToValue").text()).toBe("Node 2 - Hosted by Hedera")
        expect(changeButton.text()).toBe("CHANGE")
        // expect(changeButton.attributes("disabled")).toBeDefined()

        // 4.3) Uncheck "Decline Rewards" box
        const stakingCheckBoxes = stakingModal.findAll<HTMLInputElement>("input[type='checkbox']")
        expect(stakingCheckBoxes.length).toBe(1)
        const declineRewardBox = stakingCheckBoxes[0]
        await declineRewardBox.setValue(false)

        // 4.4) And clicks "CHANGE"
        await changeButton.trigger("click")
        await nextTick()

        // 4.5) Confirms
        await confirmChangeStaking("Change Staking  for account 0.0.730632Do you want to accept rewards?CANCELCONFIRM")

        // 4.6) Waits for progress dialog and closes ...
        await waitAndClose("Updating stakingConnecting to Hedera Network using your wallet…Check your wallet for any approval requestCLOSE",
            "Updating stakingOperation completedwith transaction ID:0.0.29624024@1646025139.152901498CLOSE")

        // 4.7) Checks driver
        expect(testDriver.updateAccountCounter).toBe(3)
        expect(testDriver.account.staked_node_id).toBe(2)
        expect(testDriver.account.staked_account_id).toBeNull()
        expect(testDriver.account.decline_reward).toBeFalsy()

        // 4.8) Checks staking information
        expect(ndis[0].text()).toBe("Staked toNode 2 - Hosted by Hedera since Nov 11, 2022, 00:00 UTC")
        expect(ndis[1].text()).toBe("My Stake0.31669471HBAR")
        expect(ndis[2].text()).toBe("Pending RewardNone")


        //
        // 5) Stop staking
        //

        // 5.1) Clicks "STOP STAKING"
        await wrapper.get("#stopStakingButton").trigger("click")

        // 5.2) Confirms
        const confirm = async (expectedText: string) => {
            const confirmDialog = wrapper.findAllComponents(ConfirmDialog)[1]
            expect(confirmDialog.text()).toBe(expectedText)
            const confirmButtons = confirmDialog.findAll("button")
            expect(confirmButtons.length).toBe(2) // Cancel and Confirm
            expect(confirmButtons[1].text()).toBe("CONFIRM")
            await confirmButtons[1].trigger("click")
            await flushPromises()
        }
        await confirm("My Staking  for account 0.0.730632Do you want to stop staking to Node 2 - Hosted by Hedera ?CANCELCONFIRM")

        // 5.3) Waits for progress dialog and closes ...
        await waitAndClose("Stopping stakingCompleting operation…This may take a few secondsCLOSE",
            "Stopping stakingOperation completedwith transaction ID:0.0.29624024@1646025139.152901498CLOSE")

        // 5.4) Checks driver
        expect(testDriver.updateAccountCounter).toBe(4)
        expect(testDriver.account.staked_node_id).toBeNull()
        expect(testDriver.account.staked_account_id).toBeNull()
        expect(testDriver.account.decline_reward).toBeFalsy()

        // 5.5) Checks staking information
        expect(ndis[0].text()).toBe("Staked toNone")
        expect(ndis[1].text()).toBe("My StakeNone")
        expect(ndis[2].text()).toBe("Pending RewardNone")

        //
        // 6) Disconnection
        //

        // 6.1) Clicks "DISCONNECT WALLET"
        await topNavBarWrapper.get("#walletInfoBanner").trigger("click")
        await walletInfoWrapper.get("#disconnectWalletButton").trigger("click")
        await flushPromises()
        expect(walletManager.getActiveDriver()).toStrictEqual(testDriver)
        expect(walletManager.connected.value).toBeFalsy()
        expect(walletManager.accountIds.value).toStrictEqual([])
        expect(walletManager.accountId.value).toBeNull()

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    })

});
