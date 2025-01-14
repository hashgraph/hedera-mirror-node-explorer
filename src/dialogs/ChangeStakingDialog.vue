<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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

  <Dialog :controller="controller" :width="900">

    <!-- title -->
    <template #dialogTitle>
      <DialogTitle>
        <span>
          <span class="h-is-primary-title">Change Staking </span>
          <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
          <span v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3">{{ accountId }}</span>
        </span>
      </DialogTitle>
    </template>

    <!-- input -->
    <template #dialogInput>

      <Property id="amountStaked">
        <template v-slot:name>Amount Staked</template>
        <template v-slot:value>
          <HbarAmount v-if="props.account?.balance?.balance" :amount="props.account.balance.balance" timestamp="0"
                      :show-extra="true"/>
        </template>
      </Property>

      <Property id="currentlyStakedTo">
        <template v-slot:name>Currently Staked To</template>
        <template v-slot:value>
            <span v-if="props.account?.staked_node_id !== null" class="icon is-small has-text-info mr-2"
                  style="font-size: 16px">
              <i v-if="currentStakedNodeIcon" :class="currentStakedNodeIcon"></i>
            </span>
          <StringValue v-if="props.account" :string-value="props.currentlyStakedTo"/>
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
              <SelectView v-model="selectedNode" @focus="stakeChoice='node'">
                <optgroup label="Hedera council nodes">
                  <option v-for="n in nodes" :key="n.node_id" :value="n.node_id"
                          style="background-color: var(--h-theme-box-background-color)"
                          v-show="isCouncilNode(n)">
                    {{ makeNodeSelectorDescription(n) }}
                  </option>
                </optgroup>
                <optgroup v-if="hasCommunityNode" label="Community nodes">
                  <option v-for="n in nodes" :key="n.node_id" :value="n.node_id"
                          style="background-color: var(--h-theme-box-background-color)"
                          v-show="!isCouncilNode(n)">
                    {{ makeNodeSelectorDescription(n) }}
                  </option>
                </optgroup>
              </SelectView>
            </div>
          </div>
          <div class="columns">
            <div class="column is-one-fifth pt-0">
              <div class="control" style="width: 100px">
                <label class="radio h-radio-button ml-0">
                  <input name="stakeTarget" type="radio" value="props.account" v-model="stakeChoice">
                  Account
                </label>
              </div>
            </div>
            <div class="column pt-0">
              <div class="is-flex is-align-items-center">
                <input class="input is-small has-text-right has-text-white" type="text" placeholder="0.0.1234"
                       :class="{'has-text-grey': !isAccountSelected}"
                       :value="selectedAccount"
                       @focus="stakeChoice='props.account'"
                       @input="handleInput"
                       style="min-width: 13rem; max-width: 13rem; height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                         background-color: var(--h-theme-box-background-color)">

                <div v-if="isAccountSelected" id="feedbackMessage"
                     :class="{'has-text-grey': isSelectedAccountValid, 'has-text-danger': !isSelectedAccountValid}"
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
            <input type="checkbox" v-model="declineChoice" :disabled="!isNodeSelected || selectedNode == null">
          </label>
        </div>
      </div>

      <Property v-if="false" id="changeCost">
        <template v-slot:name>Change Transaction Cost</template>
        <template v-slot:value>
          <HbarAmount v-if="props.account" :amount="10000000" timestamp="0" :show-extra="true" :decimals="1"/>
        </template>
      </Property>

    </template>

    <!-- busy -->
    <template #dialogBusy>
      <div class="h-is-tertiary-text mb-4">
        Connecting to Hedera Network using your wallet…
      </div>
      <div class="h-is-property-text">
        Check your wallet for any approval request
      </div>
    </template>

    <!-- success -->
    <template #dialogSuccess>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-success ml-0">
          <i class="fas fa-check"/>
        </div>
        <div class="h-is-tertiary-text mb-4">
          Operation completed
        </div>
      </div>
      <div v-if="progressExtraTransactionId" class="h-is-property-text">
        {{ 'With transaction ID: ' + progressExtraTransactionId }}
      </div>
    </template>

    <!-- error -->
    <template #dialogError>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-danger">
          <span style="font-size: 18px; font-weight: 900">X</span>
        </div>
        <div class="h-is-tertiary-text mb-4">
          {{ mainErrorMessage }}
        </div>
      </div>
      <div class="h-is-property-text">
        {{ extraErrorMessage }}
      </div>
    </template>

    <template #dialogInputButtons>
      <DialogButton :controller="controller">CANCEL</DialogButton>
      <CommitButton :controller="controller" :enabled="enableChangeButton" @action="handleChange">CHANGE</CommitButton>
    </template>

  </Dialog>

  <ConfirmDialog v-model:show-dialog="showConfirmDialog" :main-message="confirmMessage"
                 @onConfirm="handleConfirmChange" @onCancel="handleCancelChange">
    <template v-slot:confirmTitle>
      <span>Change Staking </span>
      <span v-if="accountId"> for account {{ accountId }}</span>
    </template>
  </ConfirmDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, PropType, ref, watch} from "vue";
import {
  AccountBalanceTransactions,
  AccountsResponse,
  makeNodeSelectorDescription,
  makeShortNodeDescription,
  NetworkNode
} from "@/schemas/MirrorNodeSchemas.ts";
import Property from "@/components/Property.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StringValue from "@/components/values/StringValue.vue";
import axios from "axios";
import {EntityID} from "@/utils/EntityID.ts";
import Dialog from "@/dialogs/core/dialog/Dialog.vue";
import DialogTitle from "@/dialogs/core/dialog/DialogTitle.vue";
import CommitButton from "@/dialogs/core/dialog/CommitButton.vue";
import DialogButton from "@/dialogs/core/dialog/DialogButton.vue";
import {DialogController, DialogMode} from "@/dialogs/core/dialog/DialogController.ts";
import ConfirmDialog from "@/dialogs/ConfirmDialog.vue";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {routeManager, walletManager} from "@/router.ts";
import {NodeAnalyzer} from "@/utils/analyzer/NodeAnalyzer.ts";
import {extractChecksum, isCouncilNode, makeDefaultNodeDescription, stripChecksum} from "@/schemas/MirrorNodeUtils.ts";
import SelectView from "@/components/SelectView.vue";
import {TransactionID} from "@/utils/TransactionID.ts";
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient.ts";

const VALID_ACCOUNT_MESSAGE = "Rewards will now be paid to that account"
const UNKNOWN_ACCOUNT_MESSAGE = "This account does not exist"
const INVALID_ACCOUNTID_MESSAGE = "Invalid account ID"
const INVALID_CHECKSUM_MESSAGE = "Invalid checksum"
const CANT_STAKE_SAME_ACCOUNT_MESSAGE = "Cannot stake to one's own account"

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  account: Object as PropType<AccountBalanceTransactions>,
  currentlyStakedTo: String,
})

const emit = defineEmits(["stakingChanged"])

const controller = new DialogController(showDialog)

const accountId = computed(() => props.account?.account)
const network = routeManager.currentNetwork.value
const nr = NetworkConfig.inject()

const showConfirmDialog = ref(false)
const confirmMessage = computed(() => {
  let result: string
  if (isNodeSelected.value) {
    if (selectedNode.value !== props.account?.staked_node_id) {
      result = "Do you want to stake to Node " + selectedNodeDescription.value + "?"
    } else {
      result = declineChoice.value ? "Do you want to decline rewards?" : "Do you want to accept rewards?"
    }
  } else {
    result = "Do you want to stake to account "
        + nr.makeAddressWithChecksum(selectedAccountEntity.value ?? "", network)
        + " ?"
  }
  return result
})

const nodeAnalyzer = new NodeAnalyzer(computed(() => props.account?.staked_node_id ?? 0))
onMounted(() => nodeAnalyzer.mount())
onBeforeUnmount(() => nodeAnalyzer.unmount())

const nodes = nodeAnalyzer.networkAnalyzer.nodes
const hasCommunityNode = nodeAnalyzer.networkAnalyzer.hasCommunityNode

const currentStakedNodeIcon = computed(() => {
  let result: string | null
  if (props.account?.staked_node_id !== null) {
    result = nodeAnalyzer.isCouncilNode.value
        ? "fas fa-building"
        : "fas fa-users"
  } else {
    result = null
  }
  return result
})

const stakeChoice = ref("node")
const isNodeSelected = computed(() => stakeChoice.value === 'node')
const isAccountSelected = computed(() => stakeChoice.value === 'account')

const selectedAccount = ref<string | null>(null)
const selectedAccountEntity = computed(
    () => EntityID.normalize(stripChecksum(selectedAccount.value ?? "")))
const selectedAccountChecksum = computed(
    () => extractChecksum(selectedAccount.value ?? ""))
const isSelectedAccountValid = ref(false)
const inputFeedbackMessage = ref<string | null>(null)

let validationTimerId = -1

watch(selectedAccount, () => {
  isSelectedAccountValid.value = false
  inputFeedbackMessage.value = null

  if (validationTimerId != -1) {
    window.clearTimeout(validationTimerId)
    validationTimerId = -1
  }
  if (selectedAccount.value?.length) {
    validationTimerId = window.setTimeout(() => validateAccount(), 500)
  } else {
    selectedAccount.value = null
  }
})

const selectedNode = ref<number | null>(null)
//
// const selectedNodeIcon = computed(() => {
//   let result
//   if (selectedNode.value !== null) {
//     const nodes = nodeAnalyzer.networkAnalyzer.nodes
//     result = isCouncilNode(nodes.value[selectedNode.value]) ? "building" : "users"
//   } else {
//     result = ""
//   }
//   return result
// })

const selectedNodeDescription = computed(() => {
  const nodes = nodeAnalyzer.networkAnalyzer.nodes
  return selectedNode.value !== null
      ? makeNodeDescription(nodes.value[selectedNode.value])
      : null
})
watch(accountId, () => {
  if (isNodeSelected.value && selectedNode.value == null) {
    selectedNode.value = props.account?.staked_node_id ?? null
  }
})

const declineChoice = ref(false)
watch(accountId, () => declineChoice.value = props.account?.decline_reward ?? false)

const enableChangeButton = computed(() => {
  return (
          isAccountSelected.value && isSelectedAccountValid.value && props.account?.staked_account_id != selectedAccountEntity.value)
      || (isNodeSelected.value && selectedNode.value !== null && props.account?.staked_node_id != selectedNode.value)
      || (props.account?.decline_reward != declineChoice.value)
})

const handleChange = () => {
  showConfirmDialog.value = true
}

const handleCancelChange = () => {
  showDialog.value = true
}

const handleConfirmChange = () => {
  const stakedNode = isNodeSelected.value ? selectedNode.value : null
  const stakedAccount = isAccountSelected.value ? stripChecksum(selectedAccount.value ?? "") : null
  const declineReward = declineChoice.value != props.account?.decline_reward ? declineChoice.value : null;
  changeStaking(stakedNode, stakedAccount, declineReward)
}

//
// changeStaking
//

const progressExtraTransactionId = ref<string | null>(null)
const transactionError = ref<unknown>(null)

const changeStaking = async (nodeId: number | null, accountId: string | null, declineReward: boolean | null) => {

  try {

    controller.mode.value = DialogMode.Busy
    const transactionId = await walletManager.changeStaking(nodeId, accountId, declineReward)
    controller.mode.value = DialogMode.Success
    progressExtraTransactionId.value = TransactionID.normalize(transactionId)
    emit("stakingChanged")

  } catch (error) {

    if (error instanceof WalletClientRejectError) {
      controller.visible.value = false
    } else {
      controller.mode.value = DialogMode.Error
      transactionError.value = error
      progressExtraTransactionId.value = null
    }

  }

}

const mainErrorMessage = computed(() => {
  let result: string
  if (transactionError.value instanceof WalletClientError) {
    result = transactionError.value.message
  } else {
    result = "Operation did not complete"
  }
  return result
})

const extraErrorMessage = computed(() => {
  let result: string
  if (transactionError.value instanceof WalletClientError) {
    result = transactionError.value.extra
  } else {
    result = JSON.stringify(transactionError.value)
  }
  return result
})

//
// Nodes
//

const makeNodeDescription = (node: NetworkNode) => {
  let description = node.description ?? makeDefaultNodeDescription(node.node_id ?? null)
  return description ? (node.node_id + " - " + makeShortNodeDescription(description)) : null
}

const handleInput = (event: Event) => {
  const previousValue = selectedAccount.value
  let isValidInput = true
  let isValidID = false
  let isPastDash = false

  const value = (event.target as HTMLInputElement).value
  for (const c of value) {
    if ((c >= '0' && c <= '9') || c === '.') {
      if (isPastDash) {
        isValidInput = false
        break
      } else {
        isValidID = EntityID.parse(stripChecksum(value)) !== null
      }
    } else if (c === '-') {
      if (!isValidID || isPastDash) {
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

const validateAccount = () => {
  if (selectedAccountEntity.value === null) {
    inputFeedbackMessage.value = INVALID_ACCOUNTID_MESSAGE
  } else if (selectedAccountChecksum.value === null
      || nr.isValidChecksum(selectedAccountEntity.value ?? "", selectedAccountChecksum.value, network)) {

    if (selectedAccountEntity.value == accountId.value) {
      inputFeedbackMessage.value = CANT_STAKE_SAME_ACCOUNT_MESSAGE
    } else {

      const params = {
        'account.id': selectedAccountEntity.value,
        balance: false
      }
      axios
          .get<AccountsResponse>("api/v1/accounts", {params: params})
          .then((response) => {
            const accounts = response.data.accounts
            if (accounts && accounts.length > 0) {
              isSelectedAccountValid.value = true
              if (props.account?.staked_account_id != selectedAccountEntity.value) {
                inputFeedbackMessage.value = VALID_ACCOUNT_MESSAGE
              }
            } else {
              inputFeedbackMessage.value = UNKNOWN_ACCOUNT_MESSAGE
            }
          })
          .catch(() => inputFeedbackMessage.value = UNKNOWN_ACCOUNT_MESSAGE)

    }
  } else {
    inputFeedbackMessage.value = INVALID_CHECKSUM_MESSAGE
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

