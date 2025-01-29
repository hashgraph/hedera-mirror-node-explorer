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

<!-- TODO: remove BULMA styling, use Lucide icons, redo chips,...-->

<template>
  <div class="entry-container m-0">
    <!-- Row 0 -->
    <button
        data-cy="execFunction"
        style="background-color: transparent; border:0; border-radius: 0;"
        v-on:click="handleClick()">
      <i :class="{ 'fa-play': !isGetter, 'fa-redo': isGetter}" class="fas fa-xs"/>
    </button>
    <div class="is-flex is-align-items-baseline ml-3">
      <div class="h-is-text-size-3 has-text-grey has-text-weight-medium">{{ props.index }}.</div>
      <SolidityCode class="source-code">{{ signature }}</SolidityCode>
      <div class="h-has-pill h-is-text-size-1 has-background-black has-text-grey has-text-weight-normal">{{
          mutability
        }}
      </div>
      <div style="color:#f08d49" class="h-has-pill h-is-text-size-1 has-background-black has-text-weight-normal ml-1">
        {{ selector }}
      </div>
    </div>

    <!-- Row 1 -->
    <div/>
    <div v-if="hasResult" class="ml-2 h-is-property-text">
      <span class="icon has-text-grey"><i class="fas fa-long-arrow-alt-right"/></span>
      <span class="h-is-extra-text ml-1">{{ callOutput }}</span>
    </div>
  </div>
  <ContractAbiDialog
      :controller="dialogController"
      :contract-call-builder="props.contractCallBuilder"
      @did-update-contract-state="dialogDidUpdateContractState"/>
  <Dialog :controller="alertController">
    <template v-slot:dialogTitle>
      <DialogTitle>Connect your Wallet</DialogTitle>
    </template>
    <template v-slot:dialogInput>
      <DialogStatus :controller="alertController">
        <template v-slot:mainMessage>To execute this function first connect your wallet</template>
      </DialogStatus>
    </template>
  </Dialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onMounted, PropType, ref} from "vue";
import "prismjs/prism";
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/prism.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-solidity.js";
import SolidityCode from "@/components/SolidityCode.vue";
import ContractAbiDialog from "@/components/values/abi/ContractAbiDialog.vue";
import {DialogController} from "@/dialogs/core/dialog/DialogController.ts";
import {ContractCallBuilder} from "@/components/values/abi/ContractCallBuilder";
import Dialog from "@/dialogs/core/dialog/Dialog.vue";
import {walletManager} from "@/router";
import DialogStatus from "@/dialogs/core/dialog/DialogStatus.vue";
import DialogTitle from "@/dialogs/core/dialog/DialogTitle.vue";

const props = defineProps({
  contractCallBuilder: {
    type: Object as PropType<ContractCallBuilder>,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(["didUpdateContractState"])

const running = ref(true)

const handleClick = () => {
  if (props.contractCallBuilder.isGetter()) {
    running.value = true
    try {
      props.contractCallBuilder.execute()
          .finally(() => {
            running.value = false
          })
    } catch {
      running.value = false
    }
  } else {
    if (props.contractCallBuilder.isReadOnly() || walletManager.accountId.value !== null) {
      dialogController.visible.value = true
    } else {
      alertController.visible.value = true
    }
  }
}

const dialogController = new DialogController()
const alertController = new DialogController()

onMounted(() => {
  if (props.contractCallBuilder.isGetter()) {
    handleClick()
  }
})

const isGetter = computed(() => props.contractCallBuilder.isGetter())

const signature = computed(() => props.contractCallBuilder.fragment.format("full"))

const mutability = computed(() => props.contractCallBuilder.fragment.stateMutability.toUpperCase())

const selector = computed(() => props.contractCallBuilder.fragment.selector)

const hasResult = computed(() => props.contractCallBuilder.hasResult())

const dialogDidUpdateContractState = () => {
  emit("didUpdateContractState")
}

const callOutput = props.contractCallBuilder.callOutput

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.entry-container {
  display: grid;
  grid-template-columns: min-content auto;
  align-items: center;
}

.source-code {
  font-size: 10.5px;
  background-color: var(--background-secondary);
}

</style>
