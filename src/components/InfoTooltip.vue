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
  <o-tooltip
      v-if="props.warningLabel || props.label"
      id="info-tooltip"
      :label="props.warningLabel ?? props.label"
      :delay="props.delay"
      multiline="multiline"
      :position="props.position ?? 'auto'"
      class="h-tooltip">
    <span class="icon is-small h-is-property-text h-is-extra-text">
      <i v-if="props.warningLabel" class="fa fa-exclamation-triangle has-text-danger"/>
      <i v-else class="fas fa-info-circle"></i>
    </span>
  </o-tooltip>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";

const props = defineProps({
  warningLabel: {
    type: String as PropType<string | null>,
    default: null
  },
  label: {
    type: String as PropType<string | null>,
    default: null
  },
  delay: {
    type: Number,
    default: 200
  },
  position: String
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
