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
  <Dialog :controller="controller" :width="624">

    <!-- title -->
    <template #dialogTitle>
      <div class="h-is-primary-title">
        Reject Tokens
      </div>
    </template>

    <!-- input -->
    <template #dialogInput>
      <div class="h-is-tertiary-text mb-4">
        {{ inputMessage }}
      </div>
      <div class="h-is-property-text">
        {{ inputMessageDetails }}
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
          :enabled="tokens !== null && tokens.length >= 1"
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
import {DialogController, DialogMode} from "@/components/dialog/DialogController";
import {waitForTransactionRefresh} from "@/schemas/HederaUtils";
import {TransactionID} from "@/utils/TransactionID";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";
import DialogButton from "@/components/dialog/DialogButton.vue";
import CommitButton from "@/components/dialog/CommitButton.vue";
import {walletManager} from "@/router";
import Dialog from "@/components/dialog/Dialog.vue";
import {isSuccessfulResult} from "@/utils/TransactionTools";
import {Nft, Token} from "@/schemas/HederaSchemas";
import {NftId, TokenId, TokenRejectTransaction} from "@hashgraph/sdk";

const MAX_TOKENS_PER_REJECT = 2

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

const emit = defineEmits(["rejected", "cancelled"])

const tid = ref<string | null>(null)
const formattedTransactionId = computed(() =>
    tid.value != null ? TransactionID.normalize(tid.value, true) : null
)

const inputMessage = ref<string | null>(null)
const inputMessageDetails = ref<string | null>(null)

const busyMessage = ref<string | null>(null)
const busyMessageDetails = ref<string | null>(null)

const errorMessage = ref<string | null>(null)
const errorMessageDetails = ref<string | null>(null)

const nbRequiredTransactions = computed(() =>
    props.tokens ? Math.ceil(props.tokens.length / MAX_TOKENS_PER_REJECT) : 0
)

onMounted(() => {
  watch(props.controller.visible, (visible) => {
    if (visible && props.tokens) {
      inputMessage.value = `Do you want to reject ${props.tokens.length} tokens?`
      if (props.tokens.length > MAX_TOKENS_PER_REJECT) {
        inputMessageDetails.value =
            `This will require sending ${nbRequiredTransactions.value} transactions ` +
            `(maximum of ${MAX_TOKENS_PER_REJECT} tokens rejected per transaction).`
      } else {
        inputMessageDetails.value = ""
      }
    } else {
      inputMessage.value = null
      inputMessageDetails.value = null
    }
  }, {immediate: true})
})

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
      const end = Math.min(props.tokens!.length, start + MAX_TOKENS_PER_REJECT)
      console.log(`rejecting tokens from ${start} to ${end}`)
      const rejected = props.tokens!.slice(start, end)
      const transaction = new TokenRejectTransaction()
      for (const t of rejected) {
        if ((t as Nft).serial_number) {
          transaction.addNftId(new NftId(TokenId.fromString(t.token_id!), (t as Nft).serial_number))
        } else {
          transaction.addTokenId(TokenId.fromString(t.token_id!))
        }
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
    if (reason instanceof WalletDriverCancelError) {
      props.controller.handleClose()
    } else {
      if (reason instanceof WalletDriverError) {
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
