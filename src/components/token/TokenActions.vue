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
  <div>
  <!-- <div class="is-relative"> -->
    <button v-if="isEthereumWallet" id="showStakingDialog" class="button is-white h-is-smaller"
        @click="() => isActive = !isActive">TOKEN ACTIONS</button>

    <div v-if="isActive" class="token-actions-wrapper">
      <div v-if="isDissociated" id="showStakingDialog" class="token-actions-btn is-hover"
        @click="handleAssociate">TOKEN ASSOCIATE</div>

      <div v-if="isAssociated" id="showStakingDialog" class="token-actions-btn is-hover"
        @click="handleDissociate">TOKEN DISSOCIATE</div>

      <div v-if="isWatchAssetSupported" id="showStakingDialog" class="token-actions-btn is-hover"
        @click="handleImport">TOKEN IMPORT</div>
    </div>

    <button v-if="isHederaWallet" id="showStakingDialog" class="button is-white h-is-smaller"
        @click="() => isDissociated ? handleAssociate() : handleDissociate()">{{ isDissociated ? `TOKEN ASSOCIATE` : `TOKEN DISSOCIATE` }}</button>

    <ConfirmDialog :show-dialog="showConfirmDialog"
                   :main-message ="confirmMessage"
                   :extra-message="confirmExtraMessage"
                   @onConfirm="handleConfirm"
                   @onCancel="handleCancel">
        <template v-slot:dialogTitle>
            <span class="h-is-primary-title">
                {{ dialogTitle }}
            </span>
        </template>
        <template v-if="showWatchOption && isWatchAssetSupported" v-slot:dialogOption>
            <div class="is-flex is-align-items-center">
                <label class="checkbox mr-3">
                    <input type="checkbox" v-model="watchInWallet">
                </label>
                <p class="h-is-property-text">Import {{ tokenSymbol }} to {{ walletManager.walletName.value }}</p>
            </div>
        </template>
    </ConfirmDialog>

    <DynamicDialog :show-dialog="showDynamicDialog"
                   :main-message="dynamicMessage"
                   @onConfirm="handleConfirm"
                   @onCancel="handleCancel">
        <template v-slot:dialogTitle>
            <span class="h-is-primary-titlee">
                {{ dialogTitle }}
            </span>
        </template>

        <template v-slot:dialogInput>
          <div class="dynamic-dialog-input-wrapper">
            <p class="dynamic-dialog-input-title">
              Serial Number:
            </p>
            <input
                type="number"
                ref="serialNumberInputRef"
                v-model="tokenSerialNumber"
                class="serial-number-input-box" 
                placeholder="Input serial number..." 
            />
          </div>
        </template>
    </DynamicDialog>
    
    <ProgressDialog v-model:show-dialog="showProgressDialog"
                    :mode="progressDialogMode"
                    :main-message="progressMainMessage"
                    :extra-message="progressExtraMessage"
                    :extra-transaction-id="progressExtraTransactionId"
                    :show-spinner="showProgressSpinner">
        <template v-slot:dialogTitle>
            <span class="h-is-primary-title">{{ dialogTitle }}</span>
        </template>
    </ProgressDialog>

    <DoneDialog :show-dialog="showDoneDialog"
                :main-message ="doneMessage"
                @onDoneConfirm="handleDoneConfirm">
        <template v-slot:dialogTitle>
            <span class="h-is-primary-title">
                {{ dialogTitle }}
            </span>
        </template>
    </DoneDialog>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {walletManager} from "@/router";
import DoneDialog from '../DoneDialog.vue';
import ConfirmDialog from '../ConfirmDialog.vue';
import DynamicDialog from '../DynamicDialog.vue';
import {PropType, computed, defineComponent, ref} from "vue";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import { TokenAssociationStatus, TokenInfoAnalyzer } from './TokenInfoAnalyzer';
import { WalletDriverCancelError, WalletDriverError } from '@/utils/wallet/WalletDriverError';

