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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Token Balances for Account </span>
        <span class="h-is-secondary-text">{{ accountId }}</span>
      </template>
      <template v-slot:content>
        <BalanceTable :controller="tokenRelationshipTableController"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import BalanceTable from "@/components/account/BalanceTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {TokenRelationshipsTableController} from "@/components/account/TokenRelationshipsTableController";
import {useRouter} from "vue-router";
import {EntityID} from "@/utils/EntityID";

export default defineComponent({

  name: 'AccountBalances',

  components: {
    Footer,
    DashboardCard,
    BalanceTable
  },

  props: {
    accountId: {
      type: String,
      required: true
    },
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const perPage = computed(() => isMediumScreen ? 15 : 5)
    const normalizedAccountId = computed(() => {
      const result = EntityID.parse(props.accountId) ?? EntityID.fromAddress(props.accountId)
      return result !== null ? result.toString() : null
    })

    const tokenRelationshipTableController =
        new TokenRelationshipsTableController(useRouter(), normalizedAccountId, perPage)
    onMounted(() => tokenRelationshipTableController.mount())
    onBeforeUnmount(() => tokenRelationshipTableController.unmount())

    return {
      isSmallScreen,
      isTouchDevice,
      tokenRelationshipTableController,
    }
  }
});

</script>

<style/>