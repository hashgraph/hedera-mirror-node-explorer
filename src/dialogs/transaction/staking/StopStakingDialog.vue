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
  <TransactionDialog
      :controller="controller"
      :native-wallet-only="true"
      @transaction-did-execute="transactionDidExecute"
      :width="500">

    <template #transactionDialogTitle>My Staking for account {{ accountId }}</template>

    <template #transactionExecutionLabel>STOP STAKING</template>

    <template #transactionDialogInput>
      Do you want to stop staking to {{ stakedTo }} ?
    </template>

  </TransactionDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import TransactionDialog from "@/dialogs/transaction/TransactionDialog.vue";
import {computed, PropType} from "vue";
import {StopStackingController} from "@/dialogs/transaction/staking/StopStackingController.ts";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  accountId: {
    type: String as PropType<string | null>,
    default: null
  },
})

const emit = defineEmits(["stakingChanged"])

const accountId = computed(() => props.accountId)
const controller = new StopStackingController(showDialog, accountId)
const stakedTo = controller.stakedTo

const transactionDidExecute = async (transactionId: string | null) => {
  emit('stakingChanged', transactionId)
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