export default defineComponent({
  name: "TokenActions",
  components: { ConfirmDialog, ProgressDialog, DoneDialog, DynamicDialog },
  props: {
    analyzer: {
        type: Object as PropType<TokenInfoAnalyzer>,
        required: true
    }
  },
  setup(props) {
    //
    // States
    //
    const action = ref("")
    const isActive = ref(false)
    const tokenSerialNumber = ref("")
    const serialNumberInputRef = ref(null)
    const isHederaWallet = computed(() => walletManager.isHederaWallet.value)
    const isEthereumWallet = computed(() => walletManager.isEthereumWallet.value)
    const isWatchAssetSupported = computed(() => walletManager.isEthereumWallet.value)

    //
    // Token Info States
    //
    const tokenType = computed(() => props.analyzer.isFungible.value ? "token" : "NFT")
    const tokenId = computed(() => props.analyzer.tokenId.value)
    const accountId = computed(() => walletManager.accountId.value)
    const tokenSymbol = computed(() => props.analyzer.tokenSymbol.value)
    const isAssociated = computed(() => props.analyzer.associationStatus.value == TokenAssociationStatus.Associated )
    const isDissociated = computed(() => props.analyzer.associationStatus.value == TokenAssociationStatus.Dissociated )


    //
    // Confirm dialog states
    //
    const watchInWallet = ref(false)
    const showConfirmDialog = ref(false)
    const dialogTitle = ref<string|null>(null)
    const confirmMessage = ref<string|null>(null)
    const confirmExtraMessage = ref<string|null>(null)
    const showWatchOption = computed(() => action.value === 'ASSOCIATE' && props.analyzer.isFungible.value)

    //
    // Dynamic dialog states
    //
    const showDynamicDialog = ref(false)
    const dynamicMessage = ref<string|null>(null)

    //
    // Progress dialog states
    //
    const showProgressDialog = ref(false)
    const showProgressSpinner = ref(false)
    const progressDialogMode = ref(Mode.Busy)
    const progressMainMessage = ref<string|null>(null)
    const progressExtraMessage = ref<string|null>(null)
    const progressExtraTransactionId = ref<string|null>(null)

    //
    // Done dialog states
    //
    const showDoneDialog = ref(false)
    const doneMessage = ref<string|null>(null)
    

    //
    // handleAssociate()
    //
    const handleAssociate = () => {
        action.value = 'ASSOCIATE'
        showConfirmDialog.value = true
        dialogTitle.value = `Associate ${tokenType.value} ${tokenId.value}`
        confirmMessage.value = `Confirm associating ${tokenType.value} ${tokenId.value! +"("+ tokenSymbol.value +")"} to account ${accountId.value}?`
        confirmExtraMessage.value = null
    }

    //
    // handleDissociate()
    //
    const handleDissociate = () => {
      action.value = 'DISSOCIATE'
      showConfirmDialog.value = true
      dialogTitle.value = `Dissociate ${tokenType.value} ${tokenId.value}`
      confirmMessage.value = `Confirm dissociating ${tokenType.value} ${tokenId.value!} (${tokenSymbol.value}) from account ${accountId.value}?`
      confirmExtraMessage.value = null
    }

    //
    // handleImport()
    //
    const handleImport = () => {
      action.value = "IMPORT_TOKEN"

      if (props.analyzer.isFungible.value) {
        dialogTitle.value = `Import token ${tokenId.value}`
        handleConfirm();
      } else {
        showDynamicDialog.value = true
        dialogTitle.value = `Import NFT`
        dynamicMessage.value = `Importing NFT ${tokenId.value!} (${tokenSymbol.value}) requires serial number of the token.`
      }
    }

    //
    // handleConfirm()
    //
    const handleConfirm = () => {
        isActive.value=false
        showConfirmDialog.value = false
        showDynamicDialog.value = false
        showProgressDialog.value = true
        showProgressSpinner.value = true
        progressMainMessage.value = null
        progressExtraMessage.value = null
        progressDialogMode.value = Mode.Busy
        switch (action.value) {
          case "ASSOCIATE": associateAction(); break;
          case "DISSOCIATE": dissociateAction(); break;
          case "IMPORT_TOKEN": importTokenAction(); break;
        }
    }

    //
    // handleDoneConfirm()
    //
    const handleDoneConfirm = () => {
      isActive.value = false
      doneMessage.value = null
      dialogTitle.value = null
      showDoneDialog.value = false
      tokenSerialNumber.value = ""
      showDynamicDialog.value = false
    }

    //
    // handleCancel()
    //
    const handleCancel = () => {
      isActive.value = false
      showConfirmDialog.value = false
      showDynamicDialog.value = false
    }

    //
    // associateAction()
    //
    const associateAction = async () => {
      try {
        if (props.analyzer.associationStatus.value == TokenAssociationStatus.Dissociated) {
              showProgressDialog.value = true
              showProgressSpinner.value = true
              progressMainMessage.value = `Associating ${tokenType.value} ${tokenId.value!} (${tokenSymbol.value}) to account ${accountId.value}...`
              
              try {
                  await walletManager.associateToken(tokenId.value!)
              } finally {
                  props.analyzer.tokenAssociationDidChange()
              }
          }

          if (watchInWallet.value) {
            await importTokenAction()
          } else {
            showDoneDialog.value = true
            dialogTitle.value = `Successfully associated ${tokenType.value} ${tokenId.value!}`
            doneMessage.value = `Successfully associated ${tokenType.value} ${tokenId.value!}(${tokenSymbol.value}) to account ${accountId.value}`
            showProgressDialog.value = false
          }
      } catch (reason) {
        handleError(reason)
      }
    }

    //
    // dissociateAction()
    //
    const dissociateAction = async () => {
      try {
        if (props.analyzer.associationStatus.value == TokenAssociationStatus.Associated) {
              showProgressDialog.value = true
              showProgressSpinner.value = true
              progressMainMessage.value = `Dissociating ${tokenType.value} ${tokenId.value!} (${tokenSymbol.value}) from account ${accountId.value}...`
              try {
                  await walletManager.dissociateToken(tokenId.value!)
              } finally {
                  props.analyzer.tokenAssociationDidChange()
              }
          }
          showProgressDialog.value = false
          showDoneDialog.value = true
          dialogTitle.value = `Successfully dissociated ${tokenType.value} ${tokenId.value!}`
          doneMessage.value = `Successfully dissociated ${tokenType.value} ${tokenId.value!}(${tokenSymbol.value}) from account ${accountId.value}`
      } catch (reason) {
        handleError(reason)
      }
    }

    //
    // importTokenAction()
    //
    const importTokenAction = async () => {
        try {
          if (props.analyzer.isFungible.value) {
            progressMainMessage.value = `Importing token ${tokenId.value} (${tokenSymbol.value}) to wallet ${walletManager.walletName.value}...`
            await walletManager.watchToken(tokenId.value!)
          } else {
            dialogTitle.value = `Import NFT ${tokenId.value}(${tokenSymbol.value}) #${tokenSerialNumber.value}`
            progressMainMessage.value = `Importing NFT ${tokenId.value}(${tokenSymbol.value}) #${tokenSerialNumber.value} to wallet ${walletManager.walletName.value}...`
            await walletManager.watchToken(tokenId.value!, tokenSerialNumber.value.toString())
          }

          isActive.value = false
          showDoneDialog.value = true
          showProgressDialog.value = false
          dialogTitle.value = `Successfully imported ${tokenType.value} ${tokenId.value!}`
          doneMessage.value = `Successfully imported ${tokenType.value} ${tokenId.value!}(${tokenSymbol.value}) ${!props.analyzer.isFungible.value && `#${tokenSerialNumber.value}`} to ${walletManager.walletName.value}`
        } catch (reason) {
          handleError(reason)
        }
    }

    //
    // handleError()
    //
    const handleError = (reason: unknown) => {
      if (reason instanceof WalletDriverCancelError) {
          showProgressDialog.value = false
      } else {
        showProgressDialog.value = true
        showProgressSpinner.value = false
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


    return {
      isActive,
      dialogTitle,
      tokenSymbol,
      doneMessage,
      handleCancel,
      isAssociated,
      handleImport,
      watchInWallet,
      handleConfirm,
      walletManager,
      isDissociated,
      confirmMessage,
      isHederaWallet,
      dynamicMessage,
      showDoneDialog,
      handleAssociate,
      showWatchOption,
      handleDissociate,
      isEthereumWallet,
      showDynamicDialog,
      tokenSerialNumber,
      handleDoneConfirm,
      showConfirmDialog,
      importTokenAction,
      showProgressDialog,
      progressDialogMode,
      confirmExtraMessage,
      progressMainMessage,
      showProgressSpinner,
      progressExtraMessage,
      serialNumberInputRef,
      isWatchAssetSupported,
      progressExtraTransactionId,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped> 

.token-actions-wrapper {
  top: 0px;
  gap: 0.45rem;
  left: -160px;
  width: 153px;
  display: flex;
  position: absolute;
  padding: 8px 0 8px 6px;
  flex-direction: column;
  border: 0.5px solid white;
  background-color: transparent;
}

.token-actions-btn {
  width: 100%;
  cursor: pointer;
  font-size: 0.72rem;
  letter-spacing: 0.025em;
}

.dynamic-dialog-input-wrapper {
  width: 100%;
  gap: 0.34rem;
  display: flex;
  flex-direction: column;
}

.dynamic-dialog-input-title {
  font-size: 1rem;
  font-weight: 500;
}

.serial-number-input-box {
  width: 100%;
  appearance: none;
  padding: 0.42rem;
  font-size: medium;
  border-radius: 0.3rem;
}

.serial-number-input-box:focus {
  outline-offset: 2px;
  outline: 2px solid transparent;
}

.serial-number-input-box::placeholder {
  font-size: 0.9rem;
  line-height: 0.5rem;
  letter-spacing: 0.025rem;
}

.is-hover:hover {
    color: grey;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
