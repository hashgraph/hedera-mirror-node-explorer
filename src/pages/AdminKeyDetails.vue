<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Admin Key for Account </span>
        <span class="h-is-secondary-text">{{ normalizedAccountId ?? "" }}</span>
        <span v-if="accountChecksum" class="has-text-grey" style="font-size: 28px">-{{ accountChecksum }}</span>
      </template>

      <template v-slot:content>
        <ComplexKeyValue :details="true" :key-bytes="key?.key"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {PathParam} from "@/utils/PathParam";
import {AccountLoader} from "@/components/account/AccountLoader";
import ComplexKeyValue from "@/components/values/ComplexKeyValue.vue";

export default defineComponent({

  name: 'AdminKeyDetails',

  components: {
    ComplexKeyValue,
    Footer,
    DashboardCard,
  },

  props: {
    accountId: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    //
    // account
    //

    const accountLocator = computed(() => PathParam.parseAccountIdOrAliasOrEvmAddress(props.accountId))
    const accountLoader = new AccountLoader(accountLocator)
    onMounted(() => accountLoader.requestLoad())

    return {
      isSmallScreen,
      isTouchDevice,
      account: accountLoader.entity,
      normalizedAccountId: accountLoader.accountId,
      accountChecksum: accountLoader.accountChecksum,
      key: accountLoader.key,
    }
  }
});

</script>

<style/>