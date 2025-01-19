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

    <div class="h-page-content">
      <DashboardCardV2>
        <template #title>
          <span>Admin Key for Account </span>
          <div v-if="normalizedAccountId">
            <AccountLink id="accountId" :account-id="normalizedAccountId">
              {{ normalizedAccountId }}
            </AccountLink>
            <span v-if="accountChecksum" class="has-text-grey">-{{ accountChecksum }}</span>
          </div>
        </template>

        <template #content>
          <NotificationBanner v-if="notification" :message="notification"/>

          <KeyValue
              v-if="normalizedAccountId"
              :details="true"
              :key-bytes="key?.key"
              :key-type="key?._type"
              :show-none="true"
          />
        </template>
      </DashboardCardV2>
    </div>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted} from 'vue';
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {AccountLocParser} from "@/utils/parser/AccountLocParser";
import AccountLink from "@/components/values/link/AccountLink.vue";
import KeyValue from "@/components/values/KeyValue.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {NetworkConfig} from "@/config/NetworkConfig";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";

const props = defineProps({
  accountId: String,
  network: String
})

const networkConfig = NetworkConfig.inject()

//
// account
//

const accountLocator = computed(() => props.accountId ?? null)
const accountLocParser = new AccountLocParser(accountLocator, networkConfig)
onMounted(() => accountLocParser.mount())
onBeforeUnmount(() => accountLocParser.unmount())

const notification = accountLocParser.errorNotification
const normalizedAccountId = accountLocParser.accountId
const accountChecksum = accountLocParser.accountChecksum
const key = accountLocParser.key

</script>

<style/>
