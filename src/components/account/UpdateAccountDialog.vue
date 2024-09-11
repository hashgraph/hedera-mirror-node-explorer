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
        Max. Auto. Associations
      </div>
      <input v-model="maxAutoAssociations"
             class="input is-small has-text-right has-text-white"
             placeholder="-1, 0, or positive number"
             style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
             background-color: var(--h-theme-page-background-color); text-align: left;"
             type="text"
      >

      <div class="mb-3"/>

      <div class="has-text-weight-light mb-1">
        Account Memo
      </div>
      <input v-model="memo"
             class="input is-small has-text-right has-text-white"
             placeholder="Enter memo string"
             style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-page-background-color)"
             type="text"
      >

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

let initialKey = ''
let initialRecSigRequired = false
let initialAutoRenewPeriod = ''
let initialMemo = ''
let initialMaxAutoAssociations = ''

let watchHandle: WatchStopHandle | null = null

onMounted(() => {
  watchHandle = watch(props.controller?.visible, (newValue) => {
    if (newValue) {
      key.value = props.accountInfo?.key?.key ?? ''
      recSigRequired.value = props.accountInfo?.receiver_sig_required ?? false
      autoRenewPeriod.value = props.accountInfo?.auto_renew_period?.toString() ?? ''
      memo.value = props.accountInfo?.memo ?? ''
      maxAutoAssociations.value = props.accountInfo?.max_automatic_token_associations?.toString() ?? ''

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

})

onBeforeUnmount(() => {
  if (watchHandle !== null) {
    watchHandle()
    watchHandle = null
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

<style scoped/>
