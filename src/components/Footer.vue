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
  <section class="section pt-0"
           :class="{'h-mobile-background': !keepBackground && (isTouchDevice || !isSmallScreen)}">

    <hr class="h-has-background-color mb-4 mt-0" style="height: 1px"/>

    <div class="is-flex is-align-items-center">

      <a v-if="builtOnURL" :href="builtOnURL" style="line-height: 1;">
        <img v-if="builtOnLogoURL" alt="Built On Logo" :src="builtOnLogoURL" class="footer-logo">
        <img v-else alt="Built On Logo" src="@/assets/built-on-hedera-white.svg" class="footer-logo">
      </a>
      <div v-else style="line-height: 1;">
        <img v-if="builtOnLogoURL" alt="Built On Logo" :src="builtOnLogoURL" class="footer-logo">
        <img v-else alt="Built On Logo" src="@/assets/built-on-hedera-white.svg" class="footer-logo">
      </div>

      <div class="is-flex is-flex-direction-column is-align-items-flex-start ml-5">
        <span class="h-is-property-text pb-1" style="font-weight:300; color: #DBDBDB">
          <span v-if="!isTouchDevice && isMediumScreen">{{ productDescription }}</span>
          <span v-else>{{ productName }}</span>
        </span>
        <span class="h-is-text-size-1" style="font-weight:300; color: #DBDBDB">
          Release <a :href="buildReleaseUrl">{{ buildRelease }}</a> built {{ buildTime }}
        </span>
        <a data-cy="termsOfUse" v-if="termsOfUseURL" :href="termsOfUseURL" style="line-height: 1rem">
          <span class="h-is-text-size-3" style="font-weight:300">
           See Terms of Service
          </span>
        </a>
      </div>

      <span class="is-flex-grow-1"/>

      <a v-if="sponsorURL" :href="sponsorURL" class="ml-4" style="line-height: 1;">
        <img v-if="sponsorLogoURL" alt="Sponsor Logo" :src="sponsorLogoURL" class="footer-logo">
        <img v-else alt="Sponsor Logo" src="@/assets/branding/brand-sponsor-logo.png" class="footer-logo">
      </a>
      <div v-else class="ml-4" style="line-height: 1;">
        <img v-if="sponsorLogoURL" alt="Sponsor Logo" :src="sponsorLogoURL" style="max-width: 104px;">
        <img v-else alt="Sponsor Logo" src="@/assets/branding/brand-sponsor-logo.png" class="footer-logo">
      </div>

    </div>

  </section>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject} from "vue";
import {CoreConfig} from "@/config/CoreConfig";

export default defineComponent({
  name: "Footer",

  props: {
    keepBackground: {
      type: Boolean,
      default: false
    }
  },

  setup() {
    let buildRelease = inject('buildRelease', "not available")
    let buildReleaseUrl = "https://github.com/hashgraph/hedera-mirror-node-explorer"
    const buildShortCommitHash = inject('buildShortCommitHash', "not available")
    const disposableReleaseDetails = "-0-g" + buildShortCommitHash;
    if (buildRelease.includes(disposableReleaseDetails)) {
      // Commit matches a specific release (i.e., v23.5.0), show only release version
      buildRelease = buildRelease.replace(disposableReleaseDetails, "")
      // Link release page
      buildReleaseUrl += "/releases/tag/" + buildRelease
    } else {
      // Show git version (<tag>-<commit distance>-<short commit hash> (i.e., v23.5.0-1-g706e821)
      // Link to specific commit
      buildReleaseUrl += "/tree/" + buildShortCommitHash
    }
    const buildTime = inject('buildTime', "not available")

    const isMediumScreen = inject('isMediumScreen', true)
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const coreConfig = CoreConfig.inject()
    const productName = coreConfig.productName
    const productDescription = coreConfig.productDescription
    const builtOnLogoURL = coreConfig.builtOnLogoURL
    const builtOnURL = coreConfig.builtOnURL
    const sponsorLogoURL = coreConfig.sponsorLogoURL
    const sponsorURL = coreConfig.sponsorURL
    const termsOfUseURL = coreConfig.termsOfUseURL


    return {
      buildRelease,
      buildReleaseUrl,
      buildTime,
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      productName,
      productDescription,
      builtOnLogoURL,
      builtOnURL,
      sponsorLogoURL,
      sponsorURL,
      termsOfUseURL
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
.footer-logo {
  width: 100%;
  max-width: 104px;
  max-height: 48px;
}
</style>
