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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <div class="columns is-multiline">

      <div :class="{'is-full': !displaySideBySide}" class="column has-text-left">

        <DashboardCard>
          <template v-slot:title>
            <span class="h-is-primary-title">Recent Non Fungible Tokens</span>
          </template>
          <template v-slot:control>
            <PlayPauseButton v-bind:controller="nftTableController"/>
          </template>
          <template v-slot:content>
            <TokenTable :controller="nftTableController"/>
          </template>
        </DashboardCard>

      </div>

      <div class="column has-text-left">

        <DashboardCard>
          <template v-slot:title>
            <span class="h-is-primary-title">Recent Fungible Tokens</span>
          </template>
          <template v-slot:control>
            <PlayPauseButton v-bind:controller="tokenTableController"/>
          </template>
          <template v-slot:content>
            <TokenTable :controller="tokenTableController"/>
          </template>
        </DashboardCard>

      </div>

    </div>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import TokenTable from "@/components/token/TokenTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import {TokenTableController} from "@/components/token/TokenTableController";
import {useRouter} from "vue-router";
import {TokenType} from "@/schemas/HederaSchemas";

export default defineComponent({
  name: 'Tokens',

  props: {
    network: String
  },

  components: {
    PlayPauseButton,
    Footer,
    DashboardCard,
    TokenTable
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const displaySideBySide = inject('isLargeScreen', true)

    //
    // NFT and TOKEN TableController
    //
    const perPage = ref(isMediumScreen ? 15 : 10)
    const nftTableController = new TokenTableController(useRouter(), perPage, ref(TokenType.NON_FUNGIBLE_UNIQUE), "p1", "k1")
    const tokenTableController = new TokenTableController(useRouter(), perPage, ref(TokenType.FUNGIBLE_COMMON), "p2", "k2")
    onMounted(() => {
      nftTableController.mount()
      tokenTableController.mount()
    })
    onBeforeUnmount(() => {
      nftTableController.unmount()
      tokenTableController.unmount()
    })

    return {
      isSmallScreen,
      isTouchDevice,
      displaySideBySide,
      nftTableController,
      tokenTableController
    }

  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>