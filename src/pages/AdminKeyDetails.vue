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
        <div v-if="normalizedAccountId" class="h-is-secondary-text has-text-weight-light is-inline-block">
          <AccountLink :account-id="normalizedAccountId">{{ normalizedAccountId }}</AccountLink>
        </div>
        <span v-if="accountChecksum" class="has-text-grey mr-3" style="font-size: 28px">-{{ accountChecksum }}</span>
      </template>

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification"/>

        <KeyValue v-if="normalizedAccountId" :details="true" :key-bytes="key?.key" :key-type="key?._type"
                  :show-none="true"/>
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
import AccountLink from "@/components/values/AccountLink.vue";
import KeyValue from "@/components/values/KeyValue.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";

export default defineComponent({

  name: 'AdminKeyDetails',

  components: {
    NotificationBanner,
    KeyValue,
    AccountLink,
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

    const notification = computed(() => {
      let result
      if (accountLoader.accountLocator.value === null) {
        result = "Invalid account ID: " + props.accountId
      } else if (accountLoader.got404.value) {
        result = "Account with ID " + accountLoader.accountLocator.value + " was not found"
      } else if (accountLoader.entity.value?.deleted === true) {
        result = "Account is deleted"
      } else {
        result = null
      }
      return result
    })

    //
    // account
    //

    const accountLocator = computed(() => PathParam.parseAccountIdOrAliasOrEvmAddress(props.accountId))
    const accountLoader = new AccountLoader(accountLocator)
    onMounted(() => accountLoader.requestLoad())

    return {
      isSmallScreen,
      isTouchDevice,
      notification,
      account: accountLoader.entity,
      normalizedAccountId: accountLoader.accountId,
      accountChecksum: accountLoader.accountChecksum,
      key: accountLoader.key,
    }
  }
});

</script>

<style/>