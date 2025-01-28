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

  <div
      :class="{'property-root': !vertical, 'property-root-vertical' : vertical}"
      :style="{'justify-content': (isSmallScreen || vertical) ? 'flex-start' : 'space-between'}"
      :id="id"
  >
    <div
        class="property-left-side"
        :style="{'width': vertical ? '100%' : (props.fullWidth && isMediumScreen) ? '16.66666674%' : leftSideWidth}"
        :id="nameId"
    >
      <span class="property-name" :class="{'uppercase': !props.keepCase}">
        <slot name="name"/>
      </span>
      <InfoTooltip v-if="tooltip" :label="tooltip"  />
    </div>
    <div
        class="property-value"
        :style="{'text-align': isSmallScreen ? 'left' : 'right'}"
        :id="valueId"
    >
      <slot name="value"/>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject} from "vue";
import InfoTooltip from "@/components/InfoTooltip.vue";

const props = defineProps({
  id: String,
  fullWidth: {
    type: Boolean,
    default: false
  },
  keepCase: {
    type: Boolean,
    default: false
  },
  vertical: {
    type:Boolean,
    default: false
  },
  customNbColClass: String,
  tooltip: String
})

const nameId = props.id + 'Name'
const valueId = props.id + 'Value'
const isSmallScreen = inject('isSmallScreen', true)
const isMediumScreen = inject('isMediumScreen', true)

const leftSideWidth = computed(() => {
  let result
  if (props.customNbColClass) {
    if (props.customNbColClass === 'is-one-quarter') {
      result = '25%'
    } else if (props.customNbColClass === 'is-one-fifth') {
      result = '20%'
    } else {
      result = props.customNbColClass
    }
  } else {
    result = '33.3333%'
  }
  return result
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.property-root {
  align-items: flex-start;
  display: flex;
  gap: 16px
}

div.property-root-vertical {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

div.property-left-side {
  align-items: center;
  display: flex;
  flex: none;
  gap: 4px;
}

span.property-name {
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  height: 16px;
  margin-right: 4px;
}

span.uppercase {
  text-transform: uppercase;
}

div.property-value {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 18px;
  width: 100%;
}

</style>