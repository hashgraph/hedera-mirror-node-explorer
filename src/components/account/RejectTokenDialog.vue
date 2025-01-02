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
  <Dialog :controller="controller" :width="700">

    <!-- title -->
    <template #dialogTitle>
      <div class="h-is-primary-title">
        {{ isNft ? 'Reject NFTs' : 'Reject Tokens' }}
      </div>
    </template>

    <!-- input -->
    <template #dialogInput>
      <div class="h-is-tertiary-text mb-4">
        {{ inputMessage }}
      </div>
      <div class="h-is-property-text has-text-grey mt-4">
        {{ inputMessageDetails1 }}
      </div>
      <div v-if="inputMessageDetails2" class="h-is-property-text has-text-grey mt-2">
        • {{ inputMessageDetails2 }}
      </div>
      <div v-if="inputMessageDetails3" class="h-is-property-text mt-2 has-text-grey">
        • {{ inputMessageDetails3 }}
      </div>
      <div v-if="inputMessageDetails4" class="h-is-property-text mt-2 has-text-grey">
        • {{ inputMessageDetails4 }}
      </div>
      <div v-if="inputMessageDetails5" class="h-is-property-text mt-2 has-text-grey">
        • {{ inputMessageDetails5 }}
      </div>
    </template>

    <!-- busy -->
    <template #dialogBusy>
      <div class="h-is-tertiary-text mb-4">
        {{ busyMessage }}
      </div>
      <div class="h-is-property-text">
        {{ busyMessageDetails }}
      </div>
    </template>

    <!-- success -->
    <template #dialogSuccess>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-success ml-0">
          <i class="fas fa-check"/>
        </div>
        <div class="h-is-tertiary-text mb-4">
          Operation completed
        </div>
      </div>
      <div v-if="formattedTransactionId" class="h-is-property-text">
        {{ 'With transaction ID: ' + formattedTransactionId }}
      </div>
    </template>

    <!-- error -->
    <template #dialogError>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-danger">
          <span style="font-size: 18px; font-weight: 900">X</span>
        </div>
        <div class="h-is-tertiary-text mb-4">
          {{ errorMessage }}
        </div>
      </div>
      <div class="h-is-property-text">
        {{ errorMessageDetails }}
      </div>
    </template>

    <template #dialogInputButtons>
      <DialogButton :controller="controller">CANCEL</DialogButton>
      <CommitButton
          :controller="controller"
          :enabled="rejectCandidates.length >= 1"
          @action="onReject"
      >
        REJECT
      </CommitButton>
    </template>

  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onMounted, PropType, ref, watch} from "vue";
import {DialogController, DialogMode} from "@/dialogs/core/DialogController";
import {tokenOrNftId, waitForTransactionRefresh} from "@/schemas/MirrorNodeUtils.ts";
import {TransactionID} from "@/utils/TransactionID";
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient";
import DialogButton from "@/dialogs/core/DialogButton.vue";
import CommitButton from "@/dialogs/core/CommitButton.vue";
import {walletManager} from "@/router";
import Dialog from "@/dialogs/core/Dialog.vue";
import {isSuccessfulResult} from "@/utils/TransactionTools";
import {FreezeStatus, Nft, Token} from "@/schemas/MirrorNodeSchemas";
import {NftId, TokenId, TokenRejectTransaction} from "@hashgraph/sdk";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {TokenAssociationCache} from "@/utils/cache/TokenAssociationCache";

const MAX_TOKENS_PER_REJECT = 10

const props = defineProps({
  tokens: {
    type: Object as PropType<(Token | Nft)[] | null>,
    default: null
  },
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
})

const emit = defineEmits(["rejected"])

const tid = ref<string | null>(null)
const formattedTransactionId = computed(() =>
    tid.value != null ? TransactionID.normalize(tid.value, true) : null
)

const isNft = computed(() =>
    props.tokens
    && props.tokens.length >= 1
    && (props.tokens[0] as Nft).serial_number != undefined
)

const inputMessage = ref<string | null>(null)

