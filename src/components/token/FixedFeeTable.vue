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
      <PlainAmount :amount="props.row.amount"/>
    </o-table-column>

    <o-table-column v-slot="props" field="amount" label="Token">
      <TokenLink :show-extra="true" :token-id="props.row.denominating_token_id"/>
    </o-table-column>

    <o-table-column v-slot="props" field="account_id" label="Collector Account">
      <AccountLink :account-id="props.row.collector_account_id"/>
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType} from 'vue';
import TimestampValue from "@/components/values/TimestampValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Property from "@/components/Property.vue";
import AccountLink from "@/components/values/AccountLink.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import TokenLink from "@/components/values/TokenLink.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/App.vue";
import {TokenInfoLoader} from "@/components/token/TokenInfoLoader";

export default defineComponent({

  name: 'FixedFeeTable',

  components: {
    TokenLink,
    PlainAmount,
    AccountLink,
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
    return {
      fees: props.tokenInfoLoader.fixedFees,
      ORUGA_MOBILE_BREAKPOINT
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
