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
  <div class="wallet-chooser-item"
       :class="{'selected': isSelected}"
       @click="selection = props.walletItem"
       @dblclick="handleDoubleClick">
    <div style="display: flex; align-items: center; justify-content: center; column-gap: 8px">
      <img :src="props.walletItem.iconURL ?? undefined" alt="wallet logo" style="height: 32px;"/>
      <div style="flex-basis: 0">{{ props.walletItem.name }}</div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {WalletItem} from "@/dialogs/wallet_chooser/WalletChooserDialog.vue";

const selection = defineModel("selection", {
  type: Object as PropType<WalletItem|null>,
  default: null
})

const props = defineProps({
  walletItem: { type: Object as PropType<WalletItem>, required: true},
})

const emit = defineEmits(["connect"])

const isSelected = computed(() => {
  return selection.value !== null && selection.value.uuid === props.walletItem.uuid
})

const handleDoubleClick = () => {
  if (selection.value !== null) {
    emit("connect")
  }
}


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.wallet-chooser-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px;
  width: 155px;
  height: 155px;
  border-radius: 8px;
  border-style: solid;
  border-width: 1px;
  border-color: var(--border-secondary);
  color: var(--text-primary);
  font-family: Inter,serif;
  font-size: 14px;
  font-weight: 700;
  text-align: center;
  cursor: pointer;
}

div.wallet-chooser-item.selected {
  border-color: var(--network-border-accent-color);
}

</style>
