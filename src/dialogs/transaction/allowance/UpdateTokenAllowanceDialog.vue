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
        <template #cellTitle>Token Amount</template>
        <template #cellContent>
          <TextFieldView
              v-model="tokenAmountInput"
              placeholder="Token Amount"
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

import {computed, onBeforeUnmount, onMounted, PropType} from "vue";
import {TokenAllowance} from "@/schemas/MirrorNodeSchemas.ts";
import {UpdateTokenAllowanceController} from "@/dialogs/transaction/allowance/UpdateTokenAllowanceController.ts";
import ContentCell from "@/dialogs/core/ContentCell.vue";
import TransactionDialog from "@/dialogs/transaction/TransactionDialog.vue";
import TextFieldView from "@/components/TextFieldView.vue";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  "tokenAllowance": {
    type: Object as PropType<TokenAllowance | null>,
    default: null
  }
})

const emit = defineEmits(["allowanceApproved"])

const tokenAllowance = computed(() => props.tokenAllowance)
const controller = new UpdateTokenAllowanceController(showDialog, tokenAllowance)
onMounted(() => controller.mount())
onBeforeUnmount(() => controller.unmount())

const tokenAmountInput = controller.tokenAmountInput
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
