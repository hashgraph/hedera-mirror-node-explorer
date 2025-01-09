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

import {describe, expect, it} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils"
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "@/utils/HMSF";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import {
    SAMPLE_ACCOUNT,
    SAMPLE_ACCOUNT_STAKING_ACCOUNT,
    SAMPLE_ACCOUNTS,
    SAMPLE_NETWORK_EXCHANGERATE,
    SAMPLE_NETWORK_NODES,
} from "../Mocks";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import {waitFor} from "@/utils/TimerUtils";
import StakingDialog from "@/components/staking/StakingDialog.vue";
import {nextTick} from "vue";
import router from "@/router";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("ChangeStakingDialog.vue", () => {

    it("provides valid account to stake to", async () => {

        // Checks CONFIRM dialog
        const confirmChangeStaking = async (expectedText: string) => {
            const changeConfirmDialog = wrapper.getComponent(ConfirmDialog)
            expect(changeConfirmDialog.text()).toBe(expectedText)
            const changeConfirmButtons = changeConfirmDialog.findAll("button")
            expect(changeConfirmButtons.length).toBe(2) // Cancel and Confirm
            expect(changeConfirmButtons[1].text()).toBe("CONFIRM")
            await changeConfirmButtons[1].trigger("click")
            await nextTick()
        }

        // Checks CANCEL dialog
        const cancelChangeStaking = async (expectedText: string) => {
            const changeConfirmDialog = wrapper.getComponent(ConfirmDialog)
            expect(changeConfirmDialog.text()).toBe(expectedText)
            const changeConfirmButtons = changeConfirmDialog.findAll("button")
            expect(changeConfirmButtons.length).toBe(2) // Cancel and Confirm
            expect(changeConfirmButtons[0].text()).toBe("CANCEL")
            await changeConfirmButtons[0].trigger("click")
            await nextTick()
        }

        await router.push("/") // To avoid "missing required param 'network'" error

        // Account for which we want to update staking
        const TARGET_ACCOUNT = SAMPLE_ACCOUNT_STAKING_ACCOUNT

        // Mocks axios
        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT)
        const matcher2 = "/api/v1/network/nodes"
        for (const node of SAMPLE_NETWORK_NODES.nodes) {
            const body = {params: {"node.id": node.node_id}}
            const response = {nodes: [node]}
            mock.onGet(matcher2, body).reply(200, response)
        }
        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_NODES)
        const matcher3 = "api/v1/network/exchangerate"
        mock.onGet(matcher3).reply(200, SAMPLE_NETWORK_EXCHANGERATE);
        const matcher4 = "/api/v1/accounts"
        const body = {params: {"account.id": "0.0.7", balance: false}}
        mock.onGet(matcher4, body).reply(200, SAMPLE_ACCOUNTS)

        const wrapper = mount(StakingDialog, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                showDialog: true,
                account: TARGET_ACCOUNT,
                currentlyStakedTo: "Account " + TARGET_ACCOUNT.staked_account_id,
            },
        });

        await flushPromises()

        const stakingModals = wrapper.findAll(".modal")
        expect(stakingModals.length).toBeGreaterThanOrEqual(2)
        const stakingModal = stakingModals[1]
        // console.log(stakingModal.text())

        expect(stakingModal.element.classList.contains("is-active")).toBeTruthy()
        expect(stakingModal.get("#amountStakedValue").text()).toBe("0.31669471ℏ$0.07792")
        expect(stakingModal.get("#currentlyStakedToValue").text()).toBe("Account 0.0.5")
        const buttons = stakingModal.findAll("button")
        expect(buttons.length).toBe(2) // Cancel and Change
        const changeButton = buttons[1]
        expect(changeButton.text()).toBe("CHANGE")

        // Selects "Stake To Account" radio box
        const stakingRadios = stakingModal.findAll<HTMLInputElement>("input[type='radio']")
        expect(stakingRadios.length).toBe(2)
        const stakingToAccountRadio = stakingRadios[1]
        await stakingToAccountRadio.setValue(true)

        const newStakeToAccountInput = stakingModal.get<HTMLInputElement>("input[type='text']")
        const feedbackMessage = stakingModal.get('#feedbackMessage')

        //
        // Valid EntityID:  "7"
        //
        await newStakeToAccountInput.setValue("7")
        expect(newStakeToAccountInput.element.value).toBe("7")
        await waitFor(1000)
        await flushPromises()
        expect(feedbackMessage.text()).toBe("Rewards will now be paid to that account")

        // Clicks "CANCEL"
        await changeButton.trigger("click")
        await nextTick()
        await cancelChangeStaking("Change Staking  for account 0.0.730632Do you want to stake to account 0.0.7-bmurp ?CANCELCONFIRM")

        //
        // Valid EntityID:  "0.0.7"
        //
        await newStakeToAccountInput.setValue("0.0.7")
        expect(newStakeToAccountInput.element.value).toBe("0.0.7")
        await waitFor(1000)
        await flushPromises()
        expect(feedbackMessage.text()).toBe("Rewards will now be paid to that account")

        // Clicks "CANCEL"
        await changeButton.trigger("click")
        await nextTick()
        await cancelChangeStaking("Change Staking  for account 0.0.730632Do you want to stake to account 0.0.7-bmurp ?CANCELCONFIRM")

        //
        // Valid EntityID:  "0.0.7-bmurp"
        //
        await newStakeToAccountInput.setValue("0.0.7-bmurp")
        expect(newStakeToAccountInput.element.value).toBe("0.0.7-bmurp")
        await waitFor(1000)
        await flushPromises()
        expect(feedbackMessage.text()).toBe("Rewards will now be paid to that account")

        // Clicks "CHANGE"
        await changeButton.trigger("click")
        await nextTick()
        await confirmChangeStaking("Change Staking  for account 0.0.730632Do you want to stake to account 0.0.7-bmurp ?CANCELCONFIRM")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    })

    it("provides invalid values for account to stake to", async () => {

        await router.push("/testnet/")

        // Account for which we want to update staking
        const TARGET_ACCOUNT = SAMPLE_ACCOUNT_STAKING_ACCOUNT

        // Mocks axios
        const mock = new MockAdapter(axios);
        const matcher1 = "/api/v1/accounts/" + SAMPLE_ACCOUNT.account
        mock.onGet(matcher1).reply(200, SAMPLE_ACCOUNT)
        const matcher2 = "/api/v1/network/nodes"
        for (const node of SAMPLE_NETWORK_NODES.nodes) {
            const body = {params: {"node.id": node.node_id}}
            const response = {nodes: [node]}
            mock.onGet(matcher2, body).reply(200, response)
        }
        mock.onGet(matcher2).reply(200, SAMPLE_NETWORK_NODES)
        const matcher3 = "api/v1/network/exchangerate"
        mock.onGet(matcher3).reply(200, SAMPLE_NETWORK_EXCHANGERATE);
        const matcher4 = "/api/v1/accounts"
        const body = {params: {"account.id": "0.0.7", balance: false}}
        mock.onGet(matcher4, body).reply(200, SAMPLE_ACCOUNTS)

        const wrapper = mount(StakingDialog, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                showDialog: true,
                account: TARGET_ACCOUNT,
                currentlyStakedTo: "Account " + TARGET_ACCOUNT.staked_account_id,
            },
        });

        await flushPromises()

        const stakingModals = wrapper.findAll(".modal")
        expect(stakingModals.length).toBeGreaterThanOrEqual(2)
        const stakingModal = stakingModals[1]
        // console.log(stakingModal.text())

        expect(stakingModal.element.classList.contains("is-active")).toBeTruthy()
        expect(stakingModal.get("#amountStakedValue").text()).toBe("0.31669471ℏ$0.07792")
        expect(stakingModal.get("#currentlyStakedToValue").text()).toBe("Account 0.0.5")
        const buttons = stakingModal.findAll("button")
        expect(buttons.length).toBe(2) // Cancel and Change
        const changeButton = buttons[1]
        expect(changeButton.text()).toBe("CHANGE")

        // Selects "Stake To Account" radio box
        const stakingRadios = stakingModal.findAll<HTMLInputElement>("input[type='radio']")
        expect(stakingRadios.length).toBe(2)
        const stakingToAccountRadio = stakingRadios[1]
        await stakingToAccountRadio.setValue(true)

        const newStakeToAccountInput = stakingModal.get<HTMLInputElement>("input[type='text']")
        const feedbackMessage = stakingModal.get('#feedbackMessage')

        //
        // Invalid input:  "0.0.7abcde"
        //
        await newStakeToAccountInput.setValue("0.0.7abcde")
        expect(newStakeToAccountInput.element.value).toBe("")
        await waitFor(500)
        await flushPromises()
        expect(feedbackMessage.text()).toBe("")

        //
        // Invalid account ID:  ".0.7"
        //
        await newStakeToAccountInput.setValue(".0.7")
        expect(newStakeToAccountInput.element.value).toBe(".0.7")
        await waitFor(500)
        await flushPromises()
        expect(feedbackMessage.text()).toBe("Invalid account ID")

        //
        // Invalid checksum:  "0.0.7-"
        //
        await newStakeToAccountInput.setValue("0.0.7-")
        expect(newStakeToAccountInput.element.value).toBe("0.0.7-")
        await waitFor(500)
        await flushPromises()
        expect(feedbackMessage.text()).toBe("Invalid checksum")

        //
        // Invalid checksum:  "0.0.7-abcde"
        //
        await newStakeToAccountInput.setValue("0.0.7-abcde")
        expect(newStakeToAccountInput.element.value).toBe("0.0.7-abcde")
        await waitFor(500)
        await flushPromises()
        expect(feedbackMessage.text()).toBe("Invalid checksum")

        //
        // Account does not exist:  "7.0.0"
        //
        await newStakeToAccountInput.setValue("7.0.0")
        expect(newStakeToAccountInput.element.value).toBe("7.0.0")
        await waitFor(500)
        await flushPromises()
        expect(feedbackMessage.text()).toBe("This account does not exist")

        mock.restore()
        wrapper.unmount()
        await flushPromises()
    })
});
