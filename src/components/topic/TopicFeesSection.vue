// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>

  <DashboardCardV2 v-if="hasFixedFees" collapsible-key="customFees">

    <template #title>
      Custom Fees
    </template>

    <template #content>
      <Property id="custom-fee-created-at" full-width>
        <template #name>Created at</template>
        <template #value>
          <TimestampValue :nano="true" :show-none="true" :timestamp="props.fees.created_timestamp"/>
        </template>
      </Property>

      <Property id="fixedFee" full-width>
        <template #name>Fixed Fees</template>
        <template #value>
          <FixedFeeTable :fees="props.fees.fixed_fees ?? []"/>
        </template>
      </Property>

    </template>

  </DashboardCardV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from 'vue';
import TimestampValue from "@/components/values/TimestampValue.vue";
import Property from "@/components/Property.vue";
import FixedFeeTable from "@/components/token/FixedFeeTable.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import {ConsensusCustomFees} from "@/schemas/MirrorNodeSchemas.ts";

const props = defineProps({
  fees: {
    type: Object as PropType<ConsensusCustomFees>,
    required: true
  }
})

const hasFixedFees = computed(() => props.fees.fixed_fees.length > 0)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
