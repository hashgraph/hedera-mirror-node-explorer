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

  <DashboardCard v-if="accountId">
    <template v-slot:title>
      <span class="h-is-secondary-title">Allowances</span>
    </template>
    <template v-slot:control>
      <button v-if="isWalletConnected" id="approve-button" class="button is-white is-small"
              @click="handleApproveButton">APPROVE ALLOWANCE…
      </button>
    </template>
    <template v-slot:content><br/></template>
    <template v-slot:leftContent>
      <p class="h-is-tertiary-text mb-2">HBAR Allowances</p>
      <HbarAllowanceTable :controller="hbarAllowanceTableController" @edit-allowance="editHbarAllowance"/>
    </template>
    <template v-slot:rightContent>
      <p class="h-is-tertiary-text mb-2">Token Allowances</p>
      <TokenAllowanceTable :controller="tokenAllowanceTableController" @edit-allowance="editTokenAllowance"/>
    </template>
  </DashboardCard>

  <ApproveAllowanceDialog v-model:show-dialog="showApproveAllowanceDialog"
                          :owner-account-id="ownerAccountId"
                          :current-hbar-allowance="currentHbarAllowance"
                          :current-token-allowance="currentTokenAllowance"
                          @allowance-approved="handleApproval"
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
import {CryptoAllowance, TokenAllowance} from "@/schemas/HederaSchemas";

export default defineComponent({
  name: 'ApproveAllowanceSection',

  components: {ApproveAllowanceDialog, TokenAllowanceTable, HbarAllowanceTable, DashboardCard},

  props: {
    accountId: String,
    showApproveDialog: String
  },

  setup: function (props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)

    const computedAccountId = computed(() => props.accountId || null)
    // const isWalletConnected = computed(
    //     () => walletManager.connected.value && walletManager.accountId.value === props.accountId)
    const isWalletConnected = computed(() => false)
    const showApproveAllowanceDialog = ref(false)

    onMounted(() => {
      if (props.showApproveDialog === 'true' && isWalletConnected.value) {
        showApproveAllowanceDialog.value = true
      }
    })
    watch(isWalletConnected, (newValue) => {
      if (newValue && props.showApproveDialog === 'true') {
        showApproveAllowanceDialog.value = true
      }
    })

    watch(showApproveAllowanceDialog, (newValue) => {
      if (!newValue) {
        cleanUpRouteQuery()
      }
    })

    const perPage = computed(() => isMediumScreen ? 10 : 5)

    const currentHbarAllowance = ref<CryptoAllowance|null>(null)
    const currentTokenAllowance = ref<TokenAllowance|null>(null)

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

    const handleApproveButton = () => {
      showApproveAllowanceDialog.value = true
      currentHbarAllowance.value = null
      currentTokenAllowance.value = null
    }

    const handleApproval = () => {
      hbarAllowanceTableController.unmount()
      tokenAllowanceTableController.unmount()
      hbarAllowanceTableController.mount()
      tokenAllowanceTableController.mount()
    }

    const editHbarAllowance = (allowance: CryptoAllowance) => {
      console.log("Edit Hbar Allowance: " + JSON.stringify(allowance))
      currentHbarAllowance.value = allowance
      currentTokenAllowance.value = null
      showApproveAllowanceDialog.value = true
    }

    const editTokenAllowance = (allowance: TokenAllowance) => {
      console.log("Edit Token Allowance: " + JSON.stringify(allowance))
      currentHbarAllowance.value = null
      currentTokenAllowance.value = allowance
      showApproveAllowanceDialog.value = true
    }

    const cleanUpRouteQuery = async () => {
      const query = {...router.currentRoute.value.query}
      if (query.app) {
        delete query.app

        const failure = await router.replace({ query: query })
        if (failure && failure.type != 8 && failure.type != 16) {
          console.warn(failure.message)
        }
      }
    }

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      showApproveAllowanceDialog,
      isWalletConnected,
      hbarAllowanceTableController,
      tokenAllowanceTableController,
      currentTokenAllowance,
      currentHbarAllowance,
      handleApproveButton,
      handleApproval,
      ownerAccountId: walletManager.accountId,
      editHbarAllowance,
      editTokenAllowance,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>