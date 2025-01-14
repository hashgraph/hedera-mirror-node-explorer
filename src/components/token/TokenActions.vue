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
    <button id="showTokenActions" class="button is-white is-small"
            @click="() => isActive = !isActive">TOKEN ACTIONS
    </button>

    <div v-if="isActive" class="token-actions-wrapper is-flex is-flex-direction-column box">
      <div v-if="isDissociated" id="associateToken" class="is-cursor is-hover-grey is-full has-cursor-pointer"
           @click="handleAssociate">TOKEN ASSOCIATE
      </div>

      <div v-if="isAssociated" id="dissociateToken" class="is-cursor is-hover-grey  is-full has-cursor-pointer"
           @click="handleDissociate">TOKEN DISSOCIATE
      </div>

      <div v-if="isRejectEnabled" id="rejectToken" class="is-cursor is-hover-grey  is-full has-cursor-pointer"
           @click="handleReject">TOKEN REJECT
      </div>

      <div v-if="isWatchAssetSupported" id="showStakingDialog"
           class="is-cursor is-hover-grey  is-full has-cursor-pointer"
           @click="handleImport">TOKEN IMPORT
      </div>
    </div>

    <ConfirmDialog :show-dialog="showConfirmDialog"
                   :main-message="confirmMessage"
                   :extra-message="confirmExtraMessage"
                   @onConfirm="handleConfirm"
                   @onCancel="handleCancel">
      <template v-slot:confirmTitle>{{ dialogTitle }}</template>
      <template v-if="showWatchOption && isWatchAssetSupported" v-slot:dialogOption>
        <label>
          <input type="checkbox" style="margin-right: 0.5em; vertical-align: middle" v-model="watchInWallet">
          <span>Import {{ tokenSymbol }} to {{ walletManager.walletName.value }}</span>
        </label>
      </template>
    </ConfirmDialog>

    <DynamicDialog :show-dialog="showDynamicDialog"
                   :main-message="dynamicMessage"
                   @onConfirm="handleConfirm"
                   @onCancel="handleCancel">
      <template v-slot:dialogTitle>
            <span class="h-is-primary-title">
                {{ dialogTitle }}
            </span>
      </template>

      <template v-slot:dialogInput>
        <div class="is-full is-flex is-flex-direction-column" style="gap: 0.34rem;">
          <p class="h-is-property-text has-text-weight-medium">
            Serial Number:
          </p>
          <input
              type="number"
              ref="serialNumberInputRef"
              v-model="tokenSerialNumber"
              style="border-radius: 0.3rem"
              placeholder="Input serial number..."
              class="serial-number-input-box is-full py-2 px-1 h-is-property-text"
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
                :main-message="doneMessage"
                @onDoneConfirm="handleDoneConfirm">
      <template v-slot:dialogTitle>
            <span class="h-is-primary-title">
                {{ dialogTitle }}
            </span>
      </template>
    </DoneDialog>
  </div>

  <AlertDialog v-model:visible="alertVisible">
    <template v-slot:alertMessage>
      {{ tooltipLabel }}
    </template>
  </AlertDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {walletManager} from "@/router";
import DoneDialog from '../DoneDialog.vue';
import ConfirmDialog from '../../dialogs/ConfirmDialog.vue';
import DynamicDialog from '../DynamicDialog.vue';
import {computed, onBeforeUnmount, onMounted, PropType, ref} from "vue";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import {TokenAssociationStatus, TokenInfoAnalyzer} from './TokenInfoAnalyzer';
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient";
import AlertDialog from "@/dialogs/AlertDialog.vue";
import {gtagTransaction} from "@/gtag";
import {NftId, TokenId, TokenRejectTransaction} from "@hashgraph/sdk";
import axios, {AxiosResponse} from "axios";
import {Nfts} from "@/schemas/MirrorNodeSchemas";
import {TokenAssociationCache} from "@/utils/cache/TokenAssociationCache";
//
// States
//
const action = ref("")
const isActive = ref(false)
const tokenSerialNumber = ref("")
const serialNumberInputRef = ref(null)
const isHieroWallet = computed(() => walletManager.isHieroWallet.value)
const isWatchAssetSupported = computed(() => walletManager.isEthereumWallet.value)

//
// Token Info States
//
const tokenType = computed(() => props.analyzer.isFungible.value ? "token" : "NFT")
const tokenId = computed(() => props.analyzer.tokenId.value)
const accountId = computed(() => walletManager.accountId.value)
const tokenSymbol = computed(() => props.analyzer.tokenSymbol.value)
const isAssociated = computed(() => props.analyzer.associationStatus.value == TokenAssociationStatus.Associated)
const isDissociated = computed(() => props.analyzer.associationStatus.value == TokenAssociationStatus.Dissociated)

const associationLookup = TokenAssociationCache.instance.makeTokenAssociationLookup(walletManager.accountId, tokenId)
onMounted((() => associationLookup.mount()))
onBeforeUnmount((() => associationLookup.unmount()))

const isRejectEnabled = computed(() => {
  let result: boolean
  const associations = associationLookup.entity.value
  if (associations && associations.length >= 1) {
    result = (associations[0].balance > 0) && isHieroWallet.value && isAssociated.value
  } else {
    result = false
  }
  return result
})

// Alert dialog states
const alertVisible = ref(false)
const tooltipLabel = computed(
    () => {
      let result: string
      switch (action.value) {
        case "ASSOCIATE":
          result = "Token " + tokenSymbol.value + " cannot be associated because "
              + walletManager.accountId.value + " is its treasury account."
          break
        case "DISSOCIATE":
          result = "Token " + tokenSymbol.value + " cannot be dissociated because "
              + walletManager.accountId.value + " is its treasury account."
          break
        case "REJECT":
          result = "Token " + tokenSymbol.value + " cannot be rejected because "
              + walletManager.accountId.value + " is its treasury account."
          break
        default:
          result = "?"
          break
      }
      return result
    }
)

//
// Confirm dialog states
//
const watchInWallet = ref(false)
const showConfirmDialog = ref(false)
const dialogTitle = ref<string | null>(null)
const confirmMessage = ref<string | null>(null)
const confirmExtraMessage = ref<string | null>(null)
const showWatchOption = computed(() => action.value === 'ASSOCIATE' && props.analyzer.isFungible.value)

//
// Dynamic dialog states
//
const showDynamicDialog = ref(false)
const dynamicMessage = ref<string | null>(null)

//
// Progress dialog states
//
const showProgressDialog = ref(false)
const showProgressSpinner = ref(false)
const progressDialogMode = ref(Mode.Busy)
const progressMainMessage = ref<string | null>(null)
const progressExtraMessage = ref<string | null>(null)
const progressExtraTransactionId = ref<string | null>(null)

//
// Done dialog states
//
const showDoneDialog = ref(false)
const doneMessage = ref<string | null>(null)


//
// handleAssociate()
//
const handleAssociate = () => {
  action.value = 'ASSOCIATE'
  showConfirmDialog.value = true
  dialogTitle.value = `Associate ${tokenType.value} ${tokenId.value}`
  confirmMessage.value = `Confirm associating ${tokenType.value} ${tokenId.value! + "(" + tokenSymbol.value + ")"} to account ${accountId.value}?`
  confirmExtraMessage.value = null
}

//
// handleDissociate()
//
const handleDissociate = () => {
  action.value = 'DISSOCIATE'

  if (props.analyzer.treasuryAccount.value != walletManager.accountId.value) {
    showConfirmDialog.value = true
    dialogTitle.value = `Dissociate ${tokenType.value} ${tokenId.value}`
    confirmMessage.value = `Confirm dissociating ${tokenType.value} ${tokenId.value!} (${tokenSymbol.value}) from account ${accountId.value}?`
    confirmExtraMessage.value = null
  } else {
    alertVisible.value = true
  }
}

