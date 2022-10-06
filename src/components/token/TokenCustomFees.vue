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
          <TimestampValue :nano="true" :show-none="true" :timestamp="fees?.created_timestamp.toString()"/>
        </template>
      </Property>
      <br/>
    </template>

    <template v-slot:leftContent>
      <div v-if="hasFixedFees">
        <div class="h-is-tertiary-text">Fixed Fees</div>
        <FixedFeeTable :fees="fees?.fixed_fees"/>
      </div>
      <div v-else class="columns">
        <div class="column is-one-third h-is-tertiary-text">Fixed Fees</div>
        <div class="column has-text-grey">None</div>
      </div>
    </template>

    <template v-slot:rightContent>
      <template v-if="isFungible">
        <div v-if="hasFractionalFees">
          <div class="h-is-tertiary-text">Fractional Fees</div>
          <FractionalFeeTable :fees="fees?.fractional_fees"/>
        </div>
        <div v-else class="columns">
          <div class="column is-one-third h-is-tertiary-text">Fractional Fees</div>
          <div class="column has-text-grey">None</div>
        </div>
      </template>
      <template v-else>
        <div v-if="hasRoyaltyFees">
          <div class="h-is-tertiary-text">Royalty Fees</div>
          <RoyaltyFeeTable :fees="fees?.royalty_fees"/>
        </div>
        <div v-else class="columns">
          <div class="column is-one-third h-is-tertiary-text">Royalty Fees</div>
          <div class="column has-text-grey">None</div>
        </div>
      </template>
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
import {ORUGA_MOBILE_BREAKPOINT} from "@/App.vue";
import FixedFeeTable from "@/components/token/FixedFeeTable.vue";
import FractionalFeeTable from "@/components/token/FractionalFeeTable.vue";
import RoyaltyFeeTable from "@/components/token/RoyaltyFeeTable.vue";
import {TokenInfoLoader} from "@/components/token/TokenInfoLoader";

export default defineComponent({

  name: 'TokenCustomFees',

  components: {
    RoyaltyFeeTable,
    FractionalFeeTable,
    FixedFeeTable,
    TimestampValue,
    Property,
    DashboardCard
  },

  props: {
    tokenInfoLoader: {
      type: Object as PropType<TokenInfoLoader>,
      required: true
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    return {
      fees: props.tokenInfoLoader?.customFees,
      hasFixedFees: props.tokenInfoLoader?.hasFixedFees,
      hasFractionalFees: props.tokenInfoLoader?.hasFractionalFees,
      hasRoyaltyFees: props.tokenInfoLoader?.hasRoyaltyFees,
      isFungible: props.tokenInfoLoader?.isFungible,
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      ORUGA_MOBILE_BREAKPOINT
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
