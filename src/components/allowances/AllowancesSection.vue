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

  <DashboardCard v-if="accountId" collapsible-key="allowances">

    <template v-slot:title>
      <span class="h-is-secondary-title">Allowances</span>
    </template>

    <template v-slot:control>
      <button v-if="isWalletConnected && isHederaWallet" id="approve-button" class="button is-white is-small"
              @click="onClick">APPROVE ALLOWANCE…
      </button>
    </template>

    <template v-slot:content>
      <Tabs
          :selected-tab="selectedTab"
          :tab-ids="tabIds"
          :tabLabels="tabLabels"
          @update:selected-tab="onUpdate($event)"
      />

      <template v-if="selectedTab === 'hbar'" id="hbarAllowancesTable">
        <HbarAllowanceTable
            :controller="hbarAllowanceTableController"
            @edit-allowance="onEditHbar"/>
      </template>

      <template v-else-if="selectedTab === 'token'" id="tokenAllowancesTable">
        <TokenAllowanceTable
            :controller="tokenAllowanceTableController"
            @edit-allowance="onEditToken"/>
      </template>

      <template v-else id="nftAllowancesTable">
        <NftAllowanceTable
            :controller="nftAllowanceTableController"
            @delete-allowance="onDeleteNft"/>
      </template>
    </template>

  </DashboardCard>

  <ApproveAllowanceDialog v-model:show-dialog="showApproveAllowanceDialog"
                          :owner-account-id="ownerAccountId"
                          :current-hbar-allowance="currentHbarAllowance"
                          :current-token-allowance="currentTokenAllowance"
                          @allowance-approved="onApprove"
  />

  <ProgressDialog v-model:show-dialog="notWithMetamaskDialogVisible"
                  :mode="Mode.Error"
                  main-message="This operation cannot be done using Metamask"
                  extra-message="Use another wallet (Blade or Hashpack)"
  >
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">Unsupported Operation</span>
    </template>
  </ProgressDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import router, {walletManager} from "@/router";
import {HbarAllowanceTableController} from "@/components/allowances/HbarAllowanceTableController";
import {TokenAllowanceTableController} from "@/components/allowances/TokenAllowanceTableController";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAllowanceTable from "@/components/allowances/HbarAllowanceTable.vue";
import TokenAllowanceTable from "@/components/allowances/TokenAllowanceTable.vue";
import ApproveAllowanceDialog from "@/components/allowances/ApproveAllowanceDialog.vue";
import {CryptoAllowance, NftAllowance, TokenAllowance} from "@/schemas/HederaSchemas";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import Tabs from "@/components/Tabs.vue";
import {AppStorage} from "@/AppStorage";
import NftAllowanceTable from "@/components/allowances/NftAllowanceTable.vue";
import {NftAllowanceTableController} from "@/components/allowances/NftAllowanceTableController";

export default defineComponent({
  name: 'AllowancesSection',

  components: {
    NftAllowanceTable,
    Tabs,
    ProgressDialog,
    ApproveAllowanceDialog,
    TokenAllowanceTable,
    HbarAllowanceTable,
    DashboardCard
  },

  props: {
    accountId: String,
  },

  setup: function (props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)

    const computedAccountId = computed(() => props.accountId || null)
    const isWalletConnected = computed(
        () => walletManager.connected.value && walletManager.accountId.value === props.accountId)
    // const isWalletConnected = computed(() => false)
    const showApproveAllowanceDialog = ref(false)
    const showDeleteAllowanceDialog = ref(false)

    watch(showApproveAllowanceDialog, (newValue) => {
      if (!newValue) {
        cleanUpRouteQuery()
      }
    })

    const tabIds = ['hbar', 'token', 'nft']
    const tabLabels = ['HBAR', 'Tokens', 'NFTs']
    const selectedTab = ref(AppStorage.getAccountAllowanceTab() ?? tabIds[0])
    const onUpdate = (tab: string) => {
      selectedTab.value = tab
      AppStorage.setAccountAllowanceTab(tab)
    }

    const perPage = computed(() => isMediumScreen ? 10 : 5)

    const currentHbarAllowance = ref<CryptoAllowance | null>(null)
    const currentTokenAllowance = ref<TokenAllowance | null>(null)

    //
    // HBAR Allowances Table Controller
    //
    const hbarAllowanceTableController = new HbarAllowanceTableController(
        router, computedAccountId, perPage, "ph", "kh")
    onMounted(() => hbarAllowanceTableController.mount())
    onBeforeUnmount(() => hbarAllowanceTableController.unmount())

    //
    // Token Allowances Table Controller
    //
    const tokenAllowanceTableController = new TokenAllowanceTableController(
        router, computedAccountId, perPage, "pt", "kt")
    onMounted(() => tokenAllowanceTableController.mount())
    onBeforeUnmount(() => tokenAllowanceTableController.unmount())

    //
    // NFT Allowances Table Controller
    //
    const nftAllowanceTableController = new NftAllowanceTableController(
        router, computedAccountId, perPage, "pn", "kn")
    onMounted(() => nftAllowanceTableController.mount())
    onBeforeUnmount(() => nftAllowanceTableController.unmount())

    const notWithMetamaskDialogVisible = ref(false)

    const onClick = () => {
      if (walletManager.isHederaWallet.value) {
        showApproveAllowanceDialog.value = true
        currentHbarAllowance.value = null
        currentTokenAllowance.value = null
      } else {
        notWithMetamaskDialogVisible.value = true
      }
    }

    const onApprove = () => {
      hbarAllowanceTableController.unmount()
      tokenAllowanceTableController.unmount()
      hbarAllowanceTableController.mount()
      tokenAllowanceTableController.mount()
    }

    const onEditHbar = (allowance: CryptoAllowance) => {
      // console.log("Edit Hbar Allowance: " + JSON.stringify(allowance))
      if (walletManager.isHederaWallet.value) {
        currentHbarAllowance.value = allowance
        currentTokenAllowance.value = null
        showApproveAllowanceDialog.value = true
      } else {
        notWithMetamaskDialogVisible.value = true
      }
    }

    const onEditToken = (allowance: TokenAllowance) => {
      // console.log("Edit Token Allowance: " + JSON.stringify(allowance))
      if (walletManager.isHederaWallet.value) {
        currentHbarAllowance.value = null
        currentTokenAllowance.value = allowance
        showApproveAllowanceDialog.value = true
      } else {
        notWithMetamaskDialogVisible.value = true
      }
    }

    const onDeleteNft = (allowance: NftAllowance) => {
      // console.log("Delete NFT Allowance: " + JSON.stringify(allowance))
      if (walletManager.isHederaWallet.value) {
        showDeleteAllowanceDialog.value = true
      } else {
        notWithMetamaskDialogVisible.value = true
      }
    }

    const cleanUpRouteQuery = async () => {
      const query = {...router.currentRoute.value.query}
      if (query.app) {
        delete query.app

        const failure = await router.replace({query: query})
        if (failure && failure.type != 8 && failure.type != 16) {
          console.warn(failure.message)
        }
      }
    }

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      selectedTab,
      tabIds,
      tabLabels,
      onUpdate,
      showApproveAllowanceDialog,
      isWalletConnected,
      isHederaWallet: walletManager.isHederaWallet,
      hbarAllowanceTableController,
      tokenAllowanceTableController,
      nftAllowanceTableController,
      currentTokenAllowance,
      currentHbarAllowance,
      onClick,
      onApprove,
      ownerAccountId: walletManager.accountId,
      onEditHbar,
      onEditToken,
      onDeleteNft,
      notWithMetamaskDialogVisible,
      Mode
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>