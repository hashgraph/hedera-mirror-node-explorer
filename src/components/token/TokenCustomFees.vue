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

    <DashboardCard>

      <template v-slot:title>
        <div class="h-is-secondary-title mb-2">Custom Fees</div>
      </template>

      <template v-slot:content>
        <Property id="customFeesCreatedAt" :full-width="true">
          <template v-slot:name>Created at</template>
          <template v-slot:value>
            <TimestampValue :timestamp="fees.created_timestamp.toString()" :nano="true" :show-none="true"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType} from 'vue';
import TimestampValue from "@/components/values/TimestampValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Property from "@/components/Property.vue";
import {CustomFees} from "@/schemas/HederaSchemas";

export default defineComponent({

  name: 'TokenCustomFees',

  components: {
    TimestampValue,
    Property,
    DashboardCard
  },

  props: {
    fees: {
      type: Object as PropType<CustomFees>,
      required: true
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
