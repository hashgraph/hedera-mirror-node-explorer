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
  <o-tooltip :active="tooltipLabel != null"
             :label="tooltipLabel"
             :delay="tooltipDelay"
             multiline
             class="h-tooltip">
    <div class="is-flex is-flex-direction-column is-align-items-flex-start">
      <p v-if="isMediumScreen" class="h-is-property-text mb-1">{{ title }}</p>
      <p v-else class="h-is-text-size-3 mb-1">{{ title }}</p>

      <div class="is-flex is-align-items-center">
        <div class="is-flex has-text-white is-align-items-baseline">
          <p class="dashboard-value is-numeric has-text-white mr-2">
            <span v-if="value !== null">{{ value }}</span>
            <span v-else class="has-text-grey">None</span>
            <slot name="value"></slot>
          </p>
          <div class="is-flex-is-vertical"
               :class="{'h-is-text-size-3':isMediumScreen, 'h-is-text-size-1':!isMediumScreen, 'pt-1':isMediumScreen}"
               style="line-height: 1">
            <p class="h-is-text-size-1">{{ name }}</p>
          </div>
        </div>
      </div>

    </div>

  </o-tooltip>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType} from 'vue';

export default defineComponent({
  name: 'NetworkDashboardItem',
  components: {},
  props: {
    title: String,
    name: String,
    value: String as PropType<string | null>,
    variation: String,
    tooltipLabel: {
      type: String as PropType<string | null>,
      default: null
    }
  },
  setup() {
    const isMediumScreen = inject('isMediumScreen', true)
    const tooltipDelay = 500

    return {
      isMediumScreen,
      tooltipDelay
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.dashboard-value {
  font-style: normal;
  font-weight: 300;
  font-size: 22px;
  line-height: 28px;
  letter-spacing: -0.05em;
}

@media (min-width: 1080px) {
  .dashboard-value {
    font-style: normal;
    font-weight: 300;
    font-size: 28px;
    line-height: 34px;
    letter-spacing: -0.05em;
  }
}

@media (min-width: 1450px) {
  .dashboard-value {
    font-style: normal;
    font-weight: 300;
    font-size: 34px;
    line-height: 41px;
    letter-spacing: -0.05em;
  }
}

</style>
