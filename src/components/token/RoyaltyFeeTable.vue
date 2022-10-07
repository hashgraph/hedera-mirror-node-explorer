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

  <o-table
      :data="fees"
      :hoverable="false"
      :mobile-breakpoint="ORUGA_MOBILE_BREAKPOINT"
      :narrowed="true"
      :striped="false"

      aria-current-label="Current page"
      aria-next-label="Next page"
      aria-page-label="Page"
      aria-previous-label="Previous page"
  >

    <o-table-column v-slot="props" field="amount" label="Amount">
      <StringValue :string-value="makeAmount(props.row.amount)"/>
    </o-table-column>

    <o-table-column v-slot="props" field="collector" label="Collector Account">
      <AccountLink :account-id="props.row.collector_account_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="fallbackAmount" label="Fallback Amount">
      <PlainAmount :amount="props.row.fallback_fee?.amount"/>
    </o-table-column>

    <o-table-column v-slot="props" field="fallbackToken" label="Fallback Token">
      <AccountLink :amount="props.row.fallback_fee?.denominating_token_id"/>
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import AccountLink from "@/components/values/AccountLink.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/App.vue";
import {FractionAmount} from "@/schemas/HederaSchemas";
import StringValue from "@/components/values/StringValue.vue";
import {TokenInfoLoader} from "@/components/token/TokenInfoLoader";

export default defineComponent({

  name: 'RoyaltyFeeTable',

  components: {
    StringValue,
    PlainAmount,
    AccountLink,
  },

  props: {
    tokenInfoLoader: {
      type: Object as PropType<TokenInfoLoader>,
      required: true
    }
  },

  setup(props) {
    const makeAmount = (fraction: FractionAmount): string => {
      return fraction.numerator + '/' + fraction.denominator
    }

    return {
      fees: props.tokenInfoLoader.royaltyFees,
      makeAmount,
      ORUGA_MOBILE_BREAKPOINT
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
