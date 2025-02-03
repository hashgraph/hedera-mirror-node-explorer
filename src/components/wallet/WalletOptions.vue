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
  <div class="wallet-options">

    <!-- header -->
    <div class="wallet-options-title">
      Title
    </div>

    <!-- content -->
    <div class="wallet-options-content">

      <!-- EVM Address -->
      <GroupBoxView>
        <template #groupBoxTitle>EVM Address</template>
        <template #default>
          Nice EVM Address
        </template>
      </GroupBoxView>

      <!-- Balance -->
      <GroupBoxView>
        <template #groupBoxTitle>Balance</template>
        <template #default>
          HBAR 1458.15115
          $ 50.00
        </template>
      </GroupBoxView>

    </div>

    <!-- footer -->
    <div class="wallet-options-footer">
      <ButtonView>CHANGE ACCOUNT</ButtonView>
      <ButtonView>DISCONNECT WALLET</ButtonView>
    </div>

  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import GroupBoxView from "@/elements/GroupBoxView.vue";
import ButtonView from "@/dialogs/core/ButtonView.vue";

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.wallet-options {
  display: flex;
  flex-direction: column;
  row-gap: 24px;
  align-items: stretch;
}

div.wallet-options-title {
  display: flex;
  align-items: center;
  color: var(--text-primary);
  border-bottom-color: var(--network-theme-color);
  border-bottom-style: solid;
  border-bottom-width: 1px;
  padding-bottom: 16px;
}

div.wallet-options-content {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  row-gap: 8px;
}

div.wallet-options-footer {
  display: flex;
  column-gap: 8px;
  align-items: center;
}


</style>
