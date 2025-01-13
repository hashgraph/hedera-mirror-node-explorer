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

  <DashboardCardV2 v-if="accountId && showSection" id="tokensSection" collapsible-key="tokens">

    <template #title>
      <div v-if="fullPage">
        <span>HTS Tokens of Account </span>
        <router-link :to="routeManager.makeRouteToAccount(accountId)">
          <span>{{ accountId }}</span>
        </router-link>
      </div>
      <span v-else>HTS Tokens</span>
    </template>

    <template #right-control>
      <div
          v-if="(selectedTab === 'fungible' || selectedTab ==='nfts') && rejectEnabled"
          class=""
      >
        <span class="">{{ rejectButtonHint }}</span>
        <ButtonView
            id="reject-button"
            :enabled="rejectButtonEnabled"
            :is-default="true"
            :size="ButtonSize.medium"
            @action="onReject"
        >
          REJECT
        </ButtonView>
      </div>
      <div
          v-else-if="selectedTab === 'pendingAirdrop' && claimEnabled"
          class=""
      >
        <span class="">{{ claimButtonHint }}</span>
        <Tooltip
            id="claim-button-tooltip"
            text="Coming soon"
        >
          <ButtonView
              id="claim-button"
              :enabled="claimActionEnabled"
              :is-default="true"
              :size="ButtonSize.medium"
              @action="onClaim"
          >
            {{ checkedAirdrops.length === 0 ? 'CLAIM ALL' : 'CLAIM' }}
          </ButtonView>
        </Tooltip>
      </div>
    </template>

    <template #content>
      <Tabs
          :selected-tab="selectedTab"
          :tab-ids="tabIds"
          :tabLabels="tabLabels"
          @update:selected-tab="onSelectTab($event)"
      />

      <div v-if="selectedTab === 'fungible'" id="fungibleTable">
        <FungibleTable
            :controller="fungibleTableController"
            :check-enabled="rejectEnabled"
            v-model:checked-tokens="checkedTokens"
            :full-page="props.fullPage"
        />
      </div>

      <div v-else-if="selectedTab === 'nfts'" id="nftsTable">
        <NftsTable
            :controller="nftsTableController"
            :check-enabled="rejectEnabled"
            v-model:checked-nfts="checkedTokens"
            :full-page="props.fullPage"
        />
      </div>

      <div
          v-else-if="selectedTab === 'pendingAirdrop'" id="pendingAirdropTable"
          class="pending-airdrops-container"
      >
        <Tabs
            :selected-tab="airdropSelectedTab"
            :tab-ids="airdropTabIds"
            :tabLabels="airdropTabLabels"
            :sub-tabs="true"
            @update:selectedTab="onAirdropSelectTab"
        />
        <div v-if="airdropSelectedTab === 'nfts'" id="pendingNftsTable">
          <PendingNftAirdropTable
              :controller="nftsAirdropTableController"
              :check-enabled="claimEnabled"
              v-model:checked-airdrops="checkedAirdrops"
              :full-page="props.fullPage"
          />
        </div>
        <div v-else id="pendingFungibleTable">
          <PendingFungibleAirdropTable
              :controller="fungibleAirdropTableController"
              :check-enabled="claimEnabled"
              v-model:checked-airdrops="checkedAirdrops"
              :full-page="props.fullPage"
          />
        </div>
      </div>

      <router-link v-if="showAllTokensLink" :to="routeManager.makeRouteToTokensByAccount(accountId)">
        <div class="all-tokens-link">
          <span class="all-tokens-text">All tokens</span>
          <img src="@/assets/right-arrow.png" alt="Link" style="height: 16px;"/>
        </div>
      </router-link>

    </template>

  </DashboardCardV2>

  <RejectTokenDialog
      :tokens="checkedTokens"
      :controller="rejectDialogController"
      @rejected="onRejectCompleted"
  />

  <ClaimTokenDialog
      :airdrops="candidateAirdrops"
      :controller="claimDialogController"
      :drained="checkedAirdrops.length < MAX_AIRDROPS"
      @claimed="onClaimCompleted"
  />

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, PropType, ref} from 'vue';
import Tabs from "@/components/Tabs.vue";
import {AppStorage} from "@/AppStorage";
import {useRouter} from "vue-router";
import {NftsTableController} from "@/components/account/NftsTableController";
import NftsTable from "@/components/account/NftsTable.vue";
import FungibleTable from "@/components/account/FungibleTable.vue";
import {FungibleTableController} from "@/components/account/FungibleTableController";
import {DialogController} from "@/dialogs/core/dialog/DialogController.ts";
import {routeManager, walletManager} from "@/router";
import {Nft, Token, TokenAirdrop, TokenType} from "@/schemas/MirrorNodeSchemas";
import RejectTokenDialog from "@/dialogs/RejectTokenDialog.vue";
import {PendingAirdropTableController} from "@/components/account/PendingAirdropTableController";
import PendingNftAirdropTable from "@/components/account/PendingNftAirdropTable.vue";
import ClaimTokenDialog from "@/components/account/ClaimTokenDialog.vue";
import {tokenOrNftId} from "@/schemas/MirrorNodeUtils.ts";
import PendingFungibleAirdropTable from "@/components/account/PendingFungibleAirdropTable.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import ButtonView, {ButtonSize} from "@/dialogs/core/dialog/ButtonView.vue";
import Tooltip from "@/components/Tooltip.vue";

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
    props.accountId === walletManager.accountId.value
    || fungibleTableController.totalRowCount.value >= 1
    || nftsTableController.totalRowCount.value >= 1
    || fungibleAirdropTableController.totalRowCount.value >= 1
    || nftsAirdropTableController.totalRowCount.value >= 1
)

