<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -      http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  -->

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>

  <ConfirmDialog v-model:show-dialog="showConfirmDialog" :main-message="confirmMessage"
                 @onConfirm="handleConfirmChange" @onCancel="handleCancelChange">
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">Change Staking </span>
      <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
      <span v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3"
            style="line-height: 36px">{{ accountId }}</span>
    </template>
  </ConfirmDialog>

  <div :class="{'is-active': showDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px; border-radius: 16px">
      <div class="box">
        <div class="is-flex is-justify-content-space-between is-align-items-self-end">
          <span>
            <span class="h-is-primary-title">Change Staking </span>
            <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
            <span v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3">{{ accountId }}</span>
          </span>
          <a @click="handleCancel">
            <img alt="Search bar" src="@/assets/close-icon.png" style="max-height: 20px;">
          </a>
        </div>
        <hr class="h-card-separator"/>

        <Property id="amountStaked">
          <template v-slot:name>Amount Staked</template>
          <template v-slot:value>
            <HbarAmount v-if="account" :amount="account.balance.balance" :show-extra="true"/>
          </template>
        </Property>

        <Property id="currentlyStakedTo">
          <template v-slot:name>Currently Staked To</template>
          <template v-slot:value>
            <StringValue v-if="account" :string-value="currentlyStakedTo"/>
          </template>
        </Property>

        <div class="columns">
          <div class="column is-one-third has-text-weight-light">
            Stake To
          </div>
          <div class="column">
            <div class="columns">
              <div class="column is-one-fifth">
                <div class="control" style="width: 100px">
                  <label class="radio h-radio-button">
                    <input name="stakeTarget" type="radio" value="node" v-model="stakeChoice">
                    Node
                  </label>
                </div>
              </div>
              <div class="column">
                <o-field>
                <o-select v-model="selectedNode" :class="{'has-text-grey': !isNodeSelected}"
                          class="h-is-text-size-1" style="border-radius: 4px"  @focus="stakeChoice='node'">
                  <option v-for="n in nodes" :key="n.node_id" :value="n.node_id"
                          style="background-color: var(--h-theme-box-background-color)">
                    {{ makeNodeDescription(n) }} - {{ makeNodeStake(n) }}
                  </option>
                </o-select>
              </o-field>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-fifth pt-0">
                <div class="control" style="width: 100px">
                <label class="radio h-radio-button ml-0">
                  <input name="stakeTarget" type="radio" value="account" v-model="stakeChoice">
                  Account
                </label>
                </div>
              </div>
              <div class="column pt-0">
                <div class="is-flex is-align-items-center">
                  <input class="input is-small has-text-right has-text-white" type="text" placeholder="0.0.1234"
                         :class="{'has-text-grey': !isAccountSelected}"
                         :value="selectedAccount"
                         @focus="stakeChoice='account'"
                         @input="event => handleInput(event.target.value)"
                         style="min-width: 13rem; max-width: 13rem; height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                         background-color: var(--h-theme-box-background-color)">

                  <div v-if="isAccountSelected"
                       :class="{'has-text-grey': isSelectedAccountValidated, 'has-text-danger': !isSelectedAccountValidated}"
                       class="is-inline-block h-is-text-size-2 ml-3">
                    {{ inputFeedbackMessage }}
                  </div>
                </div>
              </div>

          </div>
        </div>
        </div>
        <div class="columns">
          <div class="column is-one-third has-text-weight-light pt-0">
            Decline Rewards
          </div>
          <div class="column pt-0">
            <label class="checkbox">
              <input checked="checked" type="checkbox" v-model="declineChoice" :disabled="!isNodeSelected || selectedNode == null">
            </label>
          </div>
        </div>

        <Property id="changeCost">
          <template v-slot:name>Change Transaction Cost</template>
          <template v-slot:value>
            <HbarAmount v-if="account" :amount="10000000" :show-extra="true" :decimals="1"/>
          </template>
        </Property>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
          <button class="button is-info is-small ml-4"
                  :disabled="!enableChangeButton" @click="handleChange">CHANGE</button>
        </div>

      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, PropType, ref, watch} from "vue";
