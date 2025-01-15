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

  <o-table
      :data="fees"
      :hoverable="false"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      :narrowed="true"
      :striped="false"
  >

    <o-table-column v-slot="props" field="amount" label="FRACTIONAL_FEE">
      <StringValue :string-value="makeAmount(props.row.amount)"/>
    </o-table-column>

    <o-table-column v-slot="props" field="token" label="FEE CURRENCY">
      <TokenLink :show-extra="true" :token-id="props.row.denominating_token_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="collector" label="COLLECTOR ACCOUNT">
      <AccountLink :account-id="props.row.collector_account_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="min" label="MIN">
      <PlainAmount :amount="props.row.minimum" none-label="None"/>
    </o-table-column>

    <o-table-column v-slot="props" field="max" label="MAX">
      <PlainAmount :amount="props.row.maximum" none-label="None"/>
    </o-table-column>

    <o-table-column v-slot="props" field="net" label="NET">
      {{ props.row.net_of_transfers ? "&check;" : "" }}
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from 'vue';
import AccountLink from "@/components/values/link/AccountLink.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import TokenLink from "@/components/values/link/TokenLink.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import {FractionAmount} from "@/schemas/MirrorNodeSchemas";
import StringValue from "@/components/values/StringValue.vue";
import {TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer";

const props = defineProps({
  analyzer: {
    type: Object as PropType<TokenInfoAnalyzer>,
    required: true
  }
})

const makeAmount = (fraction: FractionAmount): string => {
  let result: string
  const formatter = new Intl.NumberFormat("en-US", {
    style: 'percent',
    maximumFractionDigits: 2
  })
  if (fraction.numerator && fraction.denominator) {
    result = formatter.format(fraction.denominator ? fraction.numerator / fraction.denominator : 0)
  } else {
    result = ""
  }
  return result
}

const fees = props.analyzer.fractionalFees

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
