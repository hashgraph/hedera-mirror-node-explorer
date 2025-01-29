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
  <TaskDialog :controller="controller">
    <template #taskDialogTitle>{{ dialogTitle }}</template>
    <template #taskDialogInput>
      <template v-if="walletRequired">To execute this function first connect your wallet</template>
      <template v-else>
        <div class="dialog-grid" style="align-self: stretch">
          <template v-for="b of paramBuilders" :key="b.paramType.name">
            <div style="align-self: center">{{ b.paramType.name }}</div>
            <ParamTypeEditor :param-builder="b" style="width: 100%" />
            <div/>
            <div>{{ b.paramType.format() }}</div>
          </template>
        </div>
      </template>
    </template>
    <template #taskDialogBusy>
      <p>Running {{ dialogTitle }}…</p>
      <p>Check {{ walletName }} for any approval request</p>
      <img :src="walletIconURL" alt="Wallet Logo"/>
    </template>
    <template #taskDialogSuccess>
      <p>Operation did succeed</p>
      <p v-if="hasResult"> {{ callOutput }}</p>
    </template>
    <template #taskDialogError>
      <p>Operation did fail !</p>
      <p v-if="hasResult"> {{ errorMessage }}</p>
    </template>
  </TaskDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {walletManager} from "@/router.ts";
import TaskDialog from "@/dialogs/core/task/TaskDialog.vue";
import {ContractCallBuilder} from "@/components/values/abi/ContractCallBuilder.ts";
import {ContractAbiController} from "@/dialogs/ContractAbiController.ts";
import ParamTypeEditor from "@/components/values/abi/ParamTypeEditor.vue";

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  contractCallBuilder: {
    type: Object as PropType<ContractCallBuilder>,
    required: true
  },
})

const emit = defineEmits(
    ["didUpdateContractState"]
)

const controller = new ContractAbiController(showDialog, props.contractCallBuilder)

const dialogTitle = computed(() => props.contractCallBuilder.fragment.name + "()")
const paramBuilders = computed(() => props.contractCallBuilder.paramBuilders)
const hasResult = computed(() => props.contractCallBuilder.hasResult())
const callOutput =computed( () => props.contractCallBuilder.callOutput)
const errorMessage = controller.errorMessage
const walletName = walletManager.walletName
const walletIconURL = computed(() => walletManager.walletIconURL.value ?? "")
const walletRequired = computed(() => {
  return !props.contractCallBuilder.isReadOnly() && walletManager.accountId.value === null
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.dialog-grid {
  display: grid;
  grid-template-columns: 2fr 5fr;
  grid-column-gap: 1rem;
}

</style>
