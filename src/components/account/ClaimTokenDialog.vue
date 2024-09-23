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
        {{ inputMessage }}
      </div>
      <div class="h-is-property-text">
        {{ inputMessageDetails }}
      </div>
    </template>

    <!-- busy -->
    <template #dialogBusy>
      <div class="h-is-tertiary-text mb-4">
        Connecting to Hedera Network using your wallet…
      </div>
      <div class="h-is-property-text">
        Check your wallet for any approval request
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
import {DialogController, DialogMode} from "@/components/dialog/DialogController";
import {waitForTransactionRefresh} from "@/schemas/HederaUtils";
import {TransactionID} from "@/utils/TransactionID";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";
import {TokenAirdrop} from "@/schemas/HederaSchemas";
import DialogButton from "@/components/dialog/DialogButton.vue";
import CommitButton from "@/components/dialog/CommitButton.vue";
import {walletManager} from "@/router";
import Dialog from "@/components/dialog/Dialog.vue";
import {isSuccessfulResult} from "@/utils/TransactionTools";

const MAX_AIRDROPS_PER_CLAIM = 3

const props = defineProps({
  airdrops: {
    type: Object as PropType<TokenAirdrop[] | null>,
    default: null
  },
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
})

const emit = defineEmits(["claimed", "cancelled"])

const tid = ref<string | null>(null)
const formattedTransactionId = computed(() =>
    tid.value != null ? TransactionID.normalize(tid.value, true) : null
)

const inputMessage = ref<string | null>(null)
const inputMessageDetails = ref<string | null>(null)

const errorMessage = ref<string | null>(null)
const errorMessageDetails = ref<string | null>(null)

onMounted(() => {
  watch(props.controller.visible, (visible) => {
    if (visible && props.airdrops) {
      if (props.airdrops.length > MAX_AIRDROPS_PER_CLAIM) {
        inputMessage.value = `Too many token airdrops (${props.airdrops.length}) selected for a single claim operation.`
        inputMessageDetails.value = `Please select a maximum of ${MAX_AIRDROPS_PER_CLAIM} tokens.`
      } else {
        inputMessage.value = `Do you want to claim ${props.airdrops.length} token airdrops?`
        inputMessageDetails.value = ""
      }
    } else {
      inputMessage.value = null
      inputMessageDetails.value = null
    }
  }, {immediate: true})
})

const onClaim = async () => {
  props.controller.mode.value = DialogMode.Busy
  tid.value = null

  try {

    tid.value = TransactionID.normalize(
        await walletManager.claimTokenAirdrops(props.airdrops!)
    )
    if (tid.value) {
      const transaction: any = await waitForTransactionRefresh(tid.value, 10, 3000)
      if ('result' in transaction) {
        if (transaction.result != null && isSuccessfulResult(transaction.result)) {
          props.controller.mode.value = DialogMode.Success
          emit('claimed')
        } else {
          props.controller.mode.value = DialogMode.Error
          errorMessage.value = "Transaction failed"
          errorMessageDetails.value = transaction.result
        }
      } else {
        props.controller.mode.value = DialogMode.Success
      }
    } else {
      props.controller.mode.value = DialogMode.Error
      errorMessage.value = "Operation did not complete"
      errorMessageDetails.value = "Cannot find resulting transaction"
    }

  } catch (reason) {

    console.warn("Transaction Error: " + reason)
    if (reason instanceof WalletDriverCancelError) {
      props.controller.handleClose()
    } else {
      props.controller.mode.value = DialogMode.Error
      if (reason instanceof WalletDriverError) {
        errorMessage.value = reason.message
        errorMessageDetails.value = reason.extra
      } else {
        errorMessage.value = "Operation did not complete"
        errorMessageDetails.value = reason instanceof Error ? JSON.stringify(reason.message) : JSON.stringify(reason)
      }
    }

  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
