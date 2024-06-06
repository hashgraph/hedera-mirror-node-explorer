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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span v-if="tokenInfo" class="h-is-primary-title mr-3">
          <span v-if="tokenInfo.type === 'NON_FUNGIBLE_UNIQUE'">NFT Collection</span>
          <span v-else>Fungible Token</span>
        </span>
        <router-link :to="tokenRoute">
          <div class="is-inline-block h-is-tertiary-text h-is-extra-text should-wrap" style="word-break: break-all">
            {{ `${displayName} (${displaySymbol})` }}
          </div>
        </router-link>
      </template>

      <template v-slot:subtitle>
        <div class="mt-3 h-is-tertiary-text">
          <span class="has-text-grey">for Account</span>
          <span class="ml-2"><AccountLink :account-id="normalizedAccountId"/></span>
        </div>
      </template>

      <template v-slot:content>
        <CollectionTable :token-id="tokenId" :controller="collectionTableController"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {useRouter} from "vue-router";
import {EntityID} from "@/utils/EntityID";
import {CollectionTableController} from "@/components/account/CollectionTableController";
import CollectionTable from "@/components/account/CollectionTable.vue";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer";
import {makeTokenName, makeTokenSymbol} from "@/schemas/HederaUtils";
import AccountLink from "@/components/values/link/AccountLink.vue";
import {routeManager} from "@/router";

export default defineComponent({

  name: 'AccountCollection',

  components: {
    AccountLink,
    CollectionTable,
    Footer,
    DashboardCard
  },

  props: {
    accountId: {
      type: String,
      required: true
    },
    tokenId: {
      type: String,
      required: true
    },
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const perPage = computed(() => isMediumScreen ? 15 : 5)
    const normalizedAccountId = computed(() => {
      const result = EntityID.parse(props.accountId) ?? EntityID.fromAddress(props.accountId)
      return result !== null ? result.toString() : null
    })

    const normalizedTokenId = computed(() => {
      const result = EntityID.parse(props.tokenId) ?? EntityID.fromAddress(props.tokenId)
      return result !== null ? result.toString() : null
    })
    const tokenLookup = TokenInfoCache.instance.makeLookup(normalizedTokenId)
    onMounted(() => tokenLookup.mount())
    onBeforeUnmount(() => tokenLookup.unmount())

    const tokenAnalyzer = new TokenInfoAnalyzer(tokenLookup.entity)
    onMounted(() => tokenAnalyzer.mount())
    onBeforeUnmount(() => tokenAnalyzer.unmount())

    const displayName = computed(() => makeTokenName(tokenLookup.entity.value, 80))
    const displaySymbol = computed(() => makeTokenSymbol(tokenLookup.entity.value, 80))

    const collectionTableController = new CollectionTableController(useRouter(), props.tokenId, normalizedAccountId, perPage);
    onMounted(() => {
      collectionTableController.mount()
    })
    onBeforeUnmount(() => {
      collectionTableController.unmount()
    })

    const tokenRoute = computed(() => routeManager.makeRouteToToken(props.tokenId))

    return {
      isSmallScreen,
      isTouchDevice,
      tokenInfo: tokenLookup.entity,
      displayName,
      displaySymbol,
      collectionTableController,
      normalizedAccountId,
      tokenRoute
    }
  }
});

</script>

<style/>
