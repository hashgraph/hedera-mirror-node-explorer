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

    <!-- title -->
    <template v-slot:dialogTitle>
      <div class="h-is-primary-title">
        <span>
          Delete allowance
        </span>
        <span v-if="spender" class="ml-1">
          to account
        </span>
        <span v-if="spender" class="h-is-secondary-text has-text-weight-light ml-1">
          {{ spender }}
        </span>
      </div>
    </template>

    <!-- input -->
    <template v-slot:dialogInput>

      <template v-if="isApprovedForAll">
        <div class="h-is-tertiary-text mb-2">
          Do you want to delete the allowance for all NFTs of collection
        </div>
        <div class="h-is-tertiary-text h-is-extra-text">
          {{ tokenName }}
        </div>
      </template>

      <template v-else>
        <div class="h-is-tertiary-text mb-2">
        <span>
          Do you want to delete the allowance for NFT
        </span>
          <span class="h-is-extra-text mr-1">
          {{ '#' + serial }}
        </span>
          <span>
          of collection
        </span>
        </div>
        <div class="h-is-tertiary-text h-is-extra-text">
          {{ tokenName }}
        </div>
      </template>

    </template>

    <!-- busy -->
    <template v-slot:dialogBusy>
      <div class="h-is-tertiary-text mb-4">
        Connecting to Hedera Network using your wallet…
      </div>
      <div class="h-is-property-text">
        Check your wallet for any approval request
      </div>
    </template>

    <!-- success -->
    <template v-slot:dialogSuccess>
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
    <template v-slot:dialogError>
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

    <template v-slot:dialogInputButtons>
      <DialogButton :controller="controller">CANCEL</DialogButton>
      <CommitButton :controller="controller" :enabled="true" @action="onDelete">DELETE</CommitButton>
    </template>


  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType, ref} from "vue";
import Dialog from "@/dialogs/core/dialog/Dialog.vue";
import CommitButton from "@/dialogs/core/dialog/CommitButton.vue";
import DialogButton from "@/dialogs/core/dialog/DialogButton.vue";
import {DialogController, DialogMode} from "@/dialogs/core/dialog/DialogController.ts";
import {walletManager} from "@/router";
import {Nft, NftAllowance} from "@/schemas/MirrorNodeSchemas";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {makeTokenName, waitForTransactionRefresh} from "@/schemas/MirrorNodeUtils.ts";
import {TransactionID} from "@/utils/TransactionID";
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient";

export default defineComponent({
  name: "DeleteNftAllowanceDialog",
  components: {DialogButton, CommitButton, Dialog},
  props: {
    controller: {
      type: Object as PropType<DialogController>,
      required: true
    },
    nftAllowance: {
      type: Object as PropType<Nft | null>,
      default: null
    },
    nftAllSerialsAllowance: {
      type: Object as PropType<NftAllowance | null>,
      default: null
    }
  },
  emits: ["deleted"],
  setup(props, ctx) {
    const isApprovedForAll = computed(() => props.nftAllSerialsAllowance != null)

    const spender = computed(() =>
        props.nftAllowance?.spender ?? props.nftAllSerialsAllowance?.spender ?? null
    )
    const token = computed(() =>
        props.nftAllowance?.token_id ?? props.nftAllSerialsAllowance?.token_id ?? null
    )
    const serial = computed(() => props.nftAllowance?.serial_number ?? null)

    const tokenInfoLookup = TokenInfoCache.instance.makeLookup(token)
    onMounted(() => tokenInfoLookup.mount())
    onBeforeUnmount(() => tokenInfoLookup.unmount())
    const tokenInfo = computed(() => tokenInfoLookup.entity.value)
    const tokenName = computed(() => makeTokenName(tokenInfo.value, 32))

    const tid = ref<string | null>(null)
    const formattedTransactionId = computed(() =>
        tid.value != null ? TransactionID.normalize(tid.value, true) : null
    )

    const errorMessage = ref<string | null>(null)
    const errorMessageDetails = ref<string | null>(null)

    const onDelete = async () => {
      props.controller.mode.value = DialogMode.Busy
      tid.value = null

      try {

        if (isApprovedForAll.value && token.value != null && spender.value != null) {
          tid.value = TransactionID.normalize(
              await walletManager.deleteNftAllSerialsAllowance(token.value, spender.value)
          )
        } else if (token.value != null && serial.value != null) {
          tid.value = TransactionID.normalize(
              await walletManager.deleteNftAllowance(token.value, serial.value)
          )
        } else {
          // This should not happen
        }
        // console.log("Transaction ID: " + tid.value)
        if (tid.value) {
          await waitForTransactionRefresh(tid.value, 10, 3000)
        }
        props.controller.mode.value = DialogMode.Success
        ctx.emit('deleted')

      } catch (reason) {

        console.warn("Transaction Error: " + reason)
        if (reason instanceof WalletClientRejectError) {
          props.controller.handleClose()
        } else {
          props.controller.mode.value = DialogMode.Error
          if (reason instanceof WalletClientError) {
            errorMessage.value = reason.message
            errorMessageDetails.value = reason.extra
          } else {
            errorMessage.value = "Operation did not complete"
            errorMessageDetails.value = reason instanceof Error ? JSON.stringify(reason.message) : JSON.stringify(reason)
          }
        }

      }
    }

    return {
      isApprovedForAll,
      spender,
      serial,
      tokenName,
      formattedTransactionId,
      errorMessage,
      errorMessageDetails,
      onDelete,
    }
  }
})
</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