const inputMessageDetails1 = computed(() => {
  let result: string | null
  if (inputMessageDetails2.value
      || inputMessageDetails3.value
      || inputMessageDetails4.value
      || inputMessageDetails5.value
  ) {
    result = (rejectCandidates.value.length >= 1)
        ? `The remaining selected ${isNft.value ? 'NFTs' : 'tokens'} cannot be rejected because:`
        : 'This is because:'
  } else {
    result = null
  }
  return result
})
const inputMessageDetails2 = ref<string | null>(null)
const inputMessageDetails3 = ref<string | null>(null)
const inputMessageDetails4 = ref<string | null>(null)
const inputMessageDetails5 = ref<string | null>(null)

const busyMessage = ref<string | null>(null)
const busyMessageDetails = ref<string | null>(null)

const errorMessage = ref<string | null>(null)
const errorMessageDetails = ref<string | null>(null)

const rejectCandidates = ref<(Token | Nft)[]>([])
const treasuryTokens = ref<string[]>([])
const pausedTokens = ref<string[]>([])
const frozenTokens = ref<string[]>([])
const zeroBalanceTokens = ref<string[]>([])

const nbRequiredTransactions = computed(() => Math.ceil(rejectCandidates.value.length / MAX_TOKENS_PER_REJECT))

onMounted(() => {
  watch(props.controller.visible, async (visible) => {
    if (visible) {
      await filterSelectedTokens()
      populateUserFeedback()
    } else {
      rejectCandidates.value = []
      treasuryTokens.value = []
      pausedTokens.value = []
      frozenTokens.value = []
      zeroBalanceTokens.value = []
    }
  }, {immediate: true})
})

const filterSelectedTokens = async () => {

  for (const t of props.tokens ?? []) {
    let isTreasury = false
    let isPaused = false

    if ((await TokenInfoCache.instance.lookup(t.token_id!))?.treasury_account_id === walletManager.accountId.value) {
      isTreasury = true
      treasuryTokens.value.push(t.token_id!)
    }
    if ((await TokenInfoCache.instance.lookup(t.token_id!))?.pause_status === 'PAUSED') {
      isPaused = true
      pausedTokens.value.push(t.token_id!)
    }
    const associations = await TokenAssociationCache.instance.lookup(
        TokenAssociationCache.makeAssociationKey(walletManager.accountId.value!, t.token_id!)
    )
    const isFrozen = associations && associations.length >= 1 && associations[0].freeze_status === FreezeStatus.FROZEN
    if (isFrozen) {
      frozenTokens.value.push((t.token_id!))
    }
    const balance = (associations && associations.length >= 1) ? associations[0].balance : 0
    if (balance === 0) {
      zeroBalanceTokens.value.push(t.token_id!)
    }
    if (!isTreasury && !isPaused && !isFrozen && balance > 0) {
      console.log(`Adding token ${t.token_id} to the TokenRejectTransaction`)
      rejectCandidates.value.push(t)
    }
  }
}

const populateUserFeedback = () => {

  if (rejectCandidates.value.length === 0) {
    if (props.tokens!.length > 1) {
      inputMessage.value = `None of the selected ${isNft.value ? "NFT" : "token"} can be rejected.`
    } else {
      inputMessage.value = `The selected ${isNft.value ? "NFT" : "token"} cannot be rejected.`
    }
  } else {
    if (rejectCandidates.value.length === 1) {
      inputMessage.value = `Do you want to reject ${isNft.value ? "NFT" : "token"} ${tokenOrNftId(rejectCandidates.value[0])}`
    } else {
      inputMessage.value = `Do you want to reject ${rejectCandidates.value.length} ${isNft.value ? "NFT" : "token"}s`
    }
    if (rejectCandidates.value.length < props.tokens!.length) {
      inputMessage.value += ` (out of the ${props.tokens!.length} selected)?`
    } else {
      inputMessage.value += '?'
    }
  }
  if (treasuryTokens.value.length >= 1) {
    inputMessageDetails2.value = `Your account is treasury for: ${treasuryTokens.value.splice(0, 4).join(', ')}`
    inputMessageDetails2.value += (treasuryTokens.value.length > 4 ? '…' : '')
  } else {
    inputMessageDetails2.value = null
  }
  if (pausedTokens.value.length >= 1) {
    inputMessageDetails3.value = pausedTokens.value.length === 1 ? `This ${isNft.value ? "collection" : "token"} is paused: ` : "These are paused: "
    inputMessageDetails3.value += pausedTokens.value.splice(0, 4).join(', ')
    inputMessageDetails3.value += (pausedTokens.value.length > 4 ? '…' : '')
  } else {
    inputMessageDetails3.value = null
  }
  if (frozenTokens.value.length >= 1) {
    inputMessageDetails4.value = frozenTokens.value.length === 1 ? `This ${isNft.value ? "collection" : "token"} is frozen: ` : "These are frozen: "
    inputMessageDetails4.value += frozenTokens.value.splice(0, 4).join(', ')
    inputMessageDetails4.value += (frozenTokens.value.length > 4 ? '…' : '')
  } else {
    inputMessageDetails4.value = null
  }
  if (zeroBalanceTokens.value.length >= 1) {
    inputMessageDetails5.value = zeroBalanceTokens.value.length === 1 ? "This token has a 0 balance: " : "These have a 0 balance: "
    inputMessageDetails5.value += zeroBalanceTokens.value.splice(0, 4).join(', ')
    inputMessageDetails5.value += (zeroBalanceTokens.value.length > 4 ? '…' : '')
  } else {
    inputMessageDetails5.value = null
  }
}

//
// Handle Reject Transaction(s)
//
const onReject = async () => {

  props.controller.mode.value = DialogMode.Busy
  tid.value = null
  let iteration = 0

  try {
    for (iteration = 0; iteration < nbRequiredTransactions.value; iteration++) {
      if (nbRequiredTransactions.value === 1) {
        busyMessage.value = `Sending transaction to Hedera Network using your wallet…`
      } else {
        busyMessage.value = `Sending transaction #${iteration + 1} (out of ${nbRequiredTransactions.value}) to Hedera Network using your wallet…`
      }
      busyMessageDetails.value = "Check your wallet for any approval request"

      const start = iteration * MAX_TOKENS_PER_REJECT
      const end = Math.min(rejectCandidates.value.length, start + MAX_TOKENS_PER_REJECT)
      console.log(`rejecting tokens from ${start} to ${end}`)
      const rejected = rejectCandidates.value.slice(start, end)
      const transaction = new TokenRejectTransaction()

      for (const t of rejected) {
        if ((t as Nft).serial_number) {
          transaction.addNftId(new NftId(TokenId.fromString(t.token_id!), (t as Nft).serial_number))
        } else {
          transaction.addTokenId(TokenId.fromString(t.token_id!))
        }
        TokenAssociationCache.instance.forgetTokenAssociation(walletManager.accountId.value!, t.token_id!)
      }

      tid.value = TransactionID.normalize(
          await walletManager.rejectTokens(transaction)
      )
      if (tid.value) {
        const transaction: any = await waitForTransactionRefresh(tid.value, 10, 3000)
        if ('result' in transaction) {
          if (transaction.result === null || !isSuccessfulResult(transaction.result)) {
            errorMessage.value = `Transaction failed: ${transaction.result}`
            break
          }
        }
      } else {
        errorMessage.value = "Operation did not complete"
        break
      }
    }

  } catch (reason) {

    console.warn("Transaction Error: " + reason)
    if (reason instanceof WalletClientRejectError) {
      props.controller.handleClose()
    } else {
      if (reason instanceof WalletClientError) {
        errorMessage.value = `${reason.message} (${reason.extra})`
      } else {
        const error = reason instanceof Error ? JSON.stringify(reason.message) : JSON.stringify(reason)
        errorMessage.value = `Operation did not complete: ${error}`
      }
    }

  } finally {

    if (iteration >= nbRequiredTransactions.value) {
      props.controller.mode.value = DialogMode.Success
      emit('rejected')
    } else {
      props.controller.mode.value = DialogMode.Error
      if (iteration > 0) {
        const rejected = iteration * MAX_TOKENS_PER_REJECT
        errorMessageDetails.value = `Only ${rejected} tokens out of ${props.tokens!.length} were rejected.`
        emit('rejected')
      } else {
        errorMessageDetails.value = `No tokens were rejected.`
      }
    }

  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
