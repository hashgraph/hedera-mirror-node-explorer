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
    <template v-slot:dialogTitle>
      <div class="h-is-primary-title">
        Account Update
      </div>
    </template>

    <!-- input -->
    <template v-slot:dialogInput>

      <div class="mb-3"/>

      <div class="has-text-weight-light mb-1">
        Admin Key
      </div>
      <input v-model="key"
             class="input input-field is-small has-text-grey"
             placeholder="0x027936af0fe67d21e15f53abb4c15d7d0a45edd5409b8136d7ae183a116ec4a7ad"
             type="text"
      >

      <div class="mb-4"/>

      <div class=" has-text-weight-light mb-1">
        Receiver Signature Required
      </div>
      <div class=" is-flex h-is-text-size-4 is-align-items-center">
        <span class="mr-2">False</span>
        <o-field>
          <o-switch class="" v-model="recSigRequired">True</o-switch>
        </o-field>
      </div>

      <div class="mb-4"/>

      <div class="has-text-weight-light mb-1">
        Account Memo
      </div>
      <input v-model="memo"
             class="input input-field is-small has-text-white"
             placeholder="Enter memo string"
             type="text"
      >

      <div class="mb-4"/>

      <div class="has-text-weight-light mb-1">
        Max. Auto. Associations
      </div>
      <div class="columns">
        <o-field class="column">
          <o-select v-model="autoAssociationMode"
                    class="is-small has-text-white"
                    style="height: 38px;border-radius: 2px;border-width: 1px;border-color: grey;
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
        </o-field>
        <o-field class="column"
                 :class="{'is-invisible':autoAssociationMode!=AutoAssociationMode.LimitedAutoAssociation}"
        >
          <input class="input input-field is-small has-text-white"
                 v-model="maxAutoAssociations"
                 placeholder="positive number"
                 type="text"
          >
        </o-field>
      </div>

      <div class="mb-4"/>

    </template>

    <!-- busy -->
    <template v-slot:dialogBusy>
      <div class="h-is-tertiary-text mb-4">
        Connecting to Hedera Network using your wallet…
      </div>
      <div class="h-is-property-text">
        Check your wallet for any approval request
      </div>
    </template>

    <!-- success -->
    <template v-slot:dialogSuccess>
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
    <template v-slot:dialogError>
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

    <template v-slot:dialogInputButtons>
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
import {waitForTransactionRefresh} from "@/schemas/HederaUtils";
import {TransactionID} from "@/utils/TransactionID";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {AccountInfo} from "@/schemas/HederaSchemas";
import DialogButton from "@/components/dialog/DialogButton.vue";
import CommitButton from "@/components/dialog/CommitButton.vue";
import {walletManager} from "@/router";
import Dialog from "@/components/dialog/Dialog.vue";

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

const accountInfoUpdate = ref<AccountInfo>({
  account: null,
  auto_renew_period: null,
  balance: null,
  created_timestamp: null,
  deleted: null,
  expiry_timestamp: null,
  key: null,
  max_automatic_token_associations: null,
  memo: null,
  receiver_sig_required: null,
  alias: null,
  ethereum_nonce: null,
  evm_address: null,
  decline_reward: null,
  staked_account_id: null,
  staked_node_id: null,
  stake_period_start: null,
  pending_reward: undefined
})

const key = ref<string>("")
const recSigRequired = ref<boolean>(false)
const autoRenewPeriod = ref<string>("")
const memo = ref<string>("")
const maxAutoAssociations = ref<string>("")

enum AutoAssociationMode {
  UnlimitedAutoAssociation = -1,
  LimitedAutoAssociation = 1,
  NoAutoAssociation = 0
}

const autoAssociationMode = ref<AutoAssociationMode>(AutoAssociationMode.NoAutoAssociation)

let initialKey = ''
let initialRecSigRequired = false
let initialAutoRenewPeriod = ''
let initialMemo = ''
let initialMaxAutoAssociations = ''

let visibleWatchHandle: WatchStopHandle | null = null
let modeWatchHandle: WatchStopHandle | null = null

onMounted(() => {
  visibleWatchHandle = watch(props.controller?.visible, (newValue) => {
    if (newValue) {
      key.value = props.accountInfo?.key?.key ?? ''
      recSigRequired.value = props.accountInfo?.receiver_sig_required ?? false
      autoRenewPeriod.value = props.accountInfo?.auto_renew_period?.toString() ?? ''
      memo.value = props.accountInfo?.memo ?? ''
      maxAutoAssociations.value = props.accountInfo?.max_automatic_token_associations?.toString() ?? ''
      autoAssociationMode.value =
          props.accountInfo?.max_automatic_token_associations === -1 ? AutoAssociationMode.UnlimitedAutoAssociation
              : (props.accountInfo?.max_automatic_token_associations ?? 0) > 0 ? AutoAssociationMode.LimitedAutoAssociation
                  : AutoAssociationMode.NoAutoAssociation

      initialKey = props.accountInfo?.key?.key ?? ''
      initialRecSigRequired = props.accountInfo?.receiver_sig_required ?? false
      initialAutoRenewPeriod = props.accountInfo?.auto_renew_period?.toString() ?? ''
      initialMemo = props.accountInfo?.memo ?? ''
      initialMaxAutoAssociations = props.accountInfo?.max_automatic_token_associations?.toString() ?? ''
    } else {
      key.value = ''
      recSigRequired.value = false
      autoRenewPeriod.value = ''
      memo.value = ''
      maxAutoAssociations.value = ''
    }
  }, {immediate: true})

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

onBeforeUnmount(() => {
  if (visibleWatchHandle !== null) {
    visibleWatchHandle()
    visibleWatchHandle = null
  }
  if (modeWatchHandle !== null) {
    modeWatchHandle()
    modeWatchHandle = null
  }
})

const isInputValid = computed(() => {
  const isAccountChanged = (
      (key.value !== initialKey)
      || (recSigRequired.value !== initialRecSigRequired)
      || (autoRenewPeriod.value !== initialAutoRenewPeriod)
      || (memo.value !== initialMemo)
      || (maxAutoAssociations.value !== initialMaxAutoAssociations)
  )

  const isMaxAutoAssociationsValid = (
      Number.isInteger(Number(maxAutoAssociations.value))
      && (Number(maxAutoAssociations.value) >= 0 || Number(maxAutoAssociations.value) === -1)
  )

  return isAccountChanged && isMaxAutoAssociationsValid
})

const tid = ref<string | null>(null)
const formattedTransactionId = computed(() =>
    tid.value != null ? TransactionID.normalize(tid.value, true) : null
)

const errorMessage = ref<string | null>(null)
const errorMessageDetails = ref<string | null>(null)

const onUpdate = async () => {
  props.controller.mode.value = DialogMode.Busy
  tid.value = null

  try {
    if (memo.value !== initialMemo) {
      accountInfoUpdate.value.memo = memo.value
    }
    if (maxAutoAssociations.value !== initialMaxAutoAssociations) {
      accountInfoUpdate.value.max_automatic_token_associations = Number(maxAutoAssociations.value)
    }

    tid.value = TransactionID.normalize(
        await walletManager.updateAccount(accountInfoUpdate.value)
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
