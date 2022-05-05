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

    <hr class="h-top-banner mb-4 mt-0" style="height: 1px"/>

    <div class="is-flex is-align-items-center">

      <a href="https://hedera.com" style="line-height: 1">
        <img alt="Built On Hedera" src="@/assets/built-on-hedera-white.svg" style="min-width: 104px;">
      </a>

      <span v-if="!isTouchDevice && isSmallScreen"
            class="h-is-property-text ml-5 pb-1"
            style="font-weight:300; color: #DBDBDB">
        Hedera Mirror Node Explorer is a ledger explorer for the Hedera network.
      </span>

      <span class="is-flex-grow-1"/>

      <a class="ml-4" href="#" style="line-height: 1">
        <img alt="Sponsor Logo" src="@/assets/branding/brand-sponsor-logo.png" style="max-width: 104px;">
      </a>

    </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject} from "vue";

export default defineComponent({
  name: "Footer",

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    return {
      isSmallScreen,
      isTouchDevice
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
</style>