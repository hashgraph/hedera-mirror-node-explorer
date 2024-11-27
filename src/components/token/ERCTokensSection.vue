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

  <DashboardCard v-if="accountId && showSection" id="ercTokensSection" collapsible-key="ercTokens">

    <template v-slot:title>
      <div v-if="fullPage">
        <span class="h-is-primary-title">ERC Tokens of Account </span>
        <router-link :to="routeManager.makeRouteToAccount(accountId)">
          <span class="h-is-secondary-text has-text-weight-light mr-3">{{ accountId }}</span>
        </router-link>
      </div>
      <span v-else class="h-is-secondary-title">ERC Tokens</span>
    </template>

    <template v-slot:control>
      <div
          class="is-flex is-align-items-baseline"
      >
        <button
            id="refresh-button"
            class="button is-white is-small"
            @click="onRefresh"
        >
          REFRESH
        </button>
      </div>
    </template>

    <template v-slot:content>
      <Tabs
          :selected-tab="selectedTab"
          :tab-ids="tabIds"
          :tabLabels="tabLabels"
          @update:selected-tab="onSelectTab($event)"
      />

      <div v-if="selectedTab === 'erc20'" id="erc20Table">
        <ERC20Table
            :tokens="erc20Tokens"
            :full-page="props.fullPage"
            @refresh="onRefreshRowERC20"
        />
      </div>

      <div v-else-if="selectedTab === 'erc721'" id="erc721Table">
        <ERC721Table
            :tokens="erc721Tokens"
            :full-page="props.fullPage"
            @refresh="onRefreshRowERC721"/>
      </div>

    </template>

  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, PropType, ref} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Tabs from "@/components/Tabs.vue";
import {AppStorage} from "@/AppStorage";
import {routeManager} from "@/router";
import {AccountERC20, AccountERC20Cache} from "@/utils/cache/AccountERC20Cache";
import {AccountERC721, AccountERC721Cache} from "@/utils/cache/AccountERC721Cache.ts";
import ERC20Table from "@/components/account/ERC20Table.vue";
import ERC721Table from "@/components/account/ERC721Table.vue";

const props = defineProps({
  accountId: {
    type: String as PropType<string | null>,
    default: null
  },
  fullPage: {
    type: Boolean,
    default: false
  }
})

const showSection = computed(() =>
    (erc20Tokens.value.length + erc721Tokens.value.length) > 0
)

const accountId = computed(() => props.accountId)

const tabIds = ['erc20', 'erc721']

const tabLabels = ['ERC20', 'ERC721']
const selectedTab = ref<string | null>(AppStorage.getAccountERCTokenTab() ?? tabIds[0])
const onSelectTab = (tab: string | null) => {
  selectedTab.value = tab
  AppStorage.setAccountERCTokenTab(tab)
}

//
// ERC20
//

const erc20Lookup = AccountERC20Cache.instance.makeLookup(accountId)
onMounted(() => erc20Lookup.mount())
onBeforeUnmount(() => erc20Lookup.unmount())
const erc20Tokens = computed(() => erc20Lookup.entity.value ?? [])

//
// ERC721
//

const erc721Lookup = AccountERC721Cache.instance.makeLookup(accountId)
onMounted(() => erc721Lookup.mount())
onBeforeUnmount(() => erc721Lookup.unmount())
const erc721Tokens = computed(() => erc721Lookup.entity.value ?? [])


//
// Refresh
//

const onRefresh = () => {
  switch(selectedTab.value) {
    case 'erc20':
      AccountERC20Cache.instance.clear()
      erc20Lookup.unmount()
      erc20Lookup.mount()
      break
    case 'erc721':
      AccountERC721Cache.instance.clear()
      erc721Lookup.unmount()
      erc721Lookup.mount()
      break
  }
}

const onRefreshRowERC20 = async (row: AccountERC20): Promise<void> => {
  if (accountId.value) {
    await AccountERC20Cache.instance.forgetContract(accountId.value, row.erc20Info.contractId)
  }
}

const onRefreshRowERC721 = async (row: AccountERC721): Promise<void> => {
  if (accountId.value) {
    await AccountERC721Cache.instance.forgetContract(accountId.value, row.erc721Info.contractId)
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
