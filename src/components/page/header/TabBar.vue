// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <div
    class="tab-bar"
    :class="{'vertical': props.vertical}"
  >
    <TabItem
      :tab-id="TabId.Dashboard"
      :target-route="routeManager.makeRouteToMainDashboard()"
    />
    <TabItem
      :tab-id="TabId.Transactions"
      :target-route="routeManager.makeRouteToTransactions()"
    />
    <TabItem
      :tab-id="TabId.Tokens"
      :target-route="routeManager.makeRouteToTokens()"
    />
    <TabItem
      :tab-id="TabId.Topics"
      :target-route="routeManager.makeRouteToTopics()"
    />
    <TabItem
      :tab-id="TabId.Contracts"
      :target-route="routeManager.makeRouteToContracts()"
    />
    <TabItem
      :tab-id="TabId.Accounts"
      :target-route="routeManager.makeRouteToAccounts()"
    />
    <TabItem
      :tab-id="TabId.Nodes"
      :target-route="routeManager.makeRouteToNodes()"
    />
    <TabItem
      v-if="enableStaking"
      :tab-id="TabId.Staking"
      :target-route="routeManager.makeRouteToStaking()"
    />
    <TabItem
      :tab-id="TabId.Blocks"
      :target-route="routeManager.makeRouteToBlocks()"
    />
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {routeManager} from "@/router.ts"
import {TabId} from "@/utils/RouteManager.ts"
import TabItem from "@/components/page/header/TabItem.vue";

const props = defineProps({
  vertical: {
    type: Boolean,
    default: false
  }
})

const enableStaking = routeManager.enableStaking

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.tab-bar {
  align-items: baseline;
  column-gap: 16px;
  display: flex;
  font-family: var(--font-family-heading), sans-serif;
  font-size: 14px;
  font-weight: 400;
  height: 42px;
  justify-content: space-between;
  padding: 11px 20px;
  line-height: 19px;
}

div.vertical {
  align-items: flex-start;
  flex-direction: column;
  height: fit-content;
  row-gap: 8px;
  padding: 0;
}

</style>
