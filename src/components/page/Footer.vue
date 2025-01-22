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

  <div class="footer-root">

    <div class="footer-left">
      <a v-if="builtOnURL" :href="builtOnURL">
        <img id="built-on-logo-new" alt="Built On Logo" :src="builtOnLogoURL ?? ''" class="footer-logo">
      </a>
      <img v-else id="built-on-logo-new" alt="Built On Logo" :src="builtOnLogoURL ?? ''" class="footer-logo">

      <div class="footer-text">
        <div class="footer-text-item">
          {{ productDescription }}
        </div>

        <template v-if="termsOfUseURL">
          <div class="line"></div>

          <a data-cy="termsOfUse" :href="termsOfUseURL" style="line-height: 1rem">
            <div class="footer-text-item">
              See Terms of Service
            </div>
          </a>
        </template>

        <div class="line"></div>

        <div class="footer-text-item">
          <span>Release </span>
          <a :href="buildReleaseUrl">{{ buildRelease }}</a>
          <span> built {{ buildTime }}</span>
        </div>
      </div>
    </div>

    <a v-if="sponsorURL" :href="sponsorURL" class="footer-logo">
      <img id="sponsor-logo-new" alt="Sponsor Logo" :src="sponsorLogoURL ?? ''">
    </a>
    <img v-else class="footer-logo" id="sponsor-logo-new" alt="Sponsor Logo" :src="sponsorLogoURL ?? ''">
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject} from "vue";
import {CoreConfig} from "@/config/CoreConfig";
import {ThemeController} from "@/components/ThemeController.ts";

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

const coreConfig = CoreConfig.inject()
const productDescription = coreConfig.productDescription

const darkSelected = ThemeController.inject().darkSelected
const builtOnLogoURL = computed(() =>
    darkSelected.value ? coreConfig.builtOnLogoDarkURL : coreConfig.builtOnLogoLightURL
)
const sponsorLogoURL = computed(() =>
    darkSelected.value ? coreConfig.sponsorLogoDarkURL : coreConfig.sponsorLogoLightURL
)

const builtOnURL = coreConfig.builtOnURL
const sponsorURL = coreConfig.sponsorURL
const termsOfUseURL = coreConfig.termsOfUseURL

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.footer-root {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin: 32px
}

div.footer-left {
  align-items: center;
  display: flex;
  gap: 40px;
  justify-content: flex-start;
}

div.footer-text {
  align-items: baseline;
  display: flex;
  gap: 12px;
  height: 16px;
  justify-content: flex-start;
}

div.footer-text-item {
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  color: var(--text-primary);
}

.footer-logo {
  max-width: 120px;
}

div.line {
  align-self: center;
  border: 1px solid var(--text-secondary);
  rotate: -90deg;
  width: 16px;
}

</style>
