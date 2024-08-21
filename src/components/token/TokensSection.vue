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

  <DashboardCard v-if="accountId && showSection" id="tokensSection" collapsible-key="tokens">

    <template v-slot:title>
      <span class="h-is-secondary-title">Tokens</span>
    </template>

    <template v-slot:content>
      <Tabs
          :selected-tab="selectedTab"
          :tab-ids="tabIds"
          :tabLabels="tabLabels"
          @update:selected-tab="onSelectTab($event)"
      />

      <div v-if="selectedTab === 'associations'" id="associationsTable">
        <BalanceTable :controller="tokenRelationshipTableController"/>
      </div>

      <div v-else-if="selectedTab === 'nfts'" id="nftsTable">
        <NftsTable :collections="nftCollections"/>
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
import NftsTable from "@/components/account/NftsTable.vue";
import BalanceTable from "@/components/account/BalanceTable.vue";
import {TokenRelationshipsTableController} from "@/components/account/TokenRelationshipsTableController";
import {useRouter} from "vue-router";
import {NftCollectionCache} from "@/utils/cache/NftCollectionCache";

const props = defineProps({
  accountId: {
    type: String as PropType<string | null>,
    default: null
  }
})

const perPage = ref(10)
const showSection = computed(() => tokenRelationshipTableController.rows.value.length > 0)
const accountId = computed(() => props.accountId)

const tabIds = ['nfts', 'associations']
const tabLabels = ['NFTs', 'Associations']
const selectedTab = ref(AppStorage.getAccountTokenTab() ?? tabIds[0])
const onSelectTab = (tab: string) => {
  selectedTab.value = tab
  AppStorage.setAccountTokenTab(tab)
  switch (selectedTab.value) {
    case 'fungible':
      break
    case 'nft':
      break
    default:
      //should not happen
  }
}

const tokenRelationshipTableController = new TokenRelationshipsTableController(useRouter(), accountId, perPage);
const nftCollectionLookup = NftCollectionCache.instance.makeLookup(accountId)
onMounted(() => {
  tokenRelationshipTableController.mount()
  nftCollectionLookup.mount()
})
onBeforeUnmount(() => {
  tokenRelationshipTableController.unmount()
  nftCollectionLookup.unmount()
})
const nftCollections = computed(() => nftCollectionLookup.entity.value ?? [])

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>