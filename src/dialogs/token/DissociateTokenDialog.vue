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
      @transaction-did-execute="transactionDidExecute"
      :width="500">

    <template #transactionDialogTitle>Dissociate Token</template>

    <template #transactionDialogInput>Dissociate {{ tokenType }} {{ tokenId }} from account {{ accountId }} ?</template>

    <template #transactionExecutionLabel>DISSOCIATE</template>

  </TransactionDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import TransactionDialog from "@/dialogs/core/transaction/TransactionDialog.vue";
import {computed, PropType} from "vue";
import {TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer.ts";
import {DissociateTokenController} from "@/dialogs/token/DissociateTokenController.ts";
import {walletManager} from "@/router.ts";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  analyzer: {
    type: Object as PropType<TokenInfoAnalyzer>,
    required: true
  }
})

const emit = defineEmits(["tokenDissociated"])

const analyzer = computed(() => props.analyzer)
const controller = new DissociateTokenController(showDialog, analyzer)
const tokenType = controller.tokenType
const tokenId = controller.tokenId
const accountId = walletManager.accountId

const transactionDidExecute = async (transactionId: string | null) => {
  emit('tokenDissociated', transactionId)
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