import {AccountBalanceTransactions, NetworkNode} from "@/schemas/HederaSchemas";
import {NodesLoader} from "@/components/node/NodesLoader";
import Property from "@/components/Property.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StringValue from "@/components/values/StringValue.vue";
import axios from "axios";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import {EntityID} from "@/utils/EntityID";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

const VALID_ACCOUNT_MESSAGE = "Rewards will now be paid to that account"
const UNKNOWN_ACCOUNT_MESSAGE = "This account does not exist"
const INVALID_ACCOUNTID_MESSAGE = "Invalid account ID"
const INVALID_CHECKSUM_MESSAGE = "Invalid checksum"
const CANT_STAKE_SAME_ACCOUNT_MESSAGE = "Cannot stake to one's own account"

export default defineComponent({
  name: "StakingDialog",
  components: {ConfirmDialog, StringValue, HbarAmount, Property},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    account: Object as PropType<AccountBalanceTransactions>,
    currentlyStakedTo: String,
  },
  emits: [ "changeStaking", "update:showDialog"],
  setup(props, context) {
    const accountId = computed(() => props.account?.account)

    const showConfirmDialog = ref(false)
    const confirmMessage = computed(() => {
          let result: string
          if (isNodeSelected.value) {
            if (selectedNode.value !== props.account?.staked_node_id) {
              result = "Do you want to stake to " + selectedNodeDescription.value + "?"
            } else {
              result = declineChoice.value ? "Do you want to decline rewards?" : "Do you want to accept rewards?"
            }
          } else {
            result = "Do you want to stake to account " + selectedAccount.value
          }
          return result
        })

    const stakeChoice = ref("node")
    const isNodeSelected = computed(() => stakeChoice.value === 'node')
    const isAccountSelected = computed(() => stakeChoice.value === 'account')

    const selectedAccount = ref<string | null>(null)
    const isSelectedAccountValidated = ref(false)
    const showUnknownAccountMessage = ref(false)
    const showInvalidAccountIDMessage = ref(false)
    const inputFeedbackMessage = ref<string | null>(null)

    let validationTimerId = -1

    watch(selectedAccount, () => {
      showUnknownAccountMessage.value = false
      showInvalidAccountIDMessage.value = false
      isSelectedAccountValidated.value = false
      inputFeedbackMessage.value = null

      if (validationTimerId != -1) {
        window.clearTimeout(validationTimerId)
        validationTimerId = -1
      }
      if (selectedAccount.value?.length) {
        validationTimerId = window.setTimeout(
            () => validateAccount(selectedAccount.value ?? ""),
            500)
      } else {
        selectedAccount.value = null
      }
    })

    const selectedNode = ref<number|null>(null)
    const selectedNodeDescription = computed(() => {
      return (selectedNode.value && nodesLoader.nodes.value) ? makeNodeDescription(nodesLoader.nodes.value[selectedNode.value]) : null
    })
    watch(accountId, () => {
      if ( isNodeSelected.value && selectedNode.value == null) {
        selectedNode.value = props.account?.staked_node_id ?? null
      }
    })

    const declineChoice = ref(false)
    watch(accountId, () => declineChoice.value = props.account?.decline_reward ?? false)

    const enableChangeButton = computed(() => {
      return (
          isAccountSelected.value && isSelectedAccountValidated.value && props.account?.staked_account_id != selectedAccount.value)
          || (isNodeSelected.value  && selectedNode.value && props.account?.staked_node_id != selectedNode.value)
          || (props.account?.decline_reward != declineChoice.value)
    })

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleChange = () => {
      context.emit('update:showDialog', false)
      showConfirmDialog.value = true
    }

    const handleCancelChange = () => {
      context.emit('update:showDialog', true)
    }

    const handleConfirmChange = () => {
      const stakedNode = isNodeSelected.value ? selectedNode.value : null
      const stakedAccount = isAccountSelected.value ? EntityID.stripChecksum(selectedAccount.value ?? "") : null
      const declineReward = declineChoice.value != props.account?.decline_reward ? declineChoice.value : null;
      context.emit("changeStaking", stakedNode, stakedAccount, declineReward)
    }

    //
    // Nodes
    //

    const nodesLoader = new NodesLoader()
    onMounted(() => nodesLoader.requestLoad())

    const makeNodeDescription = (node: NetworkNode) => {
      let result
      if (node.description) {
        result = node.description
      } else {
        result = node.node_account_id ? operatorRegistry.makeDescription(node.node_account_id) : null
      }
      return result
    }

    const makeNodeStake = (node: NetworkNode) => {
      const amountFormatter = new Intl.NumberFormat("en-US", {
        maximumFractionDigits: 0
      })
      const percentFormatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 1
      })
      const unclampedStakeAmount = ((node.stake_rewarded ?? 0) + (node.stake_not_rewarded ?? 0))/100000000
      const percentMin = node.min_stake ? unclampedStakeAmount / (node.min_stake / 100000000) : 0
      const percentMax = node.max_stake ? unclampedStakeAmount / (node.max_stake / 100000000) : 0

      let result = amountFormatter.format(unclampedStakeAmount) + "ℏ staked"
      if (percentMin != 0 && percentMin < 1) {
        result += " (" + percentFormatter.format(percentMin) + " of Min)"
      } else if (percentMax !== 0) {
        result += " (" + percentFormatter.format(percentMax) + " of Max)"
      }
      return result
    }

    const handleInput = (value: string) => {
      const previousValue = selectedAccount.value
      let isValidInput = true
      let isValidID = false
      let isPastDash = false

      for (const c of value) {
        if ((c >= '0' && c <= '9') || c === '.') {
          if (isPastDash) {
            isValidInput = false
            break
          } else {
            isValidID = EntityID.isValid(EntityID.stripChecksum(value))
          }
        } else if (c === '-') {
          if (! isValidID || isPastDash) {
            isValidInput = false
            break
          } else {
            isPastDash = true
          }
        } else if (c < 'a' || c > 'z' || !isPastDash) {
          isValidInput = false
          break
        }
      }

      if (isValidInput) {
        selectedAccount.value = value
      } else {
        selectedAccount.value = ""
        selectedAccount.value = previousValue
      }
    }

    const validateAccount = (stakedAccountId: string) => {
      const entityID = EntityID.stripChecksum(stakedAccountId)
      const checksum = EntityID.extractChecksum(stakedAccountId)

      if (entityID == accountId.value) {
        inputFeedbackMessage.value = CANT_STAKE_SAME_ACCOUNT_MESSAGE
      } else if (EntityID.isValid(entityID ?? "", checksum)) {
        const params = {} as {
          limit: 1
        }
        axios
            .get<AccountBalanceTransactions>("api/v1/accounts/" + entityID, {params: params})
            .then(() => {
              isSelectedAccountValidated.value = true
              inputFeedbackMessage.value = VALID_ACCOUNT_MESSAGE
            })
            .catch(() => inputFeedbackMessage.value = UNKNOWN_ACCOUNT_MESSAGE)
      } else if (! EntityID.isValid(entityID)) {
        inputFeedbackMessage.value = INVALID_ACCOUNTID_MESSAGE
      } else {
        inputFeedbackMessage.value = INVALID_CHECKSUM_MESSAGE
      }
    }

    return {
      accountId,
      showConfirmDialog,
      confirmMessage,
      stakeChoice,
      isNodeSelected,
      isAccountSelected,
      showUnknownAccountMessage,
      showInvalidAccountIDMessage,
      isSelectedAccountValidated,
      inputFeedbackMessage,
      selectedAccount,
      selectedNode,
      selectedNodeDescription,
      declineChoice,
      enableChangeButton,
      nodes: nodesLoader.nodes,
      handleCancel,
      handleChange,
      handleCancelChange,
      handleConfirmChange,
      makeNodeDescription,
      makeNodeStake,
      handleInput
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

