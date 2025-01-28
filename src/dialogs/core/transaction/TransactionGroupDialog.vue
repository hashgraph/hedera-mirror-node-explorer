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
  <TaskDialog :controller="props.controller" @task-dialog-did-succeed="taskDidSucceed" :width="props.width">

    <!-- title -->
    <template #taskDialogTitle>
      <slot name="transactionGroupDialogTitle"/>
    </template>

    <!-- input -->
    <template #taskDialogInput>
      <template v-if="walletSupported">
        <slot name="transactionGroupDialogInput"/>
      </template>
      <template v-else>
        <div>This operation cannot be done using {{ walletName }}</div>
        <div>Use another wallet (Blade or HashPack)</div>
      </template>
    </template>

    <!-- label -->
    <template #taskExecuteLabel>
      <slot name="transactionGroupExecutionLabel"/>
    </template>

    <!-- confirm -->
    <template v-if="$slots.transactionGroupDialogConfirm" #taskDialogConfirm>
      <slot name="transactionGroupDialogConfirm"/>
    </template>

    <!-- busy -->
    <template #taskDialogBusy>
      <p>Connecting to Hedera Network using your wallet…</p>
      <p>Check {{ walletName }} for any approval request</p>
      <img :src="walletIconURL" alt="Wallet Logo"/>
    </template>

    <!-- success -->
    <template #taskDialogSuccess>
      <p>{{ mainFeedback }}</p>
      <p v-if="extraFeedback !== null">{{ extraFeedback }}</p>
    </template>

    <!-- error -->
    <template #taskDialogError></template>

    <!-- controls -->
    <template #taskDialogControls>
      <slot name="transactionGroupDialogControls"/>
    </template>

  </TaskDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import TaskDialog from "@/dialogs/core/task/TaskDialog.vue";
import {TransactionGroupController} from "@/dialogs/core/transaction/TransactionGroupController.ts";
import {walletManager} from "@/router.ts";

const props = defineProps({
  controller: {
    type: Object as PropType<TransactionGroupController>,
    required: true
  },
  nativeWalletOnly: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: 768
  }
})

const emit = defineEmits(["transactionGroupDidExecute"])

const walletName = walletManager.walletName
const walletIconURL = computed(() => walletManager.walletIconURL.value ?? "")
const walletSupported = computed(() => !props.nativeWalletOnly || walletManager.isHieroWallet.value)

const mainFeedback = props.controller.mainFeedback
const extraFeedback = props.controller.extraFeedback

const taskDidSucceed = () => {
  emit("transactionGroupDidExecute")
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
