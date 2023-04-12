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

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Account </span>
        <div class="h-is-tertiary-text mt-3" id="entityId">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">Account ID:</div>
          <span class="">Assigned upon address activation</span>
        </div>
        <div v-if="accountAddress" id="evmAddress" class="h-is-tertiary-text mt-2" style="word-break: keep-all">
          <div class="is-inline-block h-is-property-text has-text-weight-light" style="min-width: 115px">EVM Address:</div>
          <div class="is-inline-block">
            <EVMAddress :show-id="false" :has-custom-font="true" :address="accountAddress"/>
          </div>
        </div>
      </template>

      <template v-slot:content>

        <NotificationBanner :message="'Inactive EVM Address'" :is-error="false"/>

        <div class="block h-is-tertiary-text has-text-centered" style="font-weight: 300">
          <br/>
          <div class="has-text-left" style="display: inline-block; max-width: 1024px; min-height: 240px">
            <span>The EVM address </span>
            <div style="display: inline-block; font-weight: 400">
              <EVMAddress :show-id="false" :has-custom-font="true" :address="accountAddress"/>
            </div>
            <span> is not active because the corresponding Hedera account has not yet been created.</span>
            <br/><br/>
            <span>If you own this address, you may activate it automatically by transfering any amount of hbar, or tokens, to it.</span>
            <div class="h-help-item mt-6">
              Please refer to the
              <a href="https://docs.hedera.com/hedera/core-concepts/accounts/auto-account-creation" class="is-underlined">Hedera documentation</a>
              for more information on Auto Account Creation.
            </div>
          </div>
        </div>

      </template>
    </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import { defineComponent, inject} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";

export default defineComponent({

  name: 'InactiveAddressSection',

  components: {
    NotificationBanner,
    EVMAddress,
    DashboardCard
  },

  props: {
    accountAddress: String,
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
    }
  }
});

</script>

<style scoped>

.h-help-item {
  font-weight: 300;
  font-size: 14px;
}

</style>
