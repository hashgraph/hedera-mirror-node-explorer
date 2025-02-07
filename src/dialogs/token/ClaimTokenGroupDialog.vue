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
  >

    <template #transactionGroupDialogTitle>Claim Token Airdrops</template>

    <template #transactionGroupExecutionLabel>CLAIM</template>

    <template #transactionGroupDialogInput>

      <TaskPanel :mode="TaskPanelMode.none">
        <template #taskPanelMessage>Do you want to claim {{ airdropCount }} token airdrops?</template>
        <template v-if="!props.drained" #taskPanelExtra1>
          (You might have more but we have limited to the first 100)
        </template>
        <template v-if="nbRequiredTransactions >= 2" #taskPanelExtra2>
          This will require sending {{ nbRequiredTransactions }} transactions
          (maximum of {{ ClaimTokenGroupController.MAX_AIRDROPS_PER_CLAIM }} tokens claimed per transaction).
        </template>
      </TaskPanel>

    </template>

  </TransactionGroupDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import TransactionGroupDialog from "@/dialogs/core/transaction/TransactionGroupDialog.vue";
import {TokenAirdrop} from "@/schemas/MirrorNodeSchemas.ts";
import {ClaimTokenGroupController} from "@/dialogs/token/ClaimTokenGroupController.ts";
import {TaskPanelMode} from "@/dialogs/core/DialogUtils.ts";
import TaskPanel from "@/dialogs/core/task/TaskPanel.vue";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  airdrops: {
    type: Object as PropType<TokenAirdrop[] | null>,
    default: null
  },
  drained: {
    type: Boolean,
    default: true
  },
})

const emit = defineEmits(["claimed"])


const airdrops = computed(() => props.airdrops ?? [])
const controller = new ClaimTokenGroupController(showDialog, airdrops)

const airdropCount = controller.airdropCount
const nbRequiredTransactions = controller.nbRequiredTransactions

const transactionGroupDidExecute = async () => {
  emit('claimed')
}


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
