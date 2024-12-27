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

  <PageFrameV2 page-title="Admin Key Details">
    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Admin Key for Account </span>
        <div id="accountId" v-if="normalizedAccountId"
             class="h-is-secondary-text has-text-weight-light is-inline-block">
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
  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {AccountLocParser} from "@/utils/parser/AccountLocParser";
import AccountLink from "@/components/values/link/AccountLink.vue";
import KeyValue from "@/components/values/KeyValue.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {NetworkConfig} from "@/config/NetworkConfig";

export default defineComponent({

  name: 'AdminKeyDetails',

  components: {
    NotificationBanner,
    KeyValue,
    AccountLink,
    PageFrameV2,
    DashboardCard,
  },

  props: {
    accountId: String,
    network: String
  },

  setup(props) {
    const networkConfig = NetworkConfig.inject()

    //
    // account
    //

    const accountLocator = computed(() => props.accountId ?? null)
    const accountLocParser = new AccountLocParser(accountLocator, networkConfig)
    onMounted(() => accountLocParser.mount())
    onBeforeUnmount(() => accountLocParser.unmount())

    return {
      notification: accountLocParser.errorNotification,
      account: accountLocParser.accountInfo,
      normalizedAccountId: accountLocParser.accountId,
      accountChecksum: accountLocParser.accountChecksum,
      key: accountLocParser.key,
    }
  }
});

</script>

<style/>
