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
  <Dialog :controller="controller" :width="624">

    <!-- title -->
    <template #dialogTitle>
      <div class="h-is-primary-title">
        Account Update
      </div>
    </template>

    <!-- input -->
    <template #dialogInput>

      <div class="mb-3"/>

      <div class="has-text-weight-light mb-1">
        Account Memo
      </div>
      <input v-model="memo"
             class="input input-field is-small has-text-white"
             style="width: 560px"
             placeholder="Memo (string)"
             type="text"
      >

      <div class="mb-4"/>

      <div class="has-text-weight-light mb-1">
        Max. Auto. Associations
      </div>
      <div class="is-flex is-justify-content-flex-start">
        <o-select v-model="autoAssociationMode"
                  class="is-small has-text-white"
                  style=" height: 38px; border-radius: 2px;border-width: 1px;border-color: grey;
                  background-color: var(--h-theme-page-background-color);"
        >
          <option :key="0" :value="0" style="background-color: var(--h-theme-page-background-color)">
            No Automatic Association
          </option>
          <option :key="1" :value="1" style="background-color: var(--h-theme-page-background-color)">
            Limited Automatic Association
          </option>
          <option :key="-1" :value="-1" style="background-color: var(--h-theme-page-background-color)">
            Unlimited Automatic Association
          </option>
        </o-select>
        <input v-if="autoAssociationMode==AutoAssociationMode.LimitedAutoAssociation"
               class="input input-field is-small has-text-white ml-2"
               style="width: 100px"
               :class="{'is-invisible':autoAssociationMode!=AutoAssociationMode.LimitedAutoAssociation}"
               v-model="maxAutoAssociations"
               placeholder="≥ 0"
               type="number"
        >
      </div>

      <div class="mb-4"/>

      <div class="has-text-weight-light mb-1">
        Auto Renew Period
      </div>
      <div class="is-flex is-justify-content-flex-start">
        <input class="input input-field is-small has-text-white"
               style="width: 130px"
               v-model="selectedAutoRenewPeriod"
               placeholder="≥ 0"
               type="number"
        >
        <o-select v-model="selectedUnit"
                  class="is-small has-text-white ml-2"
                  style=" height: 38px;border-radius: 2px;border-width: 1px;border-color: grey;
                    background-color: var(--h-theme-page-background-color);"
        >
          <option v-for="p in PeriodUnit" :key="p" :value="p"
                  style="background-color: var(--h-theme-page-background-color)">
            {{ p }}
          </option>
        </o-select>
      </div>

      <div class="mb-4"/>

      <div class="is-flex is-align-items-center is-justify-content-space-between">
        <div class="is-flex has-text-weight-light mb-1">
          Receiver Signature Required
        </div>
        <o-switch class="ml-2 h-is-text-size-4" v-model="recSigRequired"/>
      </div>

      <hr style="height: 1px; background: var(--h-theme-background-color);"/>

      <div class="has-text-weight-light mb-1">
        Staking
      </div>
      <div class="radios h-is-text-size-4">
        <label class="radio h-radio-button">
          <input type="radio" name="stakeTarget" :value="StakeChoice.StakeToNode" v-model="stakeChoice"/>
          To Node
        </label>
        <label class="radio h-radio-button ml-5">
          <input type="radio" name="stakeTarget" :value="StakeChoice.StakeToAccount" v-model="stakeChoice"/>
          To Account
        </label>
        <label class="radio h-radio-button ml-5">
          <input type="radio" name="stakeTarget" :value="StakeChoice.NotStaking" v-model="stakeChoice"/>
          Not Staking
        </label>
      </div>

      <div class="mb-4"/>

      <template v-if="stakeChoice===StakeChoice.StakeToNode">
        <div class="has-text-weight-light mb-1">
          Staked Node ID
        </div>
        <o-select v-model="stakedNode"
                  :icon="stakedNodeIcon"
                  class="is-small has-text-white"
                  style=" height: 38px; border-radius: 2px; border-width: 1px; border-color: grey;
                    background-color: var(--h-theme-page-background-color);"
        >
          <optgroup label="Hedera council nodes">
            <option v-for="n in networkAnalyzer.nodes.value" :key="n.node_id" :value="n.node_id"
                    style="background-color: var(--h-theme-page-background-color)"
                    v-show="isCouncilNode(n)"
            >
              {{ makeNodeSelectorDescription(n) }}
            </option>
          </optgroup>
          <optgroup v-if="networkAnalyzer.hasCommunityNode.value" label="Community nodes">
            <option v-for="n in networkAnalyzer.nodes.value" :key="n.node_id" :value="n.node_id"
                    style="background-color: var(--h-theme-page-background-color)"
                    v-show="!isCouncilNode(n)"
            >
              {{ makeNodeSelectorDescription(n) }}
            </option>
          </optgroup>
        </o-select>

      </template>

      <template v-if="stakeChoice===StakeChoice.StakeToAccount">
        <div class="has-text-weight-light mb-1">
          Staked Account ID
        </div>
        <input :value="stakedAccount"
               class="input input-field is-small has-text-white"
               style="width: 560px"
               placeholder="Account ID (0.0.1234)"
               type="text"
               @input="event => onStakedAccountInput(event)"
        >
      </template>

      <div class="mb-4"/>

      <template v-if="stakeChoice === StakeChoice.StakeToNode">
        <div class="is-flex is-align-items-center is-justify-content-space-between">
          <div class="is-flex has-text-weight-light mb-1">
            Decline Rewards
          </div>
          <o-switch class="ml-2 h-is-text-size-4" v-model="declineRewards"/>
        </div>
      </template>

      <div class="mb-4"/>

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
      <div v-if="formattedTransactionId" class="h-is-property-text">
        {{ 'With transaction ID: ' + formattedTransactionId }}
      </div>
    </template>

    <!-- error -->
    <template #dialogError>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-danger">
          <span style="font-size: 18px; font-weight: 900">X</span>
        </div>
        <div class="h-is-tertiary-text mb-4">
          {{ errorMessage }}
        </div>
      </div>
      <div class="h-is-property-text">
        {{ errorMessageDetails }}
      </div>
    </template>

    <!-- user feedback -->
    <template #dialogFeedback>
      {{ feedbackMessage }}
    </template>

    <template #dialogInputButtons>
      <DialogButton :controller="controller">CANCEL</DialogButton>
      <CommitButton :controller="controller" :enabled="isInputValid" @action="onUpdate">UPDATE</CommitButton>
    </template>

  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, PropType, ref, watch, WatchStopHandle} from "vue";
import {DialogController, DialogMode} from "@/components/dialog/DialogController";
import {isCouncilNode, waitForTransactionRefresh} from "@/schemas/HederaUtils";
import {TransactionID} from "@/utils/TransactionID";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {AccountInfo, makeNodeSelectorDescription} from "@/schemas/HederaSchemas";
import DialogButton from "@/components/dialog/DialogButton.vue";
import CommitButton from "@/components/dialog/CommitButton.vue";
import router, {walletManager} from "@/router";
import Dialog from "@/components/dialog/Dialog.vue";
import {AccountUpdateTransaction} from "@hashgraph/sdk";
import {inputEntityID} from "@/utils/InputUtils";
import {NetworkAnalyzer} from "@/utils/analyzer/NetworkAnalyzer";
import {EntityID} from "@/utils/EntityID";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";

const props = defineProps({
  accountInfo: {
    type: Object as PropType<AccountInfo | null>,
    required: true
  },
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
})

const emit = defineEmits(["updated"])

const network = router.currentRoute.value.params.network as string
const nr = networkRegistry

const recSigRequired = ref<boolean>(false)

const selectedAutoRenewPeriod = ref<string>("")

enum PeriodUnit {
  Seconds = "seconds",
  Minutes = 'minutes',
  Hours = 'hours',
  Days = 'days',
  Years = 'years'
}

const selectedUnit = ref<PeriodUnit>(PeriodUnit.Seconds)

const memo = ref<string>("")

const maxAutoAssociations = ref<string>("")

enum AutoAssociationMode {
  UnlimitedAutoAssociation = -1,
  LimitedAutoAssociation = 1,
  NoAutoAssociation = 0
}

const autoAssociationMode = ref<AutoAssociationMode>(AutoAssociationMode.NoAutoAssociation)

const stakedNode = ref<number>(0)
const stakedAccount = ref<string | null>("")

enum StakeChoice {
  NotStaking = "not-staking",
  StakeToNode = "node",
  StakeToAccount = "account"
}

const stakeChoice = ref<StakeChoice>(StakeChoice.NotStaking)
const declineRewards = ref<boolean>(false)

const feedbackMessage = ref<string | null>(null)

let initialRecSigRequired = false
let initialAutoRenewPeriod: number | null = 0
let initialMemo = ""
let initialMaxAutoAssociations = ""
let initialStakeChoice = StakeChoice.NotStaking
let initialStakedNode = 0
let initialStakedAccount = ""
let initialDeclineRewards = false

let visibleWatchHandle: WatchStopHandle | null = null
let modeWatchHandle: WatchStopHandle | null = null
let periodWatchHandle: WatchStopHandle | null = null
let stakedAccountWatchHandle: WatchStopHandle | null = null
let stakeChoiceWatchHandle: WatchStopHandle | null = null

onMounted(() => {
  visibleWatchHandle = watch(props.controller?.visible, (newValue) => {
    if (newValue) {
      recSigRequired.value = props.accountInfo?.receiver_sig_required ?? false
      selectedAutoRenewPeriod.value = props.accountInfo?.auto_renew_period?.toString() ?? ""
      selectedUnit.value = PeriodUnit.Seconds
      memo.value = props.accountInfo?.memo ?? ""
      maxAutoAssociations.value = props.accountInfo?.max_automatic_token_associations?.toString() ?? ""
      autoAssociationMode.value =
          props.accountInfo?.max_automatic_token_associations === -1 ? AutoAssociationMode.UnlimitedAutoAssociation
              : (props.accountInfo?.max_automatic_token_associations ?? 0) > 0 ? AutoAssociationMode.LimitedAutoAssociation
                  : AutoAssociationMode.NoAutoAssociation
      stakedNode.value = props.accountInfo?.staked_node_id ?? 0
      stakedAccount.value = props.accountInfo?.staked_account_id ?? ""
      stakeChoice.value =
          (props.accountInfo?.staked_node_id ?? null) !== null ? StakeChoice.StakeToNode
              : (props.accountInfo?.staked_account_id ?? null) !== null ? StakeChoice.StakeToAccount
                  : StakeChoice.NotStaking
      declineRewards.value = props.accountInfo?.decline_reward ?? false

      initialRecSigRequired = recSigRequired.value
      initialAutoRenewPeriod = props.accountInfo?.auto_renew_period ?? null
      initialMemo = memo.value
      initialMaxAutoAssociations = maxAutoAssociations.value
      initialStakeChoice = stakeChoice.value
      initialStakedNode = stakedNode.value
      initialStakedAccount = stakedAccount.value
      initialDeclineRewards = declineRewards.value
    } else {
      recSigRequired.value = false
      selectedAutoRenewPeriod.value = ""
      selectedUnit.value = PeriodUnit.Seconds
      memo.value = ""
      maxAutoAssociations.value = ""
      autoAssociationMode.value = AutoAssociationMode.NoAutoAssociation
      stakeChoice.value = StakeChoice.NotStaking
      stakedNode.value = 0
      stakedAccount.value = ""
      declineRewards.value = false
    }
  }, {immediate: true})
})

onMounted(() => {
  modeWatchHandle = watch(autoAssociationMode, (newValue) => {
    switch (newValue) {
      case AutoAssociationMode.LimitedAutoAssociation:
      case AutoAssociationMode.NoAutoAssociation:
        maxAutoAssociations.value = "0"
        break
      case AutoAssociationMode.UnlimitedAutoAssociation:
        maxAutoAssociations.value = "-1"
        break
    }
  })
})

onMounted(() => {
  periodWatchHandle = watch(selectedUnit, (newValue, oldValue) => {
    let seconds = normalizePeriod(parseInt(selectedAutoRenewPeriod.value), oldValue)
    let period
    switch (newValue) {
      case PeriodUnit.Seconds:
        period = seconds
        break
      case PeriodUnit.Minutes:
        period = Math.floor(seconds / 60)
        break
      case PeriodUnit.Hours:
        period = Math.floor(seconds / 3600)
        break
      case PeriodUnit.Days:
        period = Math.floor(seconds / 86400)
        break
      case PeriodUnit.Years:
        period = Math.floor(seconds / 31536000)
        break
    }
    selectedAutoRenewPeriod.value = period.toString()
  })
})

let validationTimerId = -1

onMounted(() => {
  stakedAccountWatchHandle = watch(stakedAccount, () => {
    isStakedAccountValid.value = false
    feedbackMessage.value = null
    if (validationTimerId != -1) {
      window.clearTimeout(validationTimerId)
      validationTimerId = -1
    }
    if (stakedAccount.value?.length) {
      validationTimerId = window.setTimeout(() => validateAccount(), 500)
    } else {
      stakedAccount.value = null
    }
  })

  stakeChoiceWatchHandle = watch(stakeChoice, (newValue) => {
    feedbackMessage.value = null
    if (newValue === StakeChoice.StakeToAccount) {
      validateAccount()
    }
  })
})

onBeforeUnmount(() => {
  if (visibleWatchHandle !== null) {
    visibleWatchHandle()
    visibleWatchHandle = null
  }
  if (modeWatchHandle !== null) {
    modeWatchHandle()
    modeWatchHandle = null
  }
  if (periodWatchHandle !== null) {
    periodWatchHandle()
    periodWatchHandle = null
  }
  if (stakedAccountWatchHandle !== null) {
    stakedAccountWatchHandle()
    stakedAccountWatchHandle = null
  }
  if (stakeChoiceWatchHandle !== null) {
    stakeChoiceWatchHandle()
    stakeChoiceWatchHandle = null
  }
})

const stakedNodeIcon = computed(() =>
    isCouncilNode(networkAnalyzer.nodes.value[stakedNode.value]) ? "building" : "users"
)

const isStakedNodeValid = computed(() => {
  return stakeChoice.value === StakeChoice.StakeToNode
})

const stakedAccountEntity = computed(() =>
    EntityID.normalize(nr.stripChecksum(stakedAccount.value ?? ""))
)
const stakedAccountChecksum = computed(() =>
    nr.extractChecksum(stakedAccount.value ?? "")
)

const isStakedAccountValid = ref<boolean>(false)

const isAccountEdited = computed(() =>
    (recSigRequired.value !== initialRecSigRequired)
    || (normalizePeriod(parseInt(selectedAutoRenewPeriod.value), selectedUnit.value) !== initialAutoRenewPeriod)
    || (memo.value !== initialMemo)
    || (maxAutoAssociations.value !== initialMaxAutoAssociations)
    || (stakedNode.value !== initialStakedNode)
    || (stakedAccount.value !== initialStakedAccount)
    || (declineRewards.value !== initialDeclineRewards)
)

const isMaxAutoAssociationsValid = computed(() => {
  const max = parseInt(maxAutoAssociations.value)
  return !isNaN(max) && (max >= 0 || max === -1)
})

const isStakingValid = computed(() =>
    stakeChoice.value === StakeChoice.NotStaking
    || isStakedAccountValid.value
    || isStakedNodeValid.value
)

const isInputValid = computed(() =>
    isAccountEdited.value
    && isMaxAutoAssociationsValid.value
    && isStakingValid.value
)

const tid = ref<string | null>(null)
const formattedTransactionId = computed(() =>
    tid.value != null ? TransactionID.normalize(tid.value, true) : null
)

const errorMessage = ref<string | null>(null)
const errorMessageDetails = ref<string | null>(null)

const networkAnalyzer = new NetworkAnalyzer()
onMounted(() => networkAnalyzer.mount())
onBeforeUnmount(() => networkAnalyzer.unmount())

const onStakedAccountInput = (event: Event) => {
  const newValue = inputEntityID(event, stakedAccount.value)
  if (newValue === stakedAccount.value) {
    stakedAccount.value = null // to force reactivity
  }
  stakedAccount.value = newValue
}

const onUpdate = async () => {
  props.controller.mode.value = DialogMode.Busy
  tid.value = null

  try {

    const transaction = new AccountUpdateTransaction()
    if (memo.value !== initialMemo) {
      transaction.setAccountMemo(memo.value)
    }
    if (maxAutoAssociations.value !== initialMaxAutoAssociations) {
      transaction.setMaxAutomaticTokenAssociations(Number(maxAutoAssociations.value))
    }
    if (recSigRequired.value !== initialRecSigRequired) {
      transaction.setReceiverSignatureRequired(recSigRequired.value)
    }
    const updatedAutoRenewPeriod = normalizePeriod(parseInt(selectedAutoRenewPeriod.value), selectedUnit.value)
    if (updatedAutoRenewPeriod !== initialAutoRenewPeriod) {
      transaction.setAutoRenewPeriod(updatedAutoRenewPeriod)
    }
    if (stakeChoice.value !== initialStakeChoice
        || stakedAccount.value !== initialStakedAccount
        || stakedNode.value !== initialStakedNode) {
      switch (stakeChoice.value) {
        case StakeChoice.StakeToNode:
          transaction.setStakedNodeId(stakedNode.value)
          break
        case StakeChoice.StakeToAccount:
          transaction.setStakedAccountId(stakedAccount.value!)
          break
        case StakeChoice.NotStaking:
          transaction.setStakedNodeId(-1)
          transaction.setStakedAccountId("0.0.0")
          break
      }
    }
    if (declineRewards.value !== initialDeclineRewards) {
      transaction.setDeclineStakingReward(declineRewards.value)
    }

    tid.value = TransactionID.normalize(
        await walletManager.updateAccount(transaction)
    )
    if (tid.value) {
      await waitForTransactionRefresh(tid.value, 10, 3000)
    }
    props.controller.mode.value = DialogMode.Success

    emit('updated')

  } catch (reason) {

    console.warn("Transaction Error: " + reason)
    if (reason instanceof WalletDriverCancelError) {
      props.controller.handleClose()
    } else {
      props.controller.mode.value = DialogMode.Error
      if (reason instanceof WalletDriverError) {
        errorMessage.value = reason.message
        errorMessageDetails.value = reason.extra
      } else {
        errorMessage.value = "Operation did not complete"
        errorMessageDetails.value = reason instanceof Error ? JSON.stringify(reason.message) : JSON.stringify(reason)
      }
    }

  }
}

const normalizePeriod = (period: number, unit: PeriodUnit) => {
  let result: number
  switch (unit) {
    case PeriodUnit.Seconds:
      result = period
      break
    case PeriodUnit.Minutes:
      result = period * 60
      break
    case PeriodUnit.Hours:
      result = period * 3600
      break
    case PeriodUnit.Days:
      result = period * 86400
      break
    case PeriodUnit.Years:
      result = period * 31536000
      break
  }
  return result
}

const validateAccount = async () => {
  if (stakedAccountEntity.value === null) {
    feedbackMessage.value = "Invalid account ID"
  } else if (stakedAccountChecksum.value !== null
      && !nr.isValidChecksum(stakedAccountEntity.value, stakedAccountChecksum.value, network)) {
    feedbackMessage.value = "Invalid account checksum"
  } else {
    if (await AccountByIdCache.instance.lookup(stakedAccountEntity.value)) {
      isStakedAccountValid.value = true
    } else {
      feedbackMessage.value = "Unknown account ID"
    }
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.input-field {
  height: 38px;
  border-width: 1px;
  border-color: grey;
  background-color: var(--h-theme-page-background-color);
}

</style>