const showAllTokensLink = computed(() =>
    !props.fullPage
    && (fungibleTableController.totalRowCount.value >= perPage.value
        || nftsTableController.totalRowCount.value >= perPage.value
        || fungibleAirdropTableController.totalRowCount.value >= perPage.value
        || nftsAirdropTableController.totalRowCount.value >= perPage.value)
)

const perPage = ref(props.fullPage ? 15 : 6)

const accountId = computed(() => props.accountId)

const claimActionEnabled = import.meta.env.VITE_APP_ENABLE_CLAIM_ACTION === 'true'

const tabIds = ['fungible', 'nfts', 'pendingAirdrop']

const tabLabels = ['Fungible', 'NFTs', 'Pending Airdrops']
const selectedTab = ref<string | null>(AppStorage.getAccountTokenTab() ?? tabIds[0])
const onSelectTab = (tab: string | null) => {
  selectedTab.value = tab
  AppStorage.setAccountTokenTab(tab)
  checkedTokens.value.splice(0)
  checkedAirdrops.value.splice(0)
}

const airdropTabIds = ['nfts', 'fungible']
const airdropTabLabels = ['NFTs', 'Fungible']
const airdropSelectedTab = ref<string | null>(AppStorage.getAccountAirdropTab() ?? airdropTabIds[0])
const onAirdropSelectTab = (tab: string | null) => {
  airdropSelectedTab.value = tab
  AppStorage.setAccountAirdropTab(tab)
  checkedAirdrops.value.splice(0)
}

const nftsTableController = new NftsTableController(
    useRouter(),
    accountId,
    perPage,
    "ps", "ks"
);

const fungibleTableController = new FungibleTableController(
    useRouter(),
    accountId,
    perPage,
    "pf", "kf"
);

const nftsAirdropTableController = new PendingAirdropTableController(
    useRouter(),
    accountId,
    TokenType.NON_FUNGIBLE_UNIQUE,
    perPage,
    "pa", "ka"
)
const fungibleAirdropTableController = new PendingAirdropTableController(
    useRouter(),
    accountId,
    TokenType.FUNGIBLE_COMMON,
    perPage,
    "pr", "kr"
)

