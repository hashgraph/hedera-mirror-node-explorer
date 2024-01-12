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

<template class="">
  <button id="showStakingDialog" class="button is-white h-is-smaller"
          @click="handleAction">IMPORT TO {{ walletName.toUpperCase() }}</button>
  <span style="display: inline-block">

  <ProgressDialog v-model:show-dialog="showProgressDialog"
                    :mode="progressDialogMode"
                    :main-message="progressMainMessage"
                    :extra-message="progressExtraMessage"
                    :extra-transaction-id="progressExtraTransactionId"
                    :show-spinner="showProgressSpinner"
    >
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">Import to {{ walletName }}</span>
    </template>
  </ProgressDialog>

  </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType, ref} from "vue";
import {TokenAssociationStatus, TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer";
import {walletManager} from "@/router";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";

export default defineComponent({
  name: "MetaMaskImport",
  components: {ProgressDialog},
  props: {
    analyzer: {
        type: Object as PropType<TokenInfoAnalyzer>,
        required: true
    }
  },
  setup(props) {

    //
    // Progress dialog
    //

    const showProgressDialog = ref(false)
    const progressDialogMode = ref(Mode.Busy)
    const progressMainMessage = ref<string|null>(null)
    const progressExtraMessage = ref<string|null>(null)
    const progressExtraTransactionId = ref<string|null>(null)
    const showProgressSpinner = ref(false)


    const handleAction = async () => {
      const tokenId = props.analyzer.tokenId.value!
      const accountId = walletManager.accountId.value!
      try {
          if (props.analyzer.associationStatus.value == TokenAssociationStatus.Dissociated) {
              showProgressDialog.value = true
              showProgressSpinner.value = true
              progressMainMessage.value = "Associating token " + tokenId + " to account " + accountId
              try {
                  await walletManager.associateToken(tokenId)
              } finally {
                  props.analyzer.tokenAssociationDidChange()
              }
          }
        await walletManager.watchToken(tokenId)
        showProgressDialog.value = false
      } catch(reason) {
        if (reason instanceof WalletDriverCancelError) {
          showProgressDialog.value = false
        } else {
          showProgressDialog.value = true
          progressDialogMode.value = Mode.Error
          if (reason instanceof WalletDriverError) {
            progressMainMessage.value = reason.message
            progressExtraMessage.value = reason.extra
          } else {
            progressMainMessage.value = "Unexpected error"
            progressExtraMessage.value = JSON.stringify(reason)
          }
        }
      }
    }

    return {
        handleAction,
        showProgressDialog,
        progressDialogMode,
        progressMainMessage,
        progressExtraMessage,
        progressExtraTransactionId,
        showProgressSpinner,
        walletName: walletManager.walletName.value
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
