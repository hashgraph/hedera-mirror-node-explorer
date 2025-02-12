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
  <SelectView
      v-model:model-value="selectedRange"
      :small="true"
      :disabled="loading"
  >
    <option v-if="dayRangeSupported" :value="ChartRange.day">24h</option>
    <option v-if="yearRangeSupported" :value="ChartRange.year">YTD</option>
    <option v-if="allRangeSupported" :value="ChartRange.all">All</option>
  </SelectView>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import SelectView from "@/elements/SelectView.vue";
import {ChartController, ChartRange, ChartState} from "@/charts/core/ChartController.ts";

const props = defineProps({
  controller: {
    type: Object as PropType<ChartController<unknown>>,
    required: true
  }
})

const loading = computed(() => props.controller.state.value === ChartState.loading)
const selectedRange = props.controller.range
const dayRangeSupported = computed(() => props.controller.isRangeSupported(ChartRange.day))
const yearRangeSupported = computed(() => props.controller.isRangeSupported(ChartRange.year))
const allRangeSupported = computed(() => props.controller.isRangeSupported(ChartRange.all))

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
