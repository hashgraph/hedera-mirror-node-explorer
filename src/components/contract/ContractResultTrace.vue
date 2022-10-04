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

  <DashboardCard class="h-card">
    <template v-slot:title>
      <span class="h-is-secondary-title">Call Trace</span>
    </template>

    <template v-slot:control>
      <div class="is-flex is-justify-content-flex-end is-align-items-baseline">
        <button id="collapseAllButton" :disabled="true"
                class="button is-white is-small ml-4" @click="alert('collapse all')">COLLAPSE ALL
        </button>
      </div>
    </template>

  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";

export default defineComponent({

  name: 'ContractResultTrace',

  components: {
    DashboardCard
  },

  props: {
    transactionIdOrHash: String
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    return {}
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.columns button {
  vertical-align: initial;
}

.button.is-small {
  font-size: 0.65rem;
}

</style>