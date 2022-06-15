<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

  <div v-if="variation >= 0" class="is-flex is-align-items-baseline" :class="{'mb-1':isMediumScreen, 'mt-1':!isMediumScreen}">
    <img class="image mr-1" alt="Trend Up" src="@/assets/trend-up.png" style="width: 18px; height: 9px">
    <span>{{ variation }}%</span>
  </div>
  <div v-else class="is-flex is-align-items-baseline" :class="{'mb-1':isMediumScreen, 'mt-1':!isMediumScreen}">
    <img class="image mr-1" alt="Trend Down" src="@/assets/trend-down.png" style="width: 18px; height: 9px">
    <span>{{ absVariation }}%</span>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject} from 'vue';

export default defineComponent({
  name: 'Variation',

  props: {
    variation: String,
  },

  setup(props) {
    const isMediumScreen = inject('isMediumScreen', true)
    const absVariation = computed(() => {
      return props.variation ? Math.abs(Number(props.variation)) : ""
    })
    return {
      isMediumScreen,
      absVariation,
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
