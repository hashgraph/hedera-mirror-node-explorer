<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

<template>
  <section class="section is-top-section">
    <TopNavBar/>
  </section>

  <div v-if="sizeFallBack">
    <hr class="h-top-banner" style="margin: 0; height: 4px"/>

    <section class="section has-text-centered" style="height: calc(100vh - 300px)">

      <div class="block h-is-tertiary-text">
        <p style="font-weight: 300">Mobile support coming soon...</p>
        <p style="font-weight: 200">If on a desktop, please enlarge your browser window</p>
      </div>

    </section>
  </div>

  <div v-else>
    <router-view/>
  </div>

  <section v-if="!isTouchDevice" class="section">

    <hr class="h-top-banner mb-4 mt-0" style="height: 1px"/>

    <div class="is-flex is-align-items-center">

      <a href="https://hedera.com" style="line-height: 1">
        <img alt="Built On Hedera" src="@/assets/built-on-hedera-white.svg" style="min-width: 104px;">
      </a>

      <span class="h-is-property-text ml-5 pb-1" style="font-weight:300; color: #DBDBDB">
        Hedera Mirror Node Explorer is a ledger explorer for the Hedera network.
      </span>

      <span class="is-flex-grow-1"/>

      <a href="#" style="line-height: 1">
        <img alt="Sponsor Logo" src="@/assets/branding/brand-sponsor-logo.png" style="max-width: 124px;">
      </a>

    </div>

  </section>

</template>

<script lang="ts">

import {computed, defineComponent, onMounted, provide, ref} from 'vue';
import TopNavBar from "@/components/TopNavBar.vue";

export const XLARGE_BREAKPOINT = 1240
export const LARGE_BREAKPOINT = 1120
export const MEDIUM_BREAKPOINT = 1024
export const SMALL_BREAKPOINT = 768
// this will eventually be the window min width
// export const FINAL_BREAKPOINT = 576
// temporary limit under which "mobile coming soon" is displayed
export const FINAL_BREAKPOINT = 890

export const ORUGA_MOBILE_BREAKPOINT = SMALL_BREAKPOINT + "px"

export default defineComponent({
  name: 'App',
  components: {TopNavBar},

  setup() {
    const isTouchDevice = ('ontouchstart' in window)
    provide('isTouchDevice', isTouchDevice)

    const windowWidth = ref(window.screen.width)

    const isMobileScreen = computed(() => {
      return windowWidth.value < SMALL_BREAKPOINT
    })
    provide('isMobileScreen', isMobileScreen)

    const isSmallScreen = computed(() => {
      return windowWidth.value >= SMALL_BREAKPOINT
    })
    provide('isSmallScreen', isSmallScreen)

    const isMediumScreen = computed(() => {
      return windowWidth.value >= MEDIUM_BREAKPOINT
    })
    provide('isMediumScreen', isMediumScreen)

    const isLargeScreen = computed(() => {
      return windowWidth.value >= LARGE_BREAKPOINT
    })
    provide('isLargeScreen', isLargeScreen)

    const isXLargeScreen = computed(() => {
      return windowWidth.value >= XLARGE_BREAKPOINT
    })
    provide('isXLargeScreen', isXLargeScreen)

    const sizeFallBack = computed(() => {
      return windowWidth.value < FINAL_BREAKPOINT
    })
    provide('sizeFallBack', sizeFallBack)

    const  onResizeHandler = () => {
      windowWidth.value = window.innerWidth
    }

    onMounted(() => {
      windowWidth.value = window.innerWidth
      window.addEventListener('resize', onResizeHandler);
    })

    return {
      isTouchDevice,
      sizeFallBack
    }
  },
});
</script>

<style scoped>

section.section.is-top-section {
  padding-top: 0;
  padding-bottom: 30px;
  background-image: url("assets/block-chain-bg.png");
  background-repeat: no-repeat;
  background-size: 112px
}

</style>
