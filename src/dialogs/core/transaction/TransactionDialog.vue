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
      <slot name="transactionDialogTitle"/>
    </template>

    <!-- input -->
    <template #taskDialogInput>
      <template v-if="walletSupported">
        <slot name="transactionDialogInput"/>
      </template>
      <template v-else>
        <TaskPanel :mode="TaskPanelMode.error">
          <template #taskPanelMessage>This operation cannot be done using {{ walletName }}</template>
          <template #taskPanelExtra1>Use another wallet (Blade or HashPack)</template>
        </TaskPanel>
      </template>
    </template>

    <!-- label -->
    <template #taskExecuteLabel>
      <slot name="transactionExecutionLabel"/>
    </template>

    <!-- confirm -->
    <template v-if="$slots.transactionDialogConfirm" #taskDialogConfirm>
      <slot name="transactionDialogConfirm"/>
    </template>

    <!-- busy -->
    <template #taskDialogBusy>
      <TaskPanel :mode="TaskPanelMode.busy">
        <template #taskPanelMessage>Processing</template>
        <template #taskPanelExtra1>
          <div>Check {{ walletName }} for any approval request</div>
        </template>
        <template #taskPanelExtra2>
          <img :src="walletIconURL" height=32 alt="Wallet Logo"/>
        </template>
      </TaskPanel>
    </template>

    <!-- success -->
    <template #taskDialogSuccess>
      <TaskPanel :mode="TaskPanelMode.success">
        <template #taskPanelMessage>Operation did complete</template>
        <template v-if="controller.transactionId.value" #taskPanelExtra1>
          <div>Transaction ID: <TransactionLink :transaction-loc="transactionId ?? undefined"/></div>
        </template>
        <template v-if="controller.isFailedResult.value" #taskPanelExtra2>
          <div>Result: {{ controller.transactionResult.value }}</div>
        </template>
      </TaskPanel>
    </template>

    <!-- controls -->
    <template v-if="slots.transactionDialogControls" #taskDialogControls>
      <slot name="transactionDialogControls"/>
    </template>

  </TaskDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType, useSlots} from "vue";
import TaskDialog from "@/dialogs/core/task/TaskDialog.vue";
import {TransactionController} from "@/dialogs/core/transaction/TransactionController.ts";
import {walletManager} from "@/router.ts";
import TaskPanel from "@/dialogs/core/task/TaskPanel.vue";
import {TaskPanelMode} from "@/dialogs/core/DialogUtils.ts";
import TransactionLink from "@/components/values/TransactionLink.vue";

const props = defineProps({
  controller: {
    type: Object as PropType<TransactionController>,
    required: true
  },
  nativeWalletOnly: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
  }
})

const emit = defineEmits(["transactionDidExecute"])

const slots = useSlots()

const walletName = walletManager.walletName
const walletIconURL = computed(() => walletManager.walletIconURL.value ?? "")
const walletSupported = computed(() => !props.nativeWalletOnly || walletManager.isHieroWallet.value)
const transactionId = props.controller.transactionId

const taskDidSucceed = () => {
  emit("transactionDidExecute", props.controller.transactionId.value)
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
