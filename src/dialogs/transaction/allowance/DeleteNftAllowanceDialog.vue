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

    <template #transactionExecutionLabel>DELETE</template>

    <template #transactionDialogInput>

      <template v-if="serialNumber === null">
        Do you want to delete the allowance for all NFTs of collection {{ tokenName }}?
      </template>

      <template v-else>
        Do you want to delete the allowance for NFT #{{ serialNumber}} of collection  {{ tokenName }} ?
      </template>

    </template>

  </TransactionDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import TransactionDialog from "@/dialogs/core/transaction/TransactionDialog.vue";
import {DeleteNftAllowanceController} from "@/dialogs/transaction/allowance/DeleteNftAllowanceController.ts";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  tokenId: {
    type: Object as PropType<string | null>,
    default: null
  },
  spenderId: {
    type: Object as PropType<string | null>,
    default: null
  },
  serialNumber: {
    type: Object as PropType<number | null>,
    default: null
  },
})

const emit = defineEmits(["allowanceDeleted"])

const tokenId = computed(() => props.tokenId)
const spenderId = computed(() => props.spenderId)
const serialNumber = computed(() => props.serialNumber)
const controller = new DeleteNftAllowanceController(showDialog, tokenId, spenderId, serialNumber)

const transactionTitle = computed(() =>  "Delete allowance to account " + spenderId.value)

const tokenName = computed(() => controller.tokenName.value)

const transactionDidExecute = async (transactionId: string|null) => {
  emit('allowanceDeleted', transactionId)
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
