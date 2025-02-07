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

  <DropdownPanel v-model:deployed="showWalletOptions" :right-aligned="true">
    <template #button>
      <ButtonView
          id="walletInfoBanner"
          :is-transparent="true"
          :is-default="true"
          :size="ButtonSize.medium"
          @action="showWalletOptions = !showWalletOptions"
      >
        <div class="left">
          <img :src="walletIconURL ?? undefined" alt="wallet logo">
          {{ accountId !== null ? accountId : "No account" }}
        </div>
        <div class="right">
          <i v-if="!showWalletOptions" class="fas fa-solid fa-angle-down"/>
          <i v-else class="fas fa-solid fa-angle-up"/>
        </div>
      </ButtonView>
    </template>
    <template #panel>
      <WalletOptions v-model:show-wallet-options="showWalletOptions"/>
    </template>
  </DropdownPanel>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {ref} from "vue";
import {walletManager} from "@/router.ts";
import DropdownPanel from "@/components/DropdownPanel.vue";
import ButtonView from "@/elements/ButtonView.vue";
import {ButtonSize} from "@/dialogs/core/DialogUtils.ts";
import WalletOptions from "@/components/wallet/WalletOptions.vue";

const accountId = walletManager.accountId
const walletIconURL = walletManager.walletIconURL
const showWalletOptions = ref(false)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.left {
  align-items: center;
  column-gap: 10px;
  display: flex;
  font-family: "Styrene A Web", sans-serif;
  justify-content: space-between;
}

div.right {
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding-left: 4px;
}

img {
  max-height: 24px;
}

figure {
  display: flex;
  align-items: center;
}

</style>