//
// handleReject()
//
const handleReject = () => {
  action.value = 'REJECT'

  if (props.analyzer.treasuryAccount.value != walletManager.accountId.value) {
    showConfirmDialog.value = true
    dialogTitle.value = `Reject ${tokenType.value} ${tokenId.value}`
    if (tokenType.value === 'NFT') {
      confirmMessage.value = `Confirm rejecting NFTs of collection ${tokenId.value!} (${tokenSymbol.value}) from account ${accountId.value}?`
    } else {
      confirmMessage.value = `Confirm rejecting token ${tokenId.value!} (${tokenSymbol.value}) from account ${accountId.value}?`
    }
    confirmExtraMessage.value = null
  } else {
    alertVisible.value = true
  }
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
  isActive.value = false
  showConfirmDialog.value = false
  showDynamicDialog.value = false
  showProgressDialog.value = true
  showProgressSpinner.value = true
  progressMainMessage.value = null
  progressExtraMessage.value = null
  progressDialogMode.value = Mode.Busy
  switch (action.value) {
    case "ASSOCIATE":
      associateAction();
      break;
    case "DISSOCIATE":
      dissociateAction();
      break;
    case "REJECT":
      rejectAction();
      break;
    case "IMPORT_TOKEN":
      importTokenAction();
      break;
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
        emit('completed')
        props.analyzer.tokenAssociationDidChange()
        gtagTransaction("associate_token")
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
        TokenAssociationCache.instance.forgetTokenAssociation(walletManager.accountId.value!, tokenId.value!)
        props.analyzer.tokenAssociationDidChange()
        emit('completed')
        gtagTransaction("dissociate_token")
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
// rejectAction()
//
const rejectAction = async () => {
  try {
    if (props.analyzer.associationStatus.value == TokenAssociationStatus.Associated) {
      showProgressDialog.value = true
      showProgressSpinner.value = true
      if (tokenType.value === 'NFT') {
        progressMainMessage.value = `Rejecting NFTs from collection ${tokenId.value!} (${tokenSymbol.value}) from account ${accountId.value}...`
      } else {
        progressMainMessage.value = `Rejecting ${tokenType.value} ${tokenId.value!} (${tokenSymbol.value}) from account ${accountId.value}...`
      }
      try {
        if (tokenType.value === 'NFT') {
          let url: string | null = "api/v1/accounts/" + accountId.value + "/nfts?token.id=" + tokenId.value + "&limit=10"
          let counter = 10
          while (url !== null && counter > 0) {
            const response: AxiosResponse<Nfts> = await axios.get<Nfts>(url)
            if (response.data.nfts) {
              const transaction = new TokenRejectTransaction()
              for (const nft of response.data.nfts) {
                transaction.addNftId(new NftId(TokenId.fromString(nft.token_id!), nft.serial_number))
              }
              await walletManager.rejectTokens(transaction)
            }
            url = response.data.links?.next ?? null
            counter -= 1
          }
        } else {
          const transaction = new TokenRejectTransaction()
          transaction.addTokenId(TokenId.fromString(tokenId.value!))
          await walletManager.rejectTokens(transaction)
        }
      } finally {
        TokenAssociationCache.instance.forgetTokenAssociation(walletManager.accountId.value!, tokenId.value!)
        props.analyzer.tokenAssociationDidChange()
        emit('completed')
        gtagTransaction("reject_token")
      }
    }
    showProgressDialog.value = false
    showDoneDialog.value = true
    dialogTitle.value = `Successfully rejected ${tokenType.value} ${tokenId.value!}`
    doneMessage.value = `Successfully rejected ${tokenType.value} ${tokenId.value!}(${tokenSymbol.value}) from account ${accountId.value}`
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
    if (props.analyzer.isFungible.value) {
      doneMessage.value = `Successfully imported ${tokenType.value} ${tokenId.value!}(${tokenSymbol.value}) to ${walletManager.walletName.value}`
    } else {
      doneMessage.value = `Successfully imported ${tokenType.value} ${tokenId.value!}(${tokenSymbol.value}) #${tokenSerialNumber.value} to ${walletManager.walletName.value}`
    }
  } catch (reason) {
    handleError(reason)
  }
}

//
// handleError()
//
const handleError = (reason: unknown) => {
  if (reason instanceof WalletClientRejectError) {
    showProgressDialog.value = false
  } else {
    showProgressDialog.value = true
    showProgressSpinner.value = false
    progressDialogMode.value = Mode.Error
    if (reason instanceof WalletClientError) {
      progressMainMessage.value = reason.message
      progressExtraMessage.value = reason.extra
    } else {
      progressMainMessage.value = "Unexpected error"
      progressExtraMessage.value = JSON.stringify(reason)
    }
  }
}

const props = defineProps({
  analyzer: {
    type: Object as PropType<TokenInfoAnalyzer>,
    required: true
  }
})

const emit = defineEmits(["completed"])

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.token-actions-wrapper {
  top: 0;
  gap: 0.45rem;
  width: 9rem;
  left: -9.6rem;
  font-size: 0.735rem;
  position: absolute;
  border: 0.5px solid white;
  padding: 0.36rem 0 0.36rem 0.375rem;
}

.serial-number-input-box::placeholder {
  font-size: 0.9rem;
  line-height: 0.5rem;
  letter-spacing: 0.025rem;
}

.is-cursor {
  cursor: pointer
}

.is-hover-grey:hover {
  color: grey
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

</style>
