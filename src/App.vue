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

<template>

  <section class="section is-top-section" :class="{'is-medium-screen': isMediumScreen}">
    <TopNavBar/>
  </section>

  <hr v-if="!onMainDashboardPage" class="h-has-background-color" style="margin: 0; height: 4px"/>

  <router-view/>

  <CookiesDialog v-model:show-dialog="showCookiesDialog"
                 @onChooseReject="handleChooseRejectCookies"
                 @onChooseAccept="handleChooseAcceptCookies">
  </CookiesDialog>

</template>

<script setup lang="ts">

import {computed, onBeforeMount, onBeforeUnmount, onMounted, PropType, provide, ref, watch} from 'vue';
import TopNavBar from "@/components/TopNavBar.vue";
import {coreConfigKey, errorKey, explanationKey, initialLoadingKey, loadingKey, suggestionKey} from "@/AppKeys"
import {AxiosMonitor} from "@/utils/AxiosMonitor"
import {useRoute} from "vue-router";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import CookiesDialog from "@/components/CookiesDialog.vue";
import {AppStorage} from "@/AppStorage";
import {LARGE_BREAKPOINT, MEDIUM_BREAKPOINT, SMALL_BREAKPOINT, XLARGE_BREAKPOINT} from "@/BreakPoints";
import {CoreConfig} from "@/config/CoreConfig";

const props = defineProps({
  "coreConfig": {
    type: Object as PropType<CoreConfig>,
    required: true
  }
})

const route = useRoute()
const onMainDashboardPage = computed(() => {
  return route.name == "MainDashboard"
})

const buildRelease = import.meta.env.VITE_BUILD_RELEASE ?? "not available"
provide('buildRelease', buildRelease)

const buildShortCommitHash = import.meta.env.VITE_BUILD_SHORTCOMMITHASH ?? "not available"
provide('buildShortCommitHash', buildShortCommitHash)

const buildTime = import.meta.env.VITE_BUILD_TIME_UTC ?? "not available"
provide('buildTime', buildTime)

const isTouchDevice = ('ontouchstart' in window)
provide('isTouchDevice', isTouchDevice)

const windowWidth = ref(window.screen.width)
provide('windowWidth', windowWidth)

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

const isXLargeScreen = computed(() => {
  return windowWidth.value >= XLARGE_BREAKPOINT
})
provide('isXLargeScreen', isXLargeScreen)

const onResizeHandler = () => {
  windowWidth.value = window.innerWidth
}

provide(coreConfigKey, props.coreConfig)

const showCookiesDialog = ref(false)

const acceptCookies = ref<boolean | null>(null)
watch(acceptCookies, (value) => {
  if (value != null && value && props.coreConfig.googleTagID !== null) {
    insertGoogleTag(props.coreConfig.googleTagID)
  }
})

provide(loadingKey, AxiosMonitor.instance.loading)
provide(initialLoadingKey, AxiosMonitor.instance.initialLoading)
provide(errorKey, AxiosMonitor.instance.error)
provide(explanationKey, AxiosMonitor.instance.explanation)
provide(suggestionKey, AxiosMonitor.instance.suggestion)

onBeforeMount(() => {
  const tagId = props.coreConfig.googleTagID
  if (tagId != undefined && tagId.length > 0) {
    acceptCookies.value = AppStorage.getAcceptCookiePolicy()
    showCookiesDialog.value = (acceptCookies.value == null)
  } else {
    acceptCookies.value = null
    showCookiesDialog.value = false
  }
  networkRegistry.readCustomConfig()
})

onMounted(() => {
  windowWidth.value = window.innerWidth
  window.addEventListener('resize', onResizeHandler);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', onResizeHandler);
})

const handleChooseRejectCookies = () => {
  acceptCookies.value = false
  AppStorage.setAcceptCookiePolicy(false)
}

const handleChooseAcceptCookies = () => {
  acceptCookies.value = true
  AppStorage.setAcceptCookiePolicy(true)
}

function insertGoogleTag(tagId: string) {
  const src1 = `https://www.googletagmanager.com/gtag/js?id=${tagId}`
  let s1 = document.createElement('script');
  s1.setAttribute('async', '');
  s1.setAttribute('src', src1);
  document.head.appendChild(s1);

  // https://developers.google.com/analytics/devguides/collection/ga4/views?client_type=gtag#manual_pageviews
  const src2 = `window.dataLayer = window.dataLayer || [];
    function gtag() {dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${tagId}',{ send_page_view: false });`
  let s2 = document.createElement('script');
  s2.innerHTML = src2;
  document.head.appendChild(s2);
}

</script>

<style scoped>

section.section.is-top-section {
  padding-top: 0;
  padding-bottom: 0;
  background-image: url("assets/block-chain-bg.png");
  background-repeat: no-repeat;
  background-size: 104px
}

section.section.is-top-section.is-medium-screen {
  padding-bottom: 30px;
  background-size: 112px
}

</style>
