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
  >
    <option v-if="hourRangeSupported" :value="ChartPeriod.hour">1h</option>
    <option v-if="dayRangeSupported" :value="ChartPeriod.day">24h</option>
    <option v-if="yearRangeSupported" :value="ChartPeriod.year">YTD</option>
    <option v-if="allRangeSupported" :value="ChartPeriod.all">All</option>
  </SelectView>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import SelectView from "@/elements/SelectView.vue";
import {ChartController, ChartPeriod} from "@/charts/core/ChartController.ts";

const props = defineProps({
  controller: {
    type: Object as PropType<ChartController>,
    required: true
  }
})

const selectedRange = props.controller.period
const hourRangeSupported = computed(() => props.controller.isRangeSupported(ChartPeriod.hour))
const dayRangeSupported = computed(() => props.controller.isRangeSupported(ChartPeriod.day))
const yearRangeSupported = computed(() => props.controller.isRangeSupported(ChartPeriod.year))
const allRangeSupported = computed(() => props.controller.isRangeSupported(ChartPeriod.all))

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
