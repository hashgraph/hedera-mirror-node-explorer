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

  <Dialog :controller="controller">

    <!-- dialogTitle -->

    <template #dialogTitle>
      <DialogTitle>
        <div v-if="isEditing" class="h-is-primary-title">
          <span >
            Modify allowance
          </span>
          <span v-if="selectedSpender">
            to account
          </span>
          <span v-if="selectedSpender" class="h-is-secondary-text has-text-weight-light mr-3">
            {{ selectedSpender }}
          </span>
        </div>
        <div v-else class="h-is-primary-title">
          <span>
            Approve allowance
          </span>
        </div>
      </DialogTitle>
    </template>

    <!-- dialogInput -->

    <template #dialogInput>

      <!-- Spender -->

      <div class="dialog-grid">
        <div class="has-text-weight-light">
          Spender
        </div>
        <div/>
        <input :value="selectedSpender"
               class="input is-small has-text-right has-text-white"
               placeholder="Account or Contract ID (0.0.1234)"
               style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
               type="text"
               :disabled="isSpenderDisabled"
               @input="event => handleSpenderInput(event)">
        <div v-if="spenderFeedback" id="spenderFeedback"
             :class="{'has-text-grey': isSpenderValid, 'has-text-danger': !isSpenderValid}"
             class="is-inline-block h-is-text-size-2"
             style="line-height:26px;">
          {{ spenderFeedback }}
        </div>
      </div>

      <!-- Allowance -->

      <div class="dialog-grid mt-4">
        <div class="has-text-weight-light">
          Allowance
        </div>
        <div class="control" style="">
          <label class="radio h-radio-button">
            <input v-model="allowanceChoice" name="allowanceType" type="radio" value="hbar">
            HBAR
          </label>
        </div>
        <input :class="{'has-text-grey': allowanceChoice !== 'hbar'}"
               :value="selectedHbarAmount"
               class="input is-small has-text-right has-text-white"
               placeholder="HBAR Amount"
               style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
               type="text"
               @focus="allowanceChoice='hbar'"
               @input="event => handleHbarAmountInput(event)">
        <div/>
      </div>

      <div class="dialog-grid mt-2">
        <div/>
        <div class="control" style="">
          <label class="radio h-radio-button">
            <input v-model="allowanceChoice" name="allowanceType" type="radio" value="token">
            Fungible Token
          </label>
        </div>
        <input :class="{'has-text-grey': allowanceChoice !== 'token'}"
               :value="selectedToken"
               class="input is-small has-text-right has-text-white"
               placeholder="Token ID (0.0.1234)"
               style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
               type="text"
               @focus="allowanceChoice='token'"
               @input="event => handleTokenInput(event)">
        <input v-if="allowanceChoice === 'token' && isTokenValid"
               :class="{'has-text-grey': allowanceChoice !== 'token'}"
               :value="selectedTokenAmount"
               class="input is-small has-text-right has-text-white"
               placeholder="Token Amount"
               style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
               type="text"
               @focus="allowanceChoice='token'"
               @input="event => handleTokenAmountInput(event)">
        <div v-else-if="allowanceChoice === 'token'" id="tokenFeedback"
             :class="{'has-text-grey': isTokenValid, 'has-text-danger': !isTokenValid}"
             class="is-inline-block h-is-text-size-2"
             style="line-height:26px;">
          {{ tokenFeedback }}
        </div>
      </div>

      <div class="dialog-grid mt-2">
        <div/>
        <div class="control" style="">
          <label class="radio h-radio-button">
            <input v-model="allowanceChoice" name="allowanceType" type="radio" value="nft">
            NFT
          </label>
        </div>
        <input :class="{'has-text-grey': allowanceChoice !== 'nft'}"
               :value="selectedNft"
               class="input is-small has-text-right has-text-white"
               placeholder="Collection ID (0.0.1234)"
               style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
               type="text"
               @focus="allowanceChoice='nft'"
               @input="event => handleNftInput(event)">
        <input v-if="allowanceChoice === 'nft' && isNftValid"
               :class="{'has-text-grey': allowanceChoice !== 'nft'}"
               :value="selectedNftSerials"
               class="input is-small has-text-right has-text-white"
               placeholder="serial numbers (1, 2, 3…)"
               style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
               type="text"
               @focus="allowanceChoice='nft'"
               @input="event => handleNftSerialsInput(event)">
        <div v-else-if="allowanceChoice === 'nft'" id="nftFeedback"
             :class="{'has-text-grey': isNftValid, 'has-text-danger': !isNftValid}"
             class="is-inline-block h-is-text-size-2"
             style="line-height:26px;">
          {{ nftFeedback }}
        </div>
      </div>

      <div class="dialog-grid mt-2">
        <div/>
        <div/>
        <div/>
        <div id="nftSerialsFeedback"
             :class="{
                    'has-text-grey': isNftSerialsValid,
                    'has-text-danger': !isNftSerialsValid,
                    'is-invisible': allowanceChoice !== 'nft' || !isNftValid}"
             class="is-inline-block h-is-text-size-2 has-text-right">
          {{ nftSerialsFeedback }}
        </div>
      </div>

    </template>


    <!-- dialogProgress -->

    <template #dialogBusy>
      <div class="h-is-tertiary-text mb-4">
        {{ progressMainMessage }}
      </div>
      <div class="h-is-property-text">
        {{ progressExtraMessage }}
      </div>
    </template>

    <!-- dialogSuccess -->

    <template #dialogSuccess>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-success ml-0">
          <i class="fas fa-check"/>
        </div>
        <div class="h-is-tertiary-text mb-4">
          Operation completed
        </div>
      </div>
      <div v-if="progressExtraTransactionId" class="h-is-property-text">
        {{ 'With transaction ID: ' + progressExtraTransactionId }}
      </div>
    </template>


    <!-- error -->
    <template #dialogError>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-danger">
          <span style="font-size: 18px; font-weight: 900">X</span>
        </div>
        <div class="h-is-tertiary-text mb-4">
          {{ progressMainMessage }}
        </div>
      </div>
      <div class="h-is-property-text">
        {{ progressExtraMessage }}
      </div>
    </template>

    <!-- dialogFeedback -->

    <template #dialogFeedback>
      <div v-if="isEditing" id="editingFeedback"
           class="has-text-grey h-is-text-size-3 has-text-centered mt-1"
           :class="{'is-invisible': !enableApproveButton}">
        {{ editingFeedback }}
      </div>
    </template>

    <!-- dialogInputButtons -->

    <template #dialogInputButtons>
      <DialogButton :controller="controller">CANCEL</DialogButton>
      <CommitButton
          :controller="controller"
          :enabled="enableApproveButton"
          @action="handleApprove">APPROVE</CommitButton>
    </template>

  </Dialog>

  <ConfirmDialog v-model:show-dialog="showConfirmDialog" :main-message="confirmMessage"
                 @onConfirm="handleConfirmApprove">
    <template v-slot:confirmTitle>
      <span v-if="isEditing">Modify allowance </span>
      <span v-else>Approve allowance </span>
      <span v-if="selectedSpender"> to account {{ selectedSpender }}</span>
    </template>
  </ConfirmDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, PropType, ref, watch} from "vue";
import {routeManager, walletManager} from "@/router.ts";
import {EntityID} from "@/utils/EntityID.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import ConfirmDialog from "@/dialogs/ConfirmDialog.vue";
import {CryptoAllowance, TokenAllowance, TokenType} from "@/schemas/MirrorNodeSchemas.ts";
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient.ts";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache.ts";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache.ts";
import {
  extractChecksum,
  formatTokenAmount,
  isOwnedSerials,
  isValidAssociation,
  makeTokenName,
  stripChecksum,
  waitForTransactionRefresh
} from "@/schemas/MirrorNodeUtils.ts";
import {inputAmount, inputEntityID, inputIntList} from "@/dialogs/core/dialog/DialogUtils.ts";
import {TransactionID} from "@/utils/TransactionID.ts";
import {CoreConfig} from "@/config/CoreConfig.ts";
import Dialog from "@/dialogs/core/dialog/Dialog.vue";
import DialogTitle from "@/dialogs/core/dialog/DialogTitle.vue";
import DialogButton from "@/dialogs/core/dialog/DialogButton.vue";
import CommitButton from "@/dialogs/core/dialog/CommitButton.vue";
import {DialogController, DialogMode} from "@/dialogs/core/dialog/DialogController.ts";

const VALID_ACCOUNT_MESSAGE = "Account found"
const UNKNOWN_ACCOUNT_MESSAGE = "Unknown account"
const INVALID_ACCOUNTID_MESSAGE = "Invalid account ID"
const INVALID_CHECKSUM_MESSAGE = "Invalid checksum"
const SAME_AS_OWNER_ACCOUNT_MESSAGE = "Same as owner's account"
const UNKNOWN_TOKENID_MESSAGE = "Unknown token ID"
const INVALID_TOKENID_MESSAGE = "Invalid token ID"
const TOKEN_NOT_FUNGIBLE_MESSAGE = "Token is not fungible"
const TOKEN_NOT_NFT_MESSAGE = "Token is fungible"
const TOKEN_NOT_FOUND_MESSAGE = "Not associated with this account"
const NFT_SERIAL_PROMPT_MESSAGE = "Leave empty to approve for ALL"
const SERIAL_NOT_OWNED_MESSAGE = "Not owned by this account"

const showDialog = defineModel("showDialog", {
  type: Boolean,
  required: true
})

const props = defineProps({
  ownerAccountId: {
    type: String as PropType<string | null>,
    default: null
  },
  currentHbarAllowance: Object as PropType<CryptoAllowance | null>,
  currentTokenAllowance: Object as PropType<TokenAllowance | null>,
  tokenDecimals: {
    type: String as PropType<string | null>,
    default: null
  },
  polling: { // For testing purpose
    type: Number,
    default: 3000
  }
})

const emit = defineEmits(["allowanceApproved"])

const controller = new DialogController(showDialog)

const cryptoName = CoreConfig.inject().cryptoName
const nr = NetworkConfig.inject()
const network = routeManager.currentNetwork.value

const selectedSpender = ref<string | null>(null)
const normalizedSpender = computed(() => EntityID.normalize(stripChecksum(selectedSpender.value ?? "")))

const selectedHbarAmount = ref<string | null>(null)

const selectedToken = ref<string | null>(null)
const normalizedToken = computed(() => EntityID.normalize(stripChecksum(selectedToken.value ?? "")))
const tokenInfoLookup = TokenInfoCache.instance.makeLookup(normalizedToken)
onMounted(() => tokenInfoLookup.mount())
onBeforeUnmount(() => tokenInfoLookup.unmount())
const tokenInfo = computed(() => tokenInfoLookup.entity.value)
const tokenName = computed(() => makeTokenName(tokenInfo.value, 32))
const initialTokenAmount = computed(
    () => props.currentTokenAllowance?.amount_granted
        ? formatTokenAmount(
            BigInt(props.currentTokenAllowance.amount_granted),
            Number(props.tokenDecimals ?? 0)
        )
        : null
)
const selectedTokenAmount = ref<string | null>(null)
const rawTokenAmount = computed(
    () => selectedTokenAmount.value != null
        ? Number.parseFloat(selectedTokenAmount.value) * Math.pow(10, Number(props.tokenDecimals))
        : null
)

const selectedNft = ref<string | null>(null)
const normalizedNFT = computed(() => EntityID.normalize(stripChecksum(selectedNft.value ?? "")))
const nftInfoLookup = TokenInfoCache.instance.makeLookup(normalizedNFT)
onMounted(() => nftInfoLookup.mount())
onBeforeUnmount(() => nftInfoLookup.unmount())
const nftInfo = computed(() => nftInfoLookup.entity.value)
const nftName = computed(() => makeTokenName(nftInfo.value, 32))

const selectedNftSerials = ref<string | null>(null)
const nftSerials = computed(() => {
      const result: number[] = []
      const inputSerialsSplit = selectedNftSerials.value ? selectedNftSerials.value.split(',') : []
      for (const s of inputSerialsSplit) {
        if (s.length) {
          const i = parseInt(s)
          if (!result.includes(i)) {
            result.push(i)
          }
        }
      }
      return result
    }
)

const allowanceChoice = ref("hbar")

const isSpenderValid = ref(false)
const isSpenderDisabled = computed(() => !!props.currentTokenAllowance)
const spenderFeedback = ref<string | null>(null)
let spenderValidationTimerId = -1

const isHbarAmountValid = computed(() =>
    selectedHbarAmount.value !== null
    && parseFloat(selectedHbarAmount.value) >= 0
)

const isTokenValid = ref(false)
const tokenFeedback = ref<string | null>(null)
let tokenValidationTimerId = -1

const isTokenAmountValid = computed(() =>
    selectedTokenAmount.value !== null &&
    parseFloat(selectedTokenAmount.value) >= 0)

const isNftValid = ref(false)
const nftFeedback = ref<string | null>(null)
let nftValidationTimerId = -1

const isNftSerialsValid = ref(true)
const nftSerialsFeedback = ref<string | null>(NFT_SERIAL_PROMPT_MESSAGE)
let nftSerialsValidationTimer = -1

const isEditing = ref(false)

const edited = computed(() => {
  let result = false
  if (props.currentHbarAllowance) {
    result ||= allowanceChoice.value !== "hbar"
    result ||= selectedSpender.value !== props.currentHbarAllowance?.spender
    result ||= selectedHbarAmount.value !==
        (props.currentHbarAllowance ? (props.currentHbarAllowance.amount_granted / 100000000).toString() : null)
  } else if (props.currentTokenAllowance) {
    result ||= allowanceChoice.value !== "token"
    result ||= selectedSpender.value !== props.currentTokenAllowance?.spender
    result ||= selectedToken.value !== props.currentTokenAllowance.token_id
    result ||= rawTokenAmount.value !== (props.currentTokenAllowance?.amount_granted ?? null)
  } else {
    result = true
  }
  return result
})

const editingFeedback = computed(() => {
  let result: string | null
  if (props.currentHbarAllowance) {
    result = "Previous allowance was for "
        + props.currentHbarAllowance.amount_granted / 100000000 + ` ${cryptoName}`
  } else if (props.currentTokenAllowance) {
    result = "Previous allowance was for "
        + initialTokenAmount.value
        + " " + tokenName.value + " tokens (" + props.currentTokenAllowance.token_id + ")"
  } else {
    result = null
  }
  return result
})

const enableApproveButton = computed(() => {
  return isSpenderValid.value && (
      (allowanceChoice.value === 'hbar' && isHbarAmountValid.value)
      || (allowanceChoice.value === 'token' && isTokenValid.value && isTokenAmountValid.value)
      || (allowanceChoice.value === 'nft' && isNftValid.value && isNftSerialsValid.value)
  ) && edited.value
})

watch(() => showDialog, () => {
  if (showDialog.value) {
    if (props.currentHbarAllowance) {
      isEditing.value = true
      allowanceChoice.value = "hbar"
      selectedSpender.value = props.currentHbarAllowance?.spender ?? null
      selectedHbarAmount.value =
          (props.currentHbarAllowance) ? (props.currentHbarAllowance.amount_granted / 100000000).toString() : null
      selectedToken.value = null
      selectedTokenAmount.value = null
      selectedNft.value = null
      selectedNftSerials.value = null
    } else if (props.currentTokenAllowance) {
      isEditing.value = true
      allowanceChoice.value = "token"
      selectedSpender.value = props.currentTokenAllowance?.spender ?? null
      selectedHbarAmount.value = null
      selectedToken.value = props.currentTokenAllowance.token_id
      selectedTokenAmount.value = props.currentTokenAllowance.amount_granted
          ? formatTokenAmount(
              BigInt(props.currentTokenAllowance.amount_granted),
              Number(props.tokenDecimals ?? 0)
          )
          : null
      selectedNft.value = null
      selectedNftSerials.value = null
    } else {
      isEditing.value = false
      allowanceChoice.value = "hbar"
      selectedSpender.value = null
      selectedHbarAmount.value = null
      selectedToken.value = null
      selectedTokenAmount.value = null
      selectedNft.value = null
      selectedNftSerials.value = null
    }
  }
})

watch(selectedSpender, (newValue) => {
  spenderFeedback.value = null
  if (isSpenderDisabled.value) {
    isSpenderValid.value = true
  } else {
    isSpenderValid.value = false
    if (spenderValidationTimerId != -1) {
      window.clearTimeout(spenderValidationTimerId)
      spenderValidationTimerId = -1
    }
    if (newValue?.length) {
      spenderValidationTimerId = window.setTimeout(() => validateSpender(), 500)
    } else {
      selectedSpender.value = null
    }
  }
})

const validateSpender = async () => {
  isSpenderValid.value = false
  const checksum = extractChecksum(selectedSpender.value ?? "")
  const isValidChecksum = checksum ? nr.isValidChecksum(normalizedSpender.value ?? "", checksum, network) : true

  if (normalizedSpender.value === null) {
    spenderFeedback.value = INVALID_ACCOUNTID_MESSAGE
  } else if (!isValidChecksum) {
    spenderFeedback.value = INVALID_CHECKSUM_MESSAGE
  } else if (normalizedSpender.value === walletManager.accountId.value) {
    spenderFeedback.value = SAME_AS_OWNER_ACCOUNT_MESSAGE
  } else if (!await AccountByIdCache.instance.lookup(normalizedSpender.value)) {
    spenderFeedback.value = UNKNOWN_ACCOUNT_MESSAGE
  } else {
    isSpenderValid.value = true
    spenderFeedback.value = VALID_ACCOUNT_MESSAGE
  }
}

watch(selectedToken, () => {
  isTokenValid.value = false
  tokenFeedback.value = null
  if (tokenValidationTimerId != -1) {
    window.clearTimeout(tokenValidationTimerId)
    tokenValidationTimerId = -1
  }
  if (selectedToken.value?.length) {
    tokenValidationTimerId = window.setTimeout(() => validateToken(), 500)
  } else {
    selectedToken.value = null
  }
})

const validateToken = async () => {
  isTokenValid.value = false

  const checksum = extractChecksum(selectedToken.value ?? "")
  const isValidChecksum = checksum ? nr.isValidChecksum(normalizedToken.value ?? "", checksum, network) : true

  if (normalizedToken.value === null) {
    tokenFeedback.value = INVALID_TOKENID_MESSAGE
  } else if (!isValidChecksum) {
    tokenFeedback.value = INVALID_CHECKSUM_MESSAGE
  } else if (tokenInfo.value === null) {
    tokenFeedback.value = UNKNOWN_TOKENID_MESSAGE
  } else if (tokenInfo.value?.type !== 'FUNGIBLE_COMMON') {
    tokenFeedback.value = TOKEN_NOT_FUNGIBLE_MESSAGE
  } else if (! await isValidAssociation(walletManager.accountId.value, normalizedToken.value)) {
    tokenFeedback.value = TOKEN_NOT_FOUND_MESSAGE
  } else {
    isTokenValid.value = true
    tokenFeedback.value = null
  }
}

watch(selectedNft, () => {
  isNftValid.value = false
  nftFeedback.value = null
  if (nftValidationTimerId != -1) {
    window.clearTimeout(nftValidationTimerId)
    nftValidationTimerId = -1
  }
  if (selectedNft.value?.length) {
    nftValidationTimerId = window.setTimeout(() => validateNft(), 500)
  } else {
    selectedNft.value = null
  }
})

const validateNft = async () => {
  isNftValid.value = false

  const checksum = extractChecksum(selectedNft.value ?? "")
  const isValidChecksum = checksum ? nr.isValidChecksum(normalizedNFT.value ?? "", checksum, network) : true

  if (normalizedNFT.value === null) {
    nftFeedback.value = INVALID_TOKENID_MESSAGE
  } else if (!isValidChecksum) {
    nftFeedback.value = INVALID_CHECKSUM_MESSAGE
  } else if (nftInfo.value === null) {
    nftFeedback.value = UNKNOWN_TOKENID_MESSAGE
  } else if (nftInfo.value?.type !== TokenType.NON_FUNGIBLE_UNIQUE) {
    nftFeedback.value = TOKEN_NOT_NFT_MESSAGE
  } else if (! await isValidAssociation(walletManager.accountId.value, normalizedNFT.value)) {
    nftFeedback.value = TOKEN_NOT_FOUND_MESSAGE
  } else {
    isNftValid.value = true
    nftFeedback.value = null
  }
}

watch([selectedNftSerials, selectedNft], () => {
  isNftSerialsValid.value = true
  nftSerialsFeedback.value = NFT_SERIAL_PROMPT_MESSAGE
  if (nftSerialsValidationTimer != -1) {
    window.clearTimeout(nftSerialsValidationTimer)
    nftSerialsValidationTimer = -1
  }
  if (selectedNftSerials.value?.length) {
    nftSerialsValidationTimer = window.setTimeout(() => validateNftSerials(), 500)
  } else {
    selectedNftSerials.value = null
  }
})

const validateNftSerials = async () => {
  if (! await isOwnedSerials(walletManager.accountId.value, normalizedNFT.value, nftSerials.value)) {
    isNftSerialsValid.value = false
    nftSerialsFeedback.value = SERIAL_NOT_OWNED_MESSAGE
  } else {
    isNftSerialsValid.value = true
    nftSerialsFeedback.value = null
  }
}

const showConfirmDialog = ref(false)

const confirmMessage = computed(() => {
  let result: string

  if (allowanceChoice.value === 'hbar') {
    if (Number(selectedHbarAmount.value) === 0) {
      result = "Do you want to remove the hbar allowance?"
    } else {
      result = "Do you want to approve an allowance for " + (selectedHbarAmount.value ?? 0 / 100000000) + ` ${cryptoName}?`
    }
  } else if (allowanceChoice.value === 'token') {
    if (rawTokenAmount.value === 0) {
      result = "Do you want to remove the allowance for token " + tokenName.value + "?"
    } else {
      result = "Do you want to approve an allowance for " + selectedTokenAmount.value + " tokens (" + tokenName.value + ")?"
    }
  } else {  // 'nft'
    if (nftSerials.value.length > 0) {
      result = "Do you want to approve an allowance to account for NFTs " + nftName.value + " "
      for (let i = 0; i < nftSerials.value.length; i++) {
        if (i > 20) {
          result += '…'
          break
        } else if (i > 0) {
          result += ', '
        }
        result += '#' + nftSerials.value[i]
      }
      result += '?'
    } else {
      result = "Do you want to approve an allowance for all NFTs of collection " + nftName.value + "?"
    }
  }
  return result
})

const progressMainMessage = ref<string | null>(null)
const progressExtraMessage = ref<string | null>(null)
const progressExtraTransactionId = ref<string | null>(null)

const handleSpenderInput = (event: Event) => {
  const newValue = inputEntityID(event, selectedSpender.value)
  if (newValue === selectedSpender.value) {
    selectedSpender.value = ""
  }
  selectedSpender.value = newValue
}
const handleHbarAmountInput = (event: Event) => {
  const newValue = inputAmount(event, selectedHbarAmount.value)
  if (newValue === selectedHbarAmount.value) {
    selectedHbarAmount.value = ""
  }
  selectedHbarAmount.value = newValue
}
const handleTokenInput = (event: Event) => {
  const newValue = inputEntityID(event, selectedToken.value)
  if (newValue === selectedToken.value) {
    selectedToken.value = ""
  }
  selectedToken.value = newValue
}
const handleTokenAmountInput = (event: Event) => {
  const newValue = inputAmount(event, selectedTokenAmount.value)
  if (newValue === selectedTokenAmount.value) {
    selectedTokenAmount.value = ""
  }
  selectedTokenAmount.value = newValue
}
const handleNftInput = (event: Event) => {
  const newValue = inputEntityID(event, selectedNft.value)
  if (newValue === selectedNft.value) {
    selectedNft.value = ""
  }
  selectedNft.value = newValue
}
const handleNftSerialsInput = (event: Event) => {
  const newValue = inputIntList(event, selectedNftSerials.value)
  if (newValue === selectedNftSerials.value) {
    selectedNftSerials.value = ""
  }
  selectedNftSerials.value = newValue
}

const handleApprove = () => {
  showConfirmDialog.value = true
}

const handleConfirmApprove = async () => {

  try {
    controller.mode.value = DialogMode.Busy
    progressMainMessage.value = "Connecting to Hedera Network using your wallet…"
    progressExtraMessage.value = "Check your wallet for any approval request"
    progressExtraTransactionId.value = null

    if (normalizedSpender.value) {
      let tid = null

      if (allowanceChoice.value === 'hbar') {
        if (selectedHbarAmount.value != null) {
          tid = TransactionID.normalize(await walletManager.approveHbarAllowance(
              normalizedSpender.value, parseFloat(selectedHbarAmount.value)))
        }
      } else if (allowanceChoice.value === 'token') {
        if (normalizedToken.value != null && rawTokenAmount.value != null) {
          tid = TransactionID.normalize(await walletManager.approveTokenAllowance(
              normalizedToken.value, normalizedSpender.value, rawTokenAmount.value))
        }
      } else { // 'nft'
        if (normalizedNFT.value != null) {
          tid = TransactionID.normalize(await walletManager.approveNFTAllowance(
              normalizedNFT.value, normalizedSpender.value, nftSerials.value))
        }
      }

      if (tid) {
        progressMainMessage.value = "Completing operation…"
        progressExtraMessage.value = "This may take a few seconds"
        await waitForTransactionRefresh(tid, 10, props.polling)
      }

      controller.mode.value = DialogMode.Success
      progressMainMessage.value = "Operation completed"
      progressExtraMessage.value = "with transaction ID:"
      progressExtraTransactionId.value = tid

      emit('allowanceApproved')
    }
  } catch (reason) {
    console.warn("Transaction Error: " + reason)

    if (reason instanceof WalletClientRejectError) {
      controller.visible.value = false
    } else {
      controller.mode.value = DialogMode.Error
      if (reason instanceof WalletClientError) {
        progressMainMessage.value = reason.message
        progressExtraMessage.value = reason.extra
      } else {
        console.log("reason = " + reason)
        progressMainMessage.value = "Operation did not complete"
        progressExtraMessage.value = reason instanceof Error ? JSON.stringify(reason.message) : JSON.stringify(reason)
      }
      progressExtraTransactionId.value = null
    }
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.dialog-grid {
  display: grid;
  grid-template-columns: 2fr 5fr 5fr 4fr;
  grid-column-gap: 1rem;
}

</style>
