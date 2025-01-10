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
  <Tooltip
      id="info-tooltip"
      :text="props.warningLabel ?? props.label"
      :position="props.position"
  >
    <span class="icon is-small h-is-extra-text">
      <i v-if="props.warningLabel" class="fa fa-exclamation-triangle has-text-danger"/>
      <i v-else class="fas fa-info-circle"></i>
    </span>
  </Tooltip>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";
import Tooltip from "@/components/Tooltip.vue";

const props = defineProps({
  warningLabel: {
    type: String as PropType<string | null>,
    default: null
  },
  label: {
    type: String as PropType<string | null>,
    default: null
  },
  position: String
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
