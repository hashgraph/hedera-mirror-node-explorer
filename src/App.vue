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
import {errorKey, explanationKey, loadingKey, suggestionKey} from "@/AppKeys"
import {AxiosMonitor} from "@/utils/AxiosMonitor"

// export const XLARGE_BREAKPOINT = 1240
export const LARGE_BREAKPOINT = 1160
export const MEDIUM_BREAKPOINT = 1024
export const SMALL_BREAKPOINT = 768
// this will eventually be the window min width
// export const FINAL_BREAKPOINT = 576
// temporary limit under which "mobile coming soon" is displayed
export const FINAL_BREAKPOINT = 640

export const ORUGA_MOBILE_BREAKPOINT = "1023px"

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

    // const isXLargeScreen = computed(() => {
    //   return windowWidth.value >= XLARGE_BREAKPOINT
    // })
    // provide('isXLargeScreen', isXLargeScreen)

    const sizeFallBack = computed(() => {
      return windowWidth.value < FINAL_BREAKPOINT
    })
    provide('sizeFallBack', sizeFallBack)

    const  onResizeHandler = () => {
      windowWidth.value = window.innerWidth
    }

    const loading = ref(false)
    const error = ref(false)
    const explanation = ref("")
    const suggestion = ref("")
    const monitorStateDidChange = () => {
      const activeRequestCount = AxiosMonitor.instance.getActiveRequestCount()
      const errorResponseCount = AxiosMonitor.instance.getErrorResponses().size

      loading.value = activeRequestCount >= 1
      error.value = errorResponseCount >= 1
      explanation.value = AxiosMonitor.instance.makeExplanationOrSuggestion(true)
      suggestion.value = AxiosMonitor.instance.makeExplanationOrSuggestion(false)
    }
    provide(loadingKey,     loading)
    provide(errorKey,       error)
    provide(explanationKey, explanation)
    provide(suggestionKey,  suggestion)

    onMounted(() => {
      windowWidth.value = window.innerWidth
      window.addEventListener('resize', onResizeHandler);
      AxiosMonitor.instance.setStateChangeCB(monitorStateDidChange)
    })

    onBeforeUnmount(() => {
      AxiosMonitor.instance.setStateChangeCB(null)
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
