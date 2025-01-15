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

    <o-table-column v-slot="props" field="amount" label="FIXED FEE">
      <PlainAmount v-if="props.row.denominating_token_id" :amount="props.row.amount"/>
      <HbarAmount v-else :amount="props.row.amount" timestamp="0" :show-extra="true"/>
    </o-table-column>

    <o-table-column v-slot="props" field="currency" label="FEE CURRENCY">
      <TokenLink v-if="props.row.denominating_token_id"
                 :show-extra="true" :token-id="props.row.denominating_token_id"/>
      <div v-else>{{ cryptoName }}</div>
    </o-table-column>

    <o-table-column v-slot="props" field="collector" label="COLLECTOR ACCOUNT">
      <AccountLink :account-id="props.row.collector_account_id"/>
    </o-table-column>

  </o-table>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from 'vue';
import AccountLink from "@/components/values/link/AccountLink.vue";
import TokenLink from "@/components/values/link/TokenLink.vue";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import {TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer";
import HbarAmount from "@/components/values/HbarAmount.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import {CoreConfig} from "@/config/CoreConfig.ts";

const props = defineProps({
  analyzer: {
    type: Object as PropType<TokenInfoAnalyzer>,
    required: true
  }
})

const cryptoName = CoreConfig.inject().cryptoName
const fees = props.analyzer.fixedFees

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
