<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
  <div :class="{'is-active': showDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px; border-radius: 16px">
      <div class="box">

        <span class="h-is-primary-title">
          <span v-if="isEditing">Modify allowance</span>
          <span v-else>Approve allowance</span>
          <span v-if="ownerAccountId"> for account </span>
          <span v-if="ownerAccountId" class="h-is-secondary-text has-text-weight-light mr-3">{{ ownerAccountId }}</span>
        </span>

        <hr class="h-card-separator"/>

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
                 @input="event => handleSpenderInput(event)">
          <div v-if="spenderFeedback" id="spenderFeedback"
               :class="{'has-text-grey': isSpenderValid, 'has-text-danger': !isSpenderValid}"
               class="is-inline-block h-is-text-size-2"
               style="line-height:26px;">
            {{ spenderFeedback }}
          </div>
        </div>

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
                 placeholder="Token ID (0.0.1234)"
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

        <div v-if="isEditing" id="editingFeedback"
             class="has-text-grey h-is-text-size-3 has-text-centered mt-1"
             :class="{'is-invisible': !enableApproveButton}">
            {{ editingFeedback }}
        </div>

        <div class="is-flex is-justify-content-flex-end mt-5">
          <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
          <button :disabled="!enableApproveButton"
                  class="button is-info is-small ml-4" @click="handleApprove">APPROVE
          </button>
        </div>

      </div>
    </div>
  </div>

  <ConfirmDialog v-model:show-dialog="showConfirmDialog" :main-message="confirmMessage"
                 @onConfirm="handleConfirmApprove">
    <template v-slot:dialogTitle>
      <span v-if="isEditing" class="h-is-primary-title">Modify allowance </span>
      <span v-else class="h-is-primary-title">Approve allowance </span>
      <span v-if="ownerAccountId"> for account </span>
      <span v-if="ownerAccountId" class="h-is-secondary-text has-text-weight-light mr-3"
            style="line-height: 36px">{{ ownerAccountId }}</span>
    </template>
  </ConfirmDialog>

  <ProgressDialog v-model:show-dialog="showProgressDialog"
                  :extra-message="progressExtraMessage"
                  :extra-transaction-id="progressExtraTransactionId"
                  :main-message="progressMainMessage"
                  :mode="progressDialogMode"
                  :show-spinner="showProgressSpinner"
  >
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">{{ progressDialogTitle }}</span>
    </template>
  </ProgressDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType, Ref, ref, watch} from "vue";
import router, {walletManager} from "@/router";
import {EntityID} from "@/utils/EntityID";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import ConfirmDialog from "@/components/ConfirmDialog.vue";
import axios from "axios";
import {
  CryptoAllowance,
  Nfts,
  TokenAllowance,
  TokenInfo,
  TokenRelationshipResponse,
  Transaction,
  TransactionByIdResponse
} from "@/schemas/HederaSchemas";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import {normalizeTransactionId} from "@/utils/TransactionID";
import {waitFor} from "@/utils/TimerUtils";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";

const VALID_ACCOUNT_MESSAGE = "Account found"
const VALID_CONTRACT_MESSAGE = "Contract found"
const UNKNOWN_ACCOUNT_MESSAGE = "Unknown account"
const INVALID_ACCOUNTID_MESSAGE = "Invalid account ID"
const INVALID_CHECKSUM_MESSAGE = "Invalid checksum"
const SAME_AS_OWNER_ACCOUNT_MESSAGE = "Same as owner's account"
const INVALID_TOKENID_MESSAGE = "Invalid token ID"
const TOKEN_NOT_FUNGIBLE_MESSAGE = "Token is not fungible"
const TOKEN_NOT_NFT_MESSAGE = "Token is fungible"
const TOKEN_NOT_FOUND_MESSAGE = "Not associated with this account"
const NFT_SERIAL_PROMPT_MESSAGE = "Leave empty to approve for ALL"
const SERIAL_NOT_FOUND_MESSAGE = "Not associated with this account"

export default defineComponent({
  name: "ApproveAllowanceDialog",
  components: {ProgressDialog, ConfirmDialog},
  props: {
    ownerAccountId: {
      type: String as PropType<string|null>,
      default: null
    },
    showDialog: {
      type: Boolean,
      default: false
    },
    currentHbarAllowance: Object as PropType<CryptoAllowance|null>,
    currentTokenAllowance: Object as PropType<TokenAllowance|null>,
    polling: { // For testing purpose
      type: Number,
      default: 3000
    }
  },
  emits: ["update:showDialog", "allowanceApproved"],

  setup(props, context) {
    const nr = networkRegistry
    const network = router.currentRoute.value.params.network as string

    const selectedSpender = ref<string | null>(null)
    const normalizedSpender = computed(() => EntityID.normalize(nr.stripChecksum(selectedSpender.value ?? "")))
    const selectedHbarAmount = ref<string | null>(null)
    const selectedToken = ref<string | null>(null)
    const normalizedToken = computed(() => EntityID.normalize(nr.stripChecksum(selectedToken.value ?? "")))
    const selectedTokenAmount = ref<string | null>(null)
    const selectedNft = ref<string | null>(null)
    const normalizedNFT = computed(() => EntityID.normalize(nr.stripChecksum(selectedNft.value ?? "")))
    const selectedNftSerials = ref<string | null>(null)
    const nftSerials = ref<number[]>([])
    const allowanceChoice = ref("hbar")

    const isSpenderValid = ref(false)
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
        result ||= selectedTokenAmount.value !== props.currentTokenAllowance?.amount_granted.toString() ?? null
      } else {
        result = true
      }
      return result
    })

    const editingFeedback = computed(() => {
      let result: string | null
      if (props.currentHbarAllowance) {
        result = "Previous allowance was to "
            + props.currentHbarAllowance.spender + " for "
            + props.currentHbarAllowance.amount_granted/100000000 + " hbars"
      } else if (props.currentTokenAllowance) {
        result = "Previous allowance was to "
            + props.currentTokenAllowance.spender + " for "
            + props.currentTokenAllowance.amount_granted
            + " tokens (" + props.currentTokenAllowance.token_id + ")"
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

    watch(() => props.showDialog, (newValue) => {
      if (newValue) {
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
          selectedTokenAmount.value = props.currentTokenAllowance?.amount_granted.toString() ?? null
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
      isSpenderValid.value = false
      spenderFeedback.value = null
      if (spenderValidationTimerId != -1) {
        window.clearTimeout(spenderValidationTimerId)
        spenderValidationTimerId = -1
      }
      if (newValue?.length) {
        spenderValidationTimerId = window.setTimeout(() => validateSpender(), 500)
      } else {
        selectedSpender.value = null
      }
    })
    const validateSpender =
        () => validateAccount(selectedSpender.value, isSpenderValid, spenderFeedback)

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
    const validateToken = () => validateTokenAssociation(
        walletManager.accountId.value,
        selectedToken.value,
        'FUNGIBLE_COMMON',
        isTokenValid,
        tokenFeedback)

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
    const validateNft = () => validateTokenAssociation(
        walletManager.accountId.value,
        selectedNft.value,
        'NON_FUNGIBLE_UNIQUE',
        isNftValid,
        nftFeedback)

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
    const validateNftSerials = () => validateSerialsAssociation(
        walletManager.accountId.value,
        normalizedNFT.value,
        selectedNftSerials.value,
        isNftSerialsValid,
        nftSerials,
        nftSerialsFeedback)

    const showConfirmDialog = ref(false)
    const confirmMessage = computed(() => {
      let result: string
      const toAccount = normalizedSpender.value

      if (allowanceChoice.value === 'hbar') {
        result = "Do you want to approve an allowance to account " + toAccount
            + " for " + (selectedHbarAmount.value??0/100000000) + " hbars?"
      } else if (allowanceChoice.value === 'token') {
        const token = normalizedToken.value
        result = "Do you want to approve an allowance to account " + toAccount
            + " for " + selectedTokenAmount.value + " fungible tokens (" + token + ")?"
      } else {  // 'nft'
        const nFT = normalizedNFT.value
        result = "Do you want to approve an allowance to account " + toAccount
            + " for NFT " + nFT
        if (nftSerials.value.length) {
          result += " ("
          for (let i = 0; i < nftSerials.value.length; i++) {
            if (i > 0) {
              result += ', '
            }
            result += '#' + nftSerials.value[i]
          }
          result += ')'
        }
        result += '?'
      }
      return result
    })

    const showProgressDialog = ref(false)
    const progressDialogMode = ref(Mode.Busy)
    const progressDialogTitle = ref("Approving allowance")
    const progressMainMessage = ref<string | null>(null)
    const progressExtraMessage = ref<string | null>(null)
    const progressExtraTransactionId = ref<string | null>(null)
    const showProgressSpinner = ref(false)

    const handleSpenderInput = (event: Event) => handleEntityIDInput(selectedSpender, event)
    const handleHbarAmountInput = (event: Event) => handleAmountInput(selectedHbarAmount, event)
    const handleTokenInput = (event: Event) => handleEntityIDInput(selectedToken, event)
    const handleTokenAmountInput = (event: Event) => handleAmountInput(selectedTokenAmount, event)
    const handleNftInput = (event: Event) => handleEntityIDInput(selectedNft, event)
    const handleNftSerialsInput = (event: Event) => handleIntListInput(selectedNftSerials, event)

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleApprove = () => {
      context.emit('update:showDialog', false)
      showConfirmDialog.value = true
    }

    const handleConfirmApprove = async () => {

      try {
        showProgressDialog.value = true
        progressDialogMode.value = Mode.Busy
        progressDialogTitle.value = isEditing.value ? "Modifying allowance" : "Approving allowance"
        progressMainMessage.value = "Connecting to Hedera Network using your wallet…"
        progressExtraMessage.value = "Check your wallet for any approval request"
        progressExtraTransactionId.value = null
        showProgressSpinner.value = true

        if (normalizedSpender.value) {
          let tid = null

          if (allowanceChoice.value === 'hbar') {
            if (selectedHbarAmount.value) {
              tid = normalizeTransactionId(await walletManager.approveHbarAllowance(
                  normalizedSpender.value, parseFloat(selectedHbarAmount.value)))
            }
          } else if (allowanceChoice.value === 'token') {
            if (normalizedToken.value && selectedTokenAmount.value) {
              tid = normalizeTransactionId(await walletManager.approveTokenAllowance(
                  normalizedToken.value, normalizedSpender.value, parseFloat(selectedTokenAmount.value)))
            }
          } else { // 'nft'
            if (normalizedNFT.value) {
              tid = normalizeTransactionId(await walletManager.approveNFTAllowance(
                  normalizedNFT.value, normalizedSpender.value, nftSerials.value))
            }
          }
          console.log("Transaction ID=" + tid)

          if (tid) {
            progressMainMessage.value = "Completing operation…"
            progressExtraMessage.value = "This may take a few seconds"
            showProgressSpinner.value = true
            await waitForTransactionRefresh(tid, 10)
          }

          progressDialogMode.value = Mode.Success
          progressMainMessage.value = "Operation completed"
          showProgressSpinner.value = false
          progressExtraMessage.value = "with transaction ID:"
          progressExtraTransactionId.value = tid

          context.emit('allowanceApproved')
        }
      } catch (reason) {
        console.log("Transaction Error: " + reason)

        if (reason instanceof WalletDriverCancelError) {
            showProgressDialog.value = false
        } else {
            progressDialogMode.value = Mode.Error
            if (reason instanceof WalletDriverError) {
                progressMainMessage.value = reason.message
                progressExtraMessage.value = reason.extra
            } else {
                progressMainMessage.value = "Operation did not complete"
                progressExtraMessage.value = reason instanceof Error ? JSON.stringify(reason.message) : JSON.stringify(reason)
            }
            progressExtraTransactionId.value = null
            showProgressSpinner.value = false
        }
      }
    }

    const handleEntityIDInput = (entityID: Ref<string | null>, event: Event) => {
      const previousValue = entityID.value
      let isValidInput = true
      let isValidID = false
      let isPastDash = false

      const value = (event.target as HTMLInputElement).value
      for (const c of value) {
        if ((c >= '0' && c <= '9') || c === '.') {
          if (isPastDash) {
            isValidInput = false
            break
          } else {
            isValidID = EntityID.parse(nr.stripChecksum(value)) !== null
          }
        } else if (c === '-') {
          if (!isValidID || isPastDash) {
            isValidInput = false
            break
          } else {
            isPastDash = true
          }
        } else if (c < 'a' || c > 'z' || !isPastDash) {
          isValidInput = false
          break
        }
      }

      if (isValidInput) {
        entityID.value = value
      } else {
        entityID.value = ""
        entityID.value = previousValue
      }
    }

    const handleAmountInput = (amount: Ref<string | null>, event: Event) => {
      const previousValue = amount.value
      let isValidInput = true
      let isDecimal = false

        const value = (event.target as HTMLInputElement).value
        for (const c of value) {
        if ((c >= '0' && c <= '9') || c === '.') {
          if (c === '.') {
            isValidInput = !isDecimal
            isDecimal = true
          }
        } else {
          isValidInput = false
          break
        }
      }

      if (isValidInput) {
        amount.value = value
      } else {
        amount.value = ""
        amount.value = previousValue
      }
    }

    const handleIntListInput = (list: Ref<string | null>, event: Event) => {
      const previousValue = list.value
      let isValidInput = true
      let previousWasComma = false

        const value = (event.target as HTMLInputElement).value
        for (const c of value) {
        if ((c >= '0' && c <= '9') || c === ',') {
          if (c === ',') {
            isValidInput = !previousWasComma
            previousWasComma = true
          } else {
            previousWasComma = false
          }
        } else {
          isValidInput = false
          break
        }
      }

      if (isValidInput) {
        list.value = value
      } else {
        list.value = ""
        list.value = previousValue
      }
    }

    const validateAccount = (accountId: string | null, isValid: Ref<boolean>, message: Ref<string | null>) => {
      const checksum = nr.extractChecksum(accountId ?? "")
      const entity = EntityID.normalize(nr.stripChecksum(accountId ?? ""))
      const isValidChecksum = checksum ? nr.isValidChecksum(entity ?? "", checksum, network) : true

      if (entity === null) {
        message.value = INVALID_ACCOUNTID_MESSAGE
      } else if (isValidChecksum) {
        if (entity === walletManager.accountId.value) {
          message.value = SAME_AS_OWNER_ACCOUNT_MESSAGE
        } else {
          AccountByIdCache.instance.lookup(entity)
              .then((r) => {
                if (r) {
                  isValid.value = true
                  ContractByIdCache.instance.lookup(entity)
                      .then((r) => {
                        if (r) {
                          message.value = VALID_CONTRACT_MESSAGE
                        } else {
                          message.value = VALID_ACCOUNT_MESSAGE
                        }
                      })
                } else {
                  message.value = UNKNOWN_ACCOUNT_MESSAGE
                }
              })
              .catch(() => message.value = UNKNOWN_ACCOUNT_MESSAGE)
        }
      } else {
        message.value = INVALID_CHECKSUM_MESSAGE
      }
    }

    const validateTokenAssociation = (
        accountId: string | null,
        tokenId: string | null,
        type: string | null,
        isValid: Ref<boolean>,
        message: Ref<string | null>) => {

      const checksum = nr.extractChecksum(tokenId ?? "")
      const entity = EntityID.normalize(nr.stripChecksum(tokenId ?? ""))
      const isValidChecksum = checksum ? nr.isValidChecksum(entity ?? "", checksum, network) : true

      if (entity === null) {
        message.value = INVALID_TOKENID_MESSAGE
      } else if (isValidChecksum) {
        if (accountId && tokenId) {

          const uRL = "api/v1/accounts/" + accountId + "/tokens"
          const params = {
            'token.id': entity,
          }
          axios
              .get<TokenRelationshipResponse>(uRL, {params: params})
              .then((response) => {
                const tokens = response.data.tokens
                if (tokens && tokens.length > 0) {
                  if (type !== null) {
                    TokenInfoCache.instance.lookup(entity)
                        .then((t: TokenInfo | null) => {
                          if (t?.type === type) {
                            isValid.value = true
                          } else {
                            message.value = (type === 'FUNGIBLE_COMMON') ? TOKEN_NOT_FUNGIBLE_MESSAGE : TOKEN_NOT_NFT_MESSAGE
                          }
                        })
                        .catch(() => message.value = TOKEN_NOT_FOUND_MESSAGE)
                  } else {
                    isValid.value = true
                  }
                } else {
                  message.value = TOKEN_NOT_FOUND_MESSAGE
                }
              })
              .catch(() => message.value = TOKEN_NOT_FOUND_MESSAGE)
        }
      } else {
        message.value = INVALID_CHECKSUM_MESSAGE
      }
    }

    const validateSerialsAssociation = (
        accountId: string | null,
        tokenId: string | null,
        inputSerials: string | null,
        isValid: Ref<boolean>,
        resultSerials: Ref<number[]>,
        message: Ref<string | null>) => {

      const inputSerialsSplit = inputSerials ? inputSerials.split(',') : []

      if (accountId && tokenId && inputSerialsSplit.length) {
        const uRL = "api/v1/accounts/" + accountId + "/nfts"
        const params = {
          'token.id': tokenId,
        }
        axios
            .get<Nfts>(uRL, {params: params})
            .then((response) => {
              const nfts = response.data.nfts
              if (nfts && nfts.length > 0) {
                const serialsInAccount = Array<number>()
                for (const nft of nfts) {
                  if (nft.serial_number) {
                    serialsInAccount.push(nft.serial_number)
                  }
                }
                for (const s of inputSerialsSplit) {
                  if (s.length) {
                    const i = parseInt(s)
                    if (serialsInAccount.includes(i)) {
                      if (!resultSerials.value.includes(i)) {
                        resultSerials.value.push(i)
                      }
                    } else {
                      isValid.value = false
                      break
                    }
                  }
                }
              } else {
                isValid.value = false
              }
              if (!isValid.value) {
                message.value = SERIAL_NOT_FOUND_MESSAGE
              }
            })
            .catch(() => {
              isValid.value = false
              message.value = SERIAL_NOT_FOUND_MESSAGE
            })
      }
    }

    const waitForTransactionRefresh = async (transactionId: string, attemptIndex: number) => {
      let result: Promise<Transaction | string>

      if (attemptIndex >= 0) {
        await waitFor(props.polling)
        try {
          const response = await axios.get<TransactionByIdResponse>("api/v1/transactions/" + transactionId)
          const transactions = response.data.transactions ?? []
          result = Promise.resolve(transactions.length >= 1 ? transactions[0] : transactionId)
        } catch {
          result = waitForTransactionRefresh(transactionId, attemptIndex - 1)
        }
      } else {
        result = Promise.resolve(transactionId)
      }

      return result
    }

    return {
      editingFeedback,
      enableApproveButton,
      selectedSpender,
      selectedHbarAmount,
      selectedToken,
      selectedTokenAmount,
      selectedNft,
      selectedNftSerials,
      allowanceChoice,
      isSpenderValid,
      spenderFeedback,
      isTokenValid,
      tokenFeedback,
      isNftValid,
      nftFeedback,
      isNftSerialsValid,
      nftSerialsFeedback,
      isEditing,
      showConfirmDialog,
      confirmMessage,
      showProgressDialog,
      progressDialogMode,
      progressDialogTitle,
      progressMainMessage,
      progressExtraMessage,
      progressExtraTransactionId,
      showProgressSpinner,
      handleSpenderInput,
      handleHbarAmountInput,
      handleTokenInput,
      handleTokenAmountInput,
      handleNftInput,
      handleNftSerialsInput,
      handleCancel,
      handleApprove,
      handleConfirmApprove,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.dialog-grid {
  display: grid;
  grid-template-columns: 2fr 3fr 5fr 4fr;
  grid-column-gap: 1rem;
}

</style>
