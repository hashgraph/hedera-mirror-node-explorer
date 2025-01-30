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
  <TransactionGroupDialog
      :controller="controller"
      :native-wallet-only="true"
      @transaction-group-did-execute="transactionGroupDidExecute"
      :width="500">

    <template #transactionGroupDialogTitle>{{ transactionTitle }}</template>

    <template #transactionGroupExecutionLabel>REJECT</template>

    <template #transactionGroupDialogInput>

      <template v-if="filtering">Filtering…</template>

      <template v-else>
        <div>
          {{ inputMessage }}
        </div>
        <div>
          {{ inputMessageDetails1 }}
        </div>
        <div v-if="inputMessageDetails2">
          {{ inputMessageDetails2 }}
        </div>
        <div v-if="inputMessageDetails3">
          {{ inputMessageDetails3 }}
        </div>
        <div v-if="inputMessageDetails4">
          {{ inputMessageDetails4 }}
        </div>
        <div v-if="inputMessageDetails5">
          {{ inputMessageDetails5 }}
        </div>
      </template>

    </template>

  </TransactionGroupDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import TransactionGroupDialog from "@/dialogs/core/transaction/TransactionGroupDialog.vue";
import {RejectTokenGroupController} from "@/dialogs/token/RejectTokenGroupController.ts";
import {Nft, Token} from "@/schemas/MirrorNodeSchemas.ts";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  tokens: {
    type: Object as PropType<(Token | Nft)[] | null>,
    default: null
  },
})

const emit = defineEmits(["rejected"])


const tokens = computed(() => props.tokens ?? [])
const controller = new RejectTokenGroupController(showDialog, tokens)

const filtering = controller.filtering
const inputMessage = controller.inputMessage
const inputMessageDetails1 = controller.inputMessageDetails1
const inputMessageDetails2 = controller.inputMessageDetails2
const inputMessageDetails3 = controller.inputMessageDetails3
const inputMessageDetails4 = controller.inputMessageDetails4
const inputMessageDetails5 = controller.inputMessageDetails5

const transactionTitle = computed(
    () =>  controller.isNft.value ? 'Reject NFTs' : 'Reject Tokens' )

const transactionGroupDidExecute = async () => {
  emit('rejected')
}


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
