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

  <hr class="h-top-banner" style="margin: 0; height: 4px"/>

  <section class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Token Balances for Account </span>
        <span class="h-is-secondary-text">{{ accountId }}</span>
      </template>
      <template v-slot:table>
        <BalanceTable v-bind:account-id="accountId"/>
      </template>
    </DashboardCard>

  </section>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent} from 'vue';
import BalanceTable from "@/components/account/BalanceTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";

export default defineComponent({

  name: 'AccountBalances',

  components: {
    DashboardCard,
    BalanceTable
  },

  props: {
    accountId: String,
    network: String
  }

});

</script>

<style/>