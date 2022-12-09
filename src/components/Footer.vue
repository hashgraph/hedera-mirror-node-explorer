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

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <section class="section pt-0"
           :class="{'h-mobile-background': !keepBackground && (isTouchDevice || !isSmallScreen)}">

    <hr class="h-has-background-color mb-4 mt-0" style="height: 1px"/>

    <div class="is-flex is-align-items-center">

      <a href="https://hedera.com" style="line-height: 1">
        <img alt="Built On Hedera" src="@/assets/built-on-hedera-white.svg" style="min-width: 104px;">
      </a>

      <div class="is-flex is-flex-direction-column is-align-items-flex-start ml-5">
        <span class="h-is-property-text pb-1" style="font-weight:300; color: #DBDBDB">
          <span>{{ productName }}</span>
          <span v-if="!isTouchDevice && isMediumScreen"> is a ledger explorer for the Hedera network.</span>
        </span>
        <span class="h-is-text-size-1" style="font-weight:300; color: #DBDBDB">
          Built {{ buildTime }}
        </span>
        <a data-cy="termsOfUse" v-if="termsOfUseURL" :href="termsOfUseURL" style="line-height: 1rem">
          <span class="h-is-text-size-3" style="font-weight:300">
           See Terms of Use
          </span>
        </a>
      </div>

      <span class="is-flex-grow-1"/>

      <a v-if="sponsorURL" :href="sponsorURL" class="ml-4">
        <img alt="Sponsor Logo" src="@/assets/branding/brand-sponsor-logo.png" style="max-width: 104px;">
      </a>
      <div v-else class="ml-4" style="line-height: 1">
        <img alt="Sponsor Logo" src="@/assets/branding/brand-sponsor-logo.png" style="max-width: 104px;">
      </div>

    </div>

  </section>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject} from "vue";
import {getEnv} from "@/utils/getEnv";

export default defineComponent({
  name: "Footer",

  props: {
    keepBackground: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    const buildTime = inject('buildTime', "not available")

    const isMediumScreen = inject('isMediumScreen', true)
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const productName = getEnv('VUE_APP_PRODUCT_NAME') ?? "Hedera Mirror Node Explorer"
    const sponsorURL = getEnv('VUE_APP_SPONSOR_URL') ?? ""
    const termsOfUseURL = getEnv('VUE_APP_TERMS_OF_USE_URL') ? '/' + getEnv('VUE_APP_TERMS_OF_USE_URL') : ""

    return {
      buildTime,
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      productName,
      sponsorURL,
      termsOfUseURL
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
</style>