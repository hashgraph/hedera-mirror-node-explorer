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
          <span class="h-is-primary-title">Stop Staking </span>
          <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
          <span v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3">{{ accountId }}</span>
        </span>
      </DialogTitle>
    </template>

    <!-- input -->
    <template #dialogInput>
      Blah
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
      <div v-if="normalizedTransactionId" class="h-is-property-text">
        {{ 'With transaction ID: ' + normalizedTransactionId }}
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

  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {DialogController, DialogMode} from "@/dialogs/core/dialog/DialogController.ts";
import Dialog from "@/dialogs/core/dialog/Dialog.vue";
import DialogTitle from "@/dialogs/core/dialog/DialogTitle.vue";
import {computed, watch, PropType, ref} from "vue";
import {AccountBalanceTransactions} from "@/schemas/MirrorNodeSchemas.ts";
import {walletManager} from "@/router.ts";
import {TransactionID} from "@/utils/TransactionID.ts";
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient.ts";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  account: Object as PropType<AccountBalanceTransactions>,
})

const emit = defineEmits(["stakingChanged"])

const controller = new DialogController(showDialog)

const accountId = computed(() => props.account?.account)


//
// stopStaking
//

const normalizedTransactionId = ref<string | null>(null)
const transactionError = ref<unknown>(null)

const stopStaking = async () => {

  try {

    controller.mode.value = DialogMode.Busy
    const transactionId = await walletManager.changeStaking(null, null, null)
    controller.mode.value = DialogMode.Success
    normalizedTransactionId.value = TransactionID.normalize(transactionId)
    emit("stakingChanged")

  } catch (error) {

    if (error instanceof WalletClientRejectError) {
      controller.visible.value = false
    } else {
      controller.mode.value = DialogMode.Error
      transactionError.value = error
      normalizedTransactionId.value = null
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

watch(showDialog, () => {
  if (showDialog.value) {
    stopStaking()
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
