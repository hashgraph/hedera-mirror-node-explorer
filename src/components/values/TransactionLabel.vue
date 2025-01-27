!--
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
  <span style="display: flex; gap: 8px;">
    <span class="is-numeric">{{ transactionText }}</span>
    <TriangleAlert v-if="errorFlagVisible" :size="18" class="h-text-error"/>
  </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed} from "vue";
import {TransactionID} from "@/utils/TransactionID";
import {isSuccessfulResult} from "@/utils/TransactionTools";
import {TriangleAlert} from 'lucide-vue-next';

const props = defineProps({
  transactionId: String,
  result: String
})

const transactionText = computed(() => {
  return props.transactionId ? TransactionID.normalizeForDisplay(props.transactionId) : ""
})

const errorFlagVisible = computed(() => {
  return props.result && !isSuccessfulResult(props.result)
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
