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
  <Copyable v-if="normByteString" :content-to-copy="normByteString" :enable-copy="isCopyEnabled">
    <template v-slot:content>
      <div class="hexa-value">
        {{ normByteString }}
      </div>
    </template>
  </Copyable>

  <template v-else-if="showNone && !initialLoading" class="has-text-grey">
    <div>None</div>
    <div v-if="noneExtra">{{ noneExtra }}</div>
  </template>

  <template v-else/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, PropType, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import Copyable from "@/components/Copyable.vue";

const props = defineProps({
  byteString: {
    type: String as PropType<string | null>,
    default: null
  },
  showNone: {
    type: Boolean,
    default: false
  },
  noneExtra: String,
  copyable: {
    type: Boolean,
    default: true
  }
})

const normByteString = computed(() => {
  let result: string | null
  if (props.byteString !== null) {
    result = props.byteString.startsWith('0x') ? props.byteString : '0x' + props.byteString
  } else {
    result = null
  }
  return result
})

const isCopyEnabled = computed(() => {
  return props.copyable && (normByteString.value?.length ?? 0) >= 1
})

const initialLoading = inject(initialLoadingKey, ref(false))

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.hexa-value {
  color: var(--text-secondary);
  font-family: var(--font-family-monospace), sans-serif;
  max-height: 400px;
  overflow-y: auto;
  word-break: break-all;
}

</style>