onMounted(() => {
  nftsTableController.mount()
  fungibleTableController.mount()
  nftsAirdropTableController.mount()
  fungibleAirdropTableController.mount()
})
onBeforeUnmount(() => {
  nftsTableController.unmount()
  fungibleTableController.unmount()
  nftsAirdropTableController.unmount()
  fungibleAirdropTableController.unmount()
})


//
// Reject
//

const rejectDialogController = new DialogController()

const onReject = () => {
  rejectDialogController.visible.value = true
}

const onRejectCompleted = () => {
  checkedTokens.value.splice(0)
  if (selectedTab.value === 'fungible') {
    fungibleTableController.refresh()
  } else {
    nftsTableController.refresh()
  }
}

const isNftSelection = computed(() =>
    checkedTokens.value.length >= 1
    && (checkedTokens.value[0] as Nft).serial_number != undefined
)

const rejectButtonHint = computed(() => {
  let result: string
  const checkedCount = checkedTokens.value.length
  if (checkedCount >= 2) {
    result = `${checkedCount} selected ${isNftSelection.value ? "NFT" : "token"}s`
  } else if (checkedCount == 1) {
    result = `${tokenOrNftId(checkedTokens.value[0])} selected`
  } else {
    result = ""
  }
  return result
})

const rejectEnabled = computed(() => {
  const isTableFilled = (selectedTab.value === 'fungible' && fungibleTableController.totalRowCount.value >= 1)
      || (selectedTab.value === 'nfts' && nftsTableController.totalRowCount.value >= 1)

  return walletManager.isHieroWallet.value
      && walletManager.accountId.value === props.accountId
      && isTableFilled
})

const rejectButtonEnabled = computed(() =>
    (checkedTokens.value.length >= 1)
)

const checkedTokens = ref<(Token | Nft)[]>([])

//
// Claim
//

const MAX_AIRDROPS = 100 // for CLAIM ALL

const claimDialogController = new DialogController()

const onClaim = async () => {
  if (checkedAirdrops.value.length === 0) { // CLAIM ALL was chosen
    const allAirdrops = (airdropSelectedTab.value === 'nfts')
        ? await nftsAirdropTableController.loadAllAirdrops(MAX_AIRDROPS)
        : await fungibleAirdropTableController.loadAllAirdrops(MAX_AIRDROPS)
    candidateAirdrops.value = allAirdrops ?? []
  } else {
    candidateAirdrops.value = checkedAirdrops.value
  }
  claimDialogController.visible.value = true
}

const onClaimCompleted = () => {
  checkedAirdrops.value.splice(0)
}

const claimButtonHint = computed(() => {
  let result: string
  const checkedCount = checkedAirdrops.value.length
  if (checkedCount >= 2) {
    result = `${checkedCount} selected tokens`
  } else if (checkedCount == 1) {
    const checkedTokenId = checkedAirdrops.value[0].token_id
    result = `${checkedTokenId} selected`
  } else {
    result = ""
  }
  return result
})

const claimEnabled = computed(() => {
  const isTableFilled = (airdropSelectedTab.value === 'fungible' && fungibleAirdropTableController.totalRowCount.value >= 1)
      || (airdropSelectedTab.value === 'nfts' && nftsAirdropTableController.totalRowCount.value >= 1)

  return walletManager.isHieroWallet.value
      && walletManager.accountId.value === props.accountId
      && isTableFilled
})

const checkedAirdrops = ref<TokenAirdrop[]>([])

const candidateAirdrops = ref<TokenAirdrop[]>([])

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.pending-airdrops-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

div.all-tokens-link {
  align-items: center;
  color: var(--icon-default-color);
  display: flex;
  gap: 2px;
  height: 18px;
  justify-content: center;
}

span.all-tokens-text {
  font-family: "Styrene A Web", sans-serif;
  font-size: 14px;
  font-weight: 400;
}

</style>
