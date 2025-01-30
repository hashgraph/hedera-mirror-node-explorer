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

  <!-- Single action -->

  <template v-if="actionCount === 1">

    <ButtonView
        v-if="associateEnabled"
        :enabled="true"
        :size="ButtonSize.medium"
        @action="showAssociateDialog=true"
    >ASSOCIATE</ButtonView>

    <ButtonView
        v-if="dissociateEnabled"
        :enabled="true"
        :size="ButtonSize.medium"
        @action="showDissociateDialog=true"
    >DISSOCIATE</ButtonView>

    <ButtonView
        v-if="rejectEnabled"
        :enabled="true"
        :size="ButtonSize.medium"
        @action="showRejectDialog=true"
    >REJECT</ButtonView>

    <ButtonView
        v-if="claimEnabled"
        :enabled="true"
        :size="ButtonSize.medium"
        @action="showClaimDialog=true"
    >CLAIM</ButtonView>

    <ButtonView
        v-if="importEnabled"
        :enabled="true"
        :size="ButtonSize.medium"
        @action="showImportDialog=true"
    >IMPORT</ButtonView>

  </template>

  <!-- Multiple actions -->

  <template v-else-if="actionCount >= 2">

  </template>

  <AssociateTokenDialog
      v-model:show-dialog="showAssociateDialog"
      :analyzer="analyzer"
      @token-associated="emit('completed')"/>

  <DissociateTokenDialog
      v-model:show-dialog="showDissociateDialog"
      :analyzer="analyzer"
      @token-dissociated="emit('completed')"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType, ref} from "vue";
import {TokenAssociationStatus, TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer.ts";
import {walletManager} from "@/router.ts";
import ButtonView from "@/dialogs/core/ButtonView.vue";
import AssociateTokenDialog from "@/dialogs/token/AssociateTokenDialog.vue";
import DissociateTokenDialog from "@/dialogs/token/DissociateTokenDialog.vue";
import {ButtonSize} from "@/dialogs/core/DialogUtils.ts";

const props = defineProps({
  analyzer: {
    type: Object as PropType<TokenInfoAnalyzer>,
    required: true
  }
})

const emit = defineEmits(["completed"])

/*

  T   : token
  TA  : treasury account of T
  WA  : account from connected wallet

  | Actions       | TA == WA   |                         TA != WA                        |
  |               |            |-------------------+------------------+------------------+
  |               |            | T is dissociated  | T is associated  | T is an airdrop  |
  |               |            | from WA           | to WA            | to WA            |
  |---------------+------------+-------------------+------------------+------------------+
  | Associate     +            | x                 |                  | x                |
  | Dissociate    +            |                   | x                |                  |
  | Reject        +            |                   | x                |                  |
  | Claim         +            |                   |                  | x                |
  | Import        +            | x                 | x                | x                |


 */


//
// xxxEnabled
//

const actionCount = computed(() => {
  let result = 0
  if (associateEnabled.value) result += 1
  if (dissociateEnabled.value) result += 1
  if (rejectEnabled.value) result += 1
  if (claimEnabled.value) result += 1
  if (importEnabled.value) result += 1
  return result
})

const treasuryAccountId = computed(() => props.analyzer.treasuryAccount.value)
const associationStatus = computed(() => props.analyzer.associationStatus.value)
const balanceForConnectedAccount = computed(() => props.analyzer.balance.value)
const tokenAirdrops = computed(() => props.analyzer.pendingAirdrops.value)

const connectedAccountOK = computed(() =>
  walletManager.accountId.value !==  null && walletManager.accountId.value !== treasuryAccountId.value)

const associateEnabled = computed(
    () => connectedAccountOK.value
        && associationStatus.value === TokenAssociationStatus.Dissociated)

const dissociateEnabled = computed(
    () => connectedAccountOK.value
        && associationStatus.value === TokenAssociationStatus.Associated
        && balanceForConnectedAccount.value == 0)

const rejectEnabled = computed(
    () => connectedAccountOK.value
          && balanceForConnectedAccount.value !== null
          && balanceForConnectedAccount.value > 0 /* => token associated */)

const claimEnabled = computed(
    () => connectedAccountOK.value
          && tokenAirdrops.value !== null
          && tokenAirdrops.value.length >= 1)

const importEnabled = computed(() => walletManager.isImportSupported.value)


//
// showXXXDialog
//

const showAssociateDialog = ref(false)
const showDissociateDialog = ref(false)
const showRejectDialog = ref(false)
const showClaimDialog = ref(false)
const showImportDialog = ref(false)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
