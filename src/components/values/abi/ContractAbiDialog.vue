<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

  <Dialog :controller="controller">
    <template v-slot:dialogTitle>
      <DialogTitle>{{ dialogTitle }}</DialogTitle>
    </template>
    <template v-slot:dialogInput>
      <div class="dialog-grid">
        <template v-for="b of contractCallBuilder.paramBuilders" :key="b.paramType.name">
          <div class="has-text-weight-light" style="align-self: center">{{ b.paramType.name }}</div>
          <ParamTypeEditor :param-builder="b"/>
          <div/>
          <div class="h-is-extra-text h-is-text-size-3 mt-1 mb-4">{{ b.paramType.format() }}</div>
        </template>
      </div>
    </template>
    <template v-slot:dialogBusy>
      Running {{ dialogTitle }} through {{ walletName }} …
    </template>
    <template v-slot:dialogSuccess>
      <DialogStatus :controller="controller">
        <template v-slot:mainMessage>Operation succeeded</template>
        <template v-if="contractCallBuilder.hasResult()" v-slot:extraMessage> {{ callOutput }}</template>
      </DialogStatus>
    </template>
    <template v-slot:dialogError>
      <DialogStatus :controller="controller">
        <template v-slot:mainMessage>Operation failed</template>
        <template v-if="contractCallBuilder.hasResult()" v-slot:extraMessage> {{ errorMessage }}</template>
      </DialogStatus>
    </template>
    <template v-slot:dialogInputButtons>
      <DialogButton :controller="controller">Cancel</DialogButton>
      <CommitButton :controller="controller" :enabled="runEnabled" @action="handleRun">Run</CommitButton>
    </template>
  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {DialogController, DialogMode} from "@/dialogs/core/DialogController";
import Dialog from "@/dialogs/core/Dialog.vue";
import DialogButton from "@/dialogs/core/DialogButton.vue";
import CommitButton from "@/dialogs/core/CommitButton.vue";
import ParamTypeEditor from "@/components/values/abi/ParamTypeEditor.vue";
import {ContractCallBuilder} from "@/components/values/abi/ContractCallBuilder";
import {walletManager} from "@/router";
import DialogStatus from "@/dialogs/core/DialogStatus.vue";
import DialogTitle from "@/dialogs/core/DialogTitle.vue";
import {gtagCallContract} from "@/gtag";

const props = defineProps({
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
  contractCallBuilder: {
    type: Object as PropType<ContractCallBuilder>,
    required: true
  },
})

const emit = defineEmits(
    ["didUpdateContractState"]
)

const dialogTitle = computed(() => props.contractCallBuilder.fragment.name + "()")

const handleRun = () => {
  props.controller.mode.value = DialogMode.Busy
  props.contractCallBuilder.saveInputParams()
  props.contractCallBuilder.execute()
      .then(() => {
        if (props.contractCallBuilder.lastError.value !== null) {
          props.controller.mode.value = DialogMode.Error
        } else {
          props.controller.mode.value = DialogMode.Success
        }
      })
      .catch(() => {
        props.controller.mode.value = DialogMode.Error
      })
      .finally(() => {
        if (!props.contractCallBuilder.isReadOnly()) {
          emit("didUpdateContractState")
        }
        gtagCallContract(props.contractCallBuilder.fragment.format("minimal"))
      })
}

const runEnabled = computed(() => props.contractCallBuilder.functionData.value !== null)

const errorMessage = computed(() => {
  let result: string
  const lastError = props.contractCallBuilder.lastError.value
  if (lastError instanceof Error) {
    result = lastError.message
  } else if (lastError !== null) {
    result = JSON.stringify(lastError)
  } else {
    result = "No error details"
  }
  return result
})

const walletName = walletManager.walletName
const callOutput = props.contractCallBuilder.callOutput


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
