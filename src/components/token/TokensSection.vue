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

      <div v-if="selectedTab === 'fungible'" id="fungibleTable">
        <FungibleTable :controller="fungibleTableController"/>
      </div>

      <div v-else-if="selectedTab === 'nfts'" id="nftsTable">
        <NftsTable :controller="nftsTableController"/>
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
import {useRouter} from "vue-router";
import {NftsTableController} from "@/components/account/NftsTableController";
import NftsTable from "@/components/account/NftsTable.vue";
import FungibleTable from "@/components/account/FungibleTable.vue";
import {FungibleTableController} from "@/components/account/FungibleTableController";

const props = defineProps({
  accountId: {
    type: String as PropType<string | null>,
    default: null
  }
})

const perPage = ref(10)
const showSection = computed(() =>
    fungibleTableController.totalRowCount.value > 0 || nftsTableController.totalRowCount.value > 0
)
const accountId = computed(() => props.accountId)

const tabIds = ['fungible', 'nfts']
const tabLabels = ['Fungible', 'NFTs']
const selectedTab = ref<string|null>(AppStorage.getAccountTokenTab() ?? tabIds[0])
const onSelectTab = (tab: string|null) => {
  selectedTab.value = tab
  AppStorage.setAccountTokenTab(tab)
}

const nftsTableController = new NftsTableController(
    useRouter(),
    accountId,
    perPage,
    "ps", "ks"
);
onMounted(() => {
  nftsTableController.mount()
})
onBeforeUnmount(() => {
  nftsTableController.unmount()
})

const fungibleTableController = new FungibleTableController(
    useRouter(),
    accountId,
    perPage,
    "pr", "kr"
);
onMounted(() => {
  fungibleTableController.mount()
})
onBeforeUnmount(() => {
  fungibleTableController.unmount()
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>