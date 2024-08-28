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

      <div v-if="selectedTab === 'nft'" id="approvedForAll"
           class="is-flex is-align-items-center is-justify-content-end">
        <p class="has-text-weight-light">Approved for all</p>
        <label class="checkbox pt-1 ml-3">
          <input
              type="checkbox"
              v-model="selectApprovedForAll"
          >
        </label>
      </div>

      <div v-if="selectedTab === 'hbar'" id="hbarAllowancesTable">
        <HbarAllowanceTable
            :controller="hbarAllowanceTableController"
            @edit-allowance="onEditHbar"
        />
      </div>

      <div v-else-if="selectedTab === 'token'" id="tokenAllowancesTable">
        <TokenAllowanceTable
            :controller="tokenAllowanceTableController"
            @edit-allowance="onEditToken"
        />
      </div>

      <div v-else id="nftAllowancesTable">
        <NftAllSerialsAllowanceTable
            v-if="selectApprovedForAll"
            :controller="nftAllSerialsAllowanceTableController"
            @delete-allowance="onDeleteAllSerialsNft"
        />
        <NftAllowanceTable
            v-else
            :controller="nftAllowanceTableController"
            @delete-allowance="onDeleteNft"
        />
      </div>
    </template>

  </DashboardCard>

  <ApproveAllowanceDialog v-model:show-dialog="showApproveAllowanceDialog"
                          :owner-account-id="ownerAccountId"
                          :current-hbar-allowance="currentHbarAllowance"
                          :current-token-allowance="currentTokenAllowance"
                          :token-decimals="tokenDecimals"
                          @allowance-approved="onAllowanceApproved"
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

  <DeleteNftAllowanceDialog
      :controller="deleteDialogController"
      :nft-allowance="currentNftAllowance"
      :nft-all-serials-allowance="currentNftAllSerialsAllowance"
      @deleted="onNftDeleted"
  />

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
import {CryptoAllowance, Nft, NftAllowance, TokenAllowance} from "@/schemas/HederaSchemas";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import Tabs from "@/components/Tabs.vue";
import {AppStorage} from "@/AppStorage";
import NftAllowanceTable from "@/components/allowances/NftAllowanceTable.vue";
import {NftAllowanceTableController} from "@/components/allowances/NftAllowanceTableController";
import {NftAllSerialsAllowanceTableController} from "@/components/allowances/NftAllSerialsAllowanceTableController";
import NftAllSerialsAllowanceTable from "@/components/allowances/NftAllSerialsAllowanceTable.vue";
import {DialogController} from "@/components/dialog/DialogController";
import DeleteNftAllowanceDialog from "@/components/allowances/DeleteNftAllowanceDialog.vue";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";

export default defineComponent({
  name: 'AllowancesSection',

  components: {
    DeleteNftAllowanceDialog,
    NftAllSerialsAllowanceTable,
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

    const showApproveAllowanceDialog = ref(false)

    watch(showApproveAllowanceDialog, (newValue) => {
      if (!newValue) {
        cleanUpRouteQuery()
      }
    })

    const tabIds = ['hbar', 'token', 'nft']
    const tabLabels = ['HBAR', 'Tokens', 'NFTs']
    const selectedTab = ref<string|null>(AppStorage.getAccountAllowanceTab() ?? tabIds[0])
    const onUpdate = (tab: string|null) => {
      selectedTab.value = tab
      AppStorage.setAccountAllowanceTab(tab)
      switch (selectedTab.value) {
        case 'hbar':
          hbarAllowanceTableController.refresh()
          break
        case 'token':
          tokenAllowanceTableController.refresh()
          break
        case 'nft':
          if (selectApprovedForAll.value) {
            nftAllSerialsAllowanceTableController.refresh()
          } else {
            nftAllowanceTableController.refresh()
          }
          break
        default:
          //should not happen
      }
    }

    const selectApprovedForAll = ref(false)
    onMounted(() => selectApprovedForAll.value = AppStorage.getSelectApprovedForAll())
    watch(selectApprovedForAll, (value) => {
      AppStorage.setSelectApprovedForAll(value)
      value ? nftAllSerialsAllowanceTableController.refresh() : nftAllowanceTableController.refresh()
    })

    const perPage = ref(isMediumScreen ? 10 : 5)

    const currentHbarAllowance = ref<CryptoAllowance | null>(null)
    const currentTokenAllowance = ref<TokenAllowance | null>(null)
    const tokenDecimals = ref<string | null>(null)
    const currentNftAllowance = ref<Nft | null>(null)
    const currentNftAllSerialsAllowance = ref<NftAllowance | null>(null)

    //
    // HBAR Allowances Table Controller
    //
    const hbarAllowanceTableController = new HbarAllowanceTableController(
        router,
        computedAccountId,
        perPage,
        "ph", "kh"
    )
    onMounted(() => hbarAllowanceTableController.mount())
    onBeforeUnmount(() => hbarAllowanceTableController.unmount())

    //
    // Token Allowances Table Controller
    //
    const tokenAllowanceTableController = new TokenAllowanceTableController(
        router,
        computedAccountId,
        perPage,
        "pt", "kt"
    )
    onMounted(() => tokenAllowanceTableController.mount())
    onBeforeUnmount(() => tokenAllowanceTableController.unmount())

    //
    // NFT Allowances Table Controllers
    //
    const nftAllowanceTableController = new NftAllowanceTableController(
        router,
        computedAccountId,
        perPage,
        "pn", "kn"
    )
    const nftAllSerialsAllowanceTableController = new NftAllSerialsAllowanceTableController(
        router,
        computedAccountId,
        perPage,
        "pc", "kc"
    )
    onMounted(() => {
      nftAllowanceTableController.mount()
      nftAllSerialsAllowanceTableController.mount()
    })
    onBeforeUnmount(() => {
      nftAllowanceTableController.unmount()
      nftAllSerialsAllowanceTableController.unmount()
    })

    const deleteDialogController = new DialogController()

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

    const onAllowanceApproved = () => {
      hbarAllowanceTableController.refresh()
      tokenAllowanceTableController.refresh()
      nftAllowanceTableController.refresh()
      nftAllSerialsAllowanceTableController.refresh()
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

    const onEditToken = async (allowance: TokenAllowance) => {
      // console.log("Edit Token Allowance: " + JSON.stringify(allowance))
      if (walletManager.isHederaWallet.value) {
        const info = await TokenInfoCache.instance.lookup(allowance.token_id ?? '')
        tokenDecimals.value = info?.decimals ?? null
        currentHbarAllowance.value = null
        currentTokenAllowance.value = allowance
        showApproveAllowanceDialog.value = true
      } else {
        notWithMetamaskDialogVisible.value = true
      }
    }

    const onDeleteNft = async (nft: Nft) => {
      // console.log("Delete NFT Allowance: " + JSON.stringify(nft))
      if (walletManager.isHederaWallet.value) {
        currentNftAllowance.value = nft
        currentNftAllSerialsAllowance.value = null
        deleteDialogController.visible.value = true
      } else {
        notWithMetamaskDialogVisible.value = true
      }
    }

    const onDeleteAllSerialsNft = async (allowance: NftAllowance) => {
      // console.log("Delete NFT Allowance: " + JSON.stringify(allowance))
      if (walletManager.isHederaWallet.value) {
        currentNftAllowance.value = null
        currentNftAllSerialsAllowance.value = allowance
        deleteDialogController.visible.value = true
      } else {
        notWithMetamaskDialogVisible.value = true
      }
    }

    const onNftDeleted = () => {
      nftAllowanceTableController.refresh()
      nftAllSerialsAllowanceTableController.refresh()
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

    const onChangeApprovedForAll = (event: Event) => {
      const checked = (event.target as HTMLInputElement).checked
      selectApprovedForAll.value = checked
      AppStorage.setSelectApprovedForAll(checked)
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
      nftAllSerialsAllowanceTableController,
      tokenDecimals,
      currentTokenAllowance,
      currentHbarAllowance,
      currentNftAllowance,
      currentNftAllSerialsAllowance,
      onClick,
      onAllowanceApproved,
      ownerAccountId: walletManager.accountId,
      onEditHbar,
      onEditToken,
      onDeleteNft,
      onDeleteAllSerialsNft,
      onNftDeleted,
      deleteDialogController,
      notWithMetamaskDialogVisible,
      Mode,
      selectApprovedForAll,
      onChangeApprovedForAll
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>