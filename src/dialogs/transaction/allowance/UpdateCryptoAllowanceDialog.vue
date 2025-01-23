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

    <template #transactionDialogTitle>{{ transactionTitle }}</template>

    <template #transactionExecutionLabel>APPROVE</template>

    <template #transactionDialogInput>

      <ContentCell>
        <template #cellTitle>HBAR Amount</template>
        <template #cellContent>
          <TextFieldView
              v-model="hbarAmountInput"
              placeholder="HBAR Amount"
              style="width: 100%"/>
        </template>
      </ContentCell>

    </template>

    <template #transactionDialogConfirm>
      Do you want to approve an allowance for {{ allowanceSpec }}
    </template>

    <template v-if="feedbackMessage" #transactionDialogControls>{{ feedbackMessage }}</template>

  </TransactionDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {UpdateCryptoAllowanceController} from "@/dialogs/transaction/allowance/UpdateCryptoAllowanceController.ts";
import {CryptoAllowance} from "@/schemas/MirrorNodeSchemas.ts";
import TransactionDialog from "@/dialogs/transaction/TransactionDialog.vue";
import ContentCell from "@/dialogs/core/ContentCell.vue";
import TextFieldView from "@/components/TextFieldView.vue";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  "hbarAllowance": {
    type: Object as PropType<CryptoAllowance | null>,
    default: null
  }
})

const emit = defineEmits(["allowanceApproved"])

const hbarAllowance = computed(() => props.hbarAllowance)
const controller = new UpdateCryptoAllowanceController(showDialog, hbarAllowance)

const hbarAmountInput = controller.input
const feedbackMessage = controller.feedbackMessage

const transactionTitle = computed(() => {
  return "Modify allowance to account " + controller.spenderId.value
})

const allowanceSpec = computed(() => {
  return controller.newUserAmount.value
})

const transactionDidExecute = async (transactionId: string|null) => {
  emit("allowanceApproved", transactionId)
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
