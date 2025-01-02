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
        Claim Token Airdrops
      </div>
    </template>

    <!-- input -->
    <template #dialogInput>
      <div class="h-is-tertiary-text mb-4">
        {{ inputMessage1 }}
      </div>
      <div v-if="inputMessage2" class="h-is-tertiary-text mb-4">
        {{ inputMessage2 }}
      </div>
      <div class="h-is-property-text mb-4">
        {{ inputMessageDetails }}
      </div>
    </template>

    <!-- busy -->
    <template #dialogBusy>
      <div class="h-is-tertiary-text mb-4">
        {{ busyMessage }}
      </div>
      <div class="h-is-property-text mb-4">
        {{ busyMessageDetails }}
      </div>
    </template>

    <!-- success -->
    <template #dialogSuccess>
      <div class="is-flex is-align-items-baseline mb-4">
        <div class="icon is-medium has-text-success ml-0">
          <i class="fas fa-check"/>
        </div>
        <div class="h-is-tertiary-text">
          Operation completed
        </div>
      </div>
      <div v-if="formattedTransactionId" class="h-is-property-text mb-4">
        {{ 'With transaction ID: ' + formattedTransactionId }}
      </div>
    </template>

    <!-- error -->
    <template #dialogError>
      <div class="is-flex is-align-items-baseline mb-4">
        <div class="icon is-medium has-text-danger">
          <span style="font-size: 18px; font-weight: 900">X</span>
        </div>
        <div class="h-is-tertiary-text">
          {{ errorMessage }}
        </div>
      </div>
      <div class="h-is-property-text mb-4">
        {{ errorMessageDetails }}
      </div>
    </template>

    <template #dialogInputButtons>
      <DialogButton :controller="controller">CANCEL</DialogButton>
      <CommitButton
          :controller="controller"
          :enabled="airdrops !== null && airdrops.length >= 1"
          @action="onClaim"
      >
        CLAIM
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
import {waitForTransactionRefresh} from "@/schemas/MirrorNodeUtils.ts";
import {TransactionID} from "@/utils/TransactionID";
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient";
import {TokenAirdrop} from "@/schemas/MirrorNodeSchemas";
import DialogButton from "@/dialogs/core/DialogButton.vue";
import CommitButton from "@/dialogs/core/CommitButton.vue";
import {walletManager} from "@/router";
import Dialog from "@/dialogs/core/Dialog.vue";
import {isSuccessfulResult} from "@/utils/TransactionTools";

const MAX_AIRDROPS_PER_CLAIM = 10

const props = defineProps({
  airdrops: {
    type: Object as PropType<TokenAirdrop[] | null>,
    default: null
  },
  drained: {
    type: Boolean,
    default: true
  },
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
})

const emit = defineEmits(["claimed"])

const tid = ref<string | null>(null)
const formattedTransactionId = computed(() =>
    tid.value != null ? TransactionID.normalize(tid.value, true) : null
)

const inputMessage1 = ref<string | null>(null)
const inputMessage2 = ref<string | null>(null)
const inputMessageDetails = ref<string | null>(null)

const busyMessage = ref<string | null>(null)
const busyMessageDetails = ref<string | null>(null)

const errorMessage = ref<string | null>(null)
const errorMessageDetails = ref<string | null>(null)

const nbRequiredTransactions = computed(() =>
    props.airdrops ? Math.ceil(props.airdrops.length / MAX_AIRDROPS_PER_CLAIM) : 0
)

onMounted(() => {
  watch(props.controller.visible, (visible) => {
    if (visible && props.airdrops) {
      inputMessage1.value = `Do you want to claim ${props.airdrops.length} token airdrops?`
      if (props.drained) {
        inputMessage2.value = null
      } else {
        inputMessage2.value = "(You might have more but we have limited to the first 100)"
      }
      if (props.airdrops.length > MAX_AIRDROPS_PER_CLAIM) {
        inputMessageDetails.value =
            `This will require sending ${nbRequiredTransactions.value} transactions ` +
            `(maximum of ${MAX_AIRDROPS_PER_CLAIM} tokens claimed per transaction).`
      } else {
        inputMessageDetails.value = ""
      }
    } else {
      inputMessage1.value = null
      inputMessage2.value = null
      inputMessageDetails.value = null
    }
  }, {immediate: true})
})

//
// Handle Claim Transaction(s)
//
const onClaim = async () => {

  props.controller.mode.value = DialogMode.Busy
  tid.value = null
  let iteration = 0

  try {
    for (iteration = 0; iteration < nbRequiredTransactions.value; iteration++) {
      if (nbRequiredTransactions.value > 1) {
        busyMessage.value = `Sending transaction #${iteration + 1} (out of ${nbRequiredTransactions.value}) to Hedera Network using your wallet…`
      } else {
        busyMessage.value = `Sending transaction to Hedera Network using your wallet…`
      }
      busyMessageDetails.value = "Check your wallet for any approval request"

      const start = iteration * MAX_AIRDROPS_PER_CLAIM
      const end = Math.min(props.airdrops!.length, start + MAX_AIRDROPS_PER_CLAIM)
      const airdrops = props.airdrops!.slice(start, end)

      // console.log(`claiming airdrops from ${start} to ${end}`)
      tid.value = TransactionID.normalize(
          await walletManager.claimTokenAirdrops(airdrops)
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
      emit('claimed')
    } else {
      props.controller.mode.value = DialogMode.Error
      if (iteration > 0) {
        const claimed = iteration * MAX_AIRDROPS_PER_CLAIM
        errorMessageDetails.value = `Only ${claimed} tokens out of ${props.airdrops!.length} were claimed.`
        emit('claimed')
      } else {
        errorMessageDetails.value = `No tokens were claimed.`
      }
    }

  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
