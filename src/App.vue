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

  <router-view/>

</template>

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, provide, ref} from 'vue';
import TopNavBar from "@/components/TopNavBar.vue";
import {errorKey, explanationKey, initialLoadingKey, loadingKey, suggestionKey} from "@/AppKeys"
import {AxiosMonitor} from "@/utils/AxiosMonitor"

export const XLARGE_BREAKPOINT = 1450
export const LARGE_BREAKPOINT = 1280
export const MEDIUM_BREAKPOINT = 1080
export const SMALL_BREAKPOINT = 768
export const FINAL_BREAKPOINT = 640

export const ORUGA_MOBILE_BREAKPOINT = "1080px"

export default defineComponent({
  name: 'App',
  components: {TopNavBar},

  setup() {
    const buildTime = document.documentElement.dataset.buildTimestampUtc ?? "not available"
    provide('buildTime', buildTime)

    const isTouchDevice = ('ontouchstart' in window)
    provide('isTouchDevice', isTouchDevice)

    const windowWidth = ref(window.screen.width)

    const isSmallScreen = computed(() => {
      return windowWidth.value > SMALL_BREAKPOINT
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

    const  onResizeHandler = () => {
      windowWidth.value = window.innerWidth
    }

    provide(loadingKey,         AxiosMonitor.instance.loading)
    provide(initialLoadingKey,  AxiosMonitor.instance.initialLoading)
    provide(errorKey,           AxiosMonitor.instance.error)
    provide(explanationKey,     AxiosMonitor.instance.explanation)
    provide(suggestionKey,      AxiosMonitor.instance.suggestion)

    onMounted(() => {
      windowWidth.value = window.innerWidth
      window.addEventListener('resize', onResizeHandler);
    })

    onBeforeUnmount(() => {
      window.removeEventListener('resize', onResizeHandler);
    })
  },
});
</script>

<style scoped>

section.section.is-top-section {
  padding-top: 0;
  padding-bottom: 0;
  background-image: url("assets/block-chain-bg.png");
  background-repeat: no-repeat;
  background-size: 104px
}

@media (min-width: 1024px) {
  section.section.is-top-section {
    padding-top: 0;
    padding-bottom: 30px;
    background-image: url("assets/block-chain-bg.png");
    background-repeat: no-repeat;
    background-size: 112px
  }
}

</style>
