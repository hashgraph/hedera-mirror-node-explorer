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
          <span>Approve Allowance</span>
          <span v-if="ownerAccountId"> for account </span>
          <span v-if="ownerAccountId" class="h-is-secondary-text has-text-weight-light mr-3">{{ ownerAccountId }}</span>
        </span>

        <hr class="h-card-separator"/>

        <div class="dialog-grid">
          <div class="has-text-weight-light">
            Spender Account
          </div>
          <div/>
          <input :value="selectedSpender"
                 class="input is-small has-text-right has-text-white"
                 placeholder="Account ID (0.0.1234)"
                 style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
                 type="text"
                 @input="event => handleSpenderInput(event.target.value)">
          <div/>
        </div>

        <div class="dialog-grid mt-4">
          <div class="has-text-weight-light">
            Allowance Type
          </div>
          <div class="control" style="">
            <label class="radio h-radio-button">
              <input v-model="allowanceChoice" name="allowanceType" type="radio" value="hbar">
              HBAR
            </label>
          </div>
          <input :value="selectedHbarAmount"
                 class="input is-small has-text-right has-text-white"
                 placeholder="HBAR Amount"
                 style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
                 type="text"
                 @input="event => handleHbarAmountInput(event.target.value)">
          <div/>
        </div>

        <div class="dialog-grid mt-2">
          <div/>
          <div class="control" style="">
            <label class="radio h-radio-button">
              <input v-model="allowanceChoice" name="allowanceType" type="radio" value="token">
              Token
            </label>
          </div>
          <input :value="selectedToken"
                 class="input is-small has-text-right has-text-white"
                 placeholder="Token ID (0.0.1234)"
                 style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
                 type="text"
                 @input="event => handleTokenInput(event.target.value)">
          <input :value="selectedTokenAmount"
                 class="input is-small has-text-right has-text-white"
                 placeholder="Token Amount"
                 style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
                 type="text"
                 @input="event => handleTokenAmountInput(event.target.value)">
        </div>

        <div class="dialog-grid mt-2">
          <div/>
          <div class="control" style="">
            <label class="radio h-radio-button">
              <input v-model="allowanceChoice" name="allowanceType" type="radio" value="nft">
              NFT
            </label>
          </div>
          <input :value="selectedNFT"
                 class="input is-small has-text-right has-text-white"
                 placeholder="Token ID (0.0.1234)"
                 style="height:26px; margin-top: 1px; border-radius: 4px; border-width: 1px;
                 background-color: var(--h-theme-box-background-color)"
                 type="text"
                 @input="event => handleNFTInput(event.target.value)">
          <div/>
        </div>

        <div class="is-flex is-justify-content-flex-end mt-5">
          <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
          <button :disabled="!enableChangeButton"
                  class="button is-info is-small ml-4" @click="handleChange">CHANGE
          </button>
        </div>

      </div>
    </div>
  </div>

  <ConfirmDialog v-model:show-dialog="showConfirmDialog" :main-message="confirmMessage"
                 @onConfirm="handleConfirmChange">
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">Approve allowance </span>
      <span v-if="ownerAccountId"> for account </span>
      <span v-if="ownerAccountId" class="h-is-secondary-text has-text-weight-light mr-3"
            style="line-height: 36px">{{ ownerAccountId }}</span>
    </template>
  </ConfirmDialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, Ref, ref} from "vue";
import {routeManager, walletManager} from "@/router";
import {EntityID} from "@/utils/EntityID";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default defineComponent({
  name: "ApproveAllowanceDialog",
  components: {ConfirmDialog},
  props: {
    ownerAccountId: String,
    showDialog: {
      type: Boolean,
      default: false
    },
  },
  emits: ["update:showDialog"],

  setup(props, context) {
    const nr = networkRegistry

    const enableChangeButton = computed(() => routeManager.currentNetwork.value === 'testnet')

    const selectedSpender = ref<string | null>(null)
    const selectedHbarAmount = ref<string | null>(null)
    const selectedToken = ref<string | null>(null)
    const selectedTokenAmount = ref<string | null>(null)
    const selectedNFT = ref<string | null>(null)
    const allowanceChoice = ref("hbar")

    const showConfirmDialog = ref(false)
    const confirmMessage = computed(() => {
      let result: string
      switch (allowanceChoice.value) {
        case 'hbar':
          result = "Do you want to approve an allowance to account " + selectedSpender.value
              + " for " + selectedHbarAmount.value + "ħ" + "?"
          break
        case 'token':
          result = "Do you want to approve an allowance to account " + selectedSpender.value
              + " for " + selectedTokenAmount.value + " tokens (" + selectedToken.value + ")?"
          break
        case 'nft':
        default:
          result = "Do you want to approve an allowance to account " + selectedSpender.value
              + " for " + selectedNFT.value + "?"
      }
      return result
    })

    const handleSpenderInput = (value: string) => handleEntityIDInput(selectedSpender, value)
    const handleHbarAmountInput = (value: string) => handleAmountInput(selectedHbarAmount, value)
    const handleTokenInput = (value: string) => handleEntityIDInput(selectedToken, value)
    const handleTokenAmountInput = (value: string) => handleAmountInput(selectedTokenAmount, value)
    const handleNFTInput = (value: string) => handleEntityIDInput(selectedNFT, value)

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleChange = () => {
      context.emit('update:showDialog', false)
      showConfirmDialog.value = true
    }

    const handleConfirmChange = () => {
      console.log("selectedSpender: " + selectedSpender.value)
      console.log("allowanceChoice: " + allowanceChoice.value)
      console.log("selectedHbarAmount: " + selectedHbarAmount.value)
      console.log("selectedToken: " + selectedToken.value)
      console.log("selectedTokenAmount: " + selectedTokenAmount.value)
      console.log("selectedNFT: " + selectedNFT.value)

      if (selectedSpender.value) {
        switch (allowanceChoice.value) {
          case 'hbar':
            if (selectedHbarAmount.value) {
              walletManager.approveHbarAllowance(selectedSpender.value, parseFloat(selectedHbarAmount.value))
                  .then((tid: string) => {
                    console.log("Transaction ID=" + tid)
                  })
                  .catch((reason) => {
                    console.log("Transaction Error: " + reason)
                  })
            }
            break
          case 'token':
            if (selectedToken.value && selectedTokenAmount.value) {
              walletManager.approveTokenAllowance(
                  selectedToken.value,
                  selectedSpender.value,
                  parseFloat(selectedTokenAmount.value)
              )
                  .then((tid: string) => {
                    console.log("Transaction ID=" + tid)
                  })
                  .catch((reason) => {
                    console.log("Transaction Error: " + reason)
                  })
            }
            break
          case 'nft':
          default:
            console.log("Approve NFT Allowance not implemented")
        }
      }
    }

    const handleEntityIDInput = (entityID: Ref<string | null>, value: string) => {
      const previousValue = entityID.value
      let isValidInput = true
      let isValidID = false
      let isPastDash = false

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

    const handleAmountInput = (amount: Ref<string | null>, value: string) => {
      const previousValue = amount.value
      let isValidInput = true
      let isDecimal = false

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

    return {
      enableChangeButton,
      selectedSpender,
      selectedHbarAmount,
      selectedToken,
      selectedTokenAmount,
      selectedNFT,
      allowanceChoice,
      showConfirmDialog,
      confirmMessage,
      handleSpenderInput,
      handleHbarAmountInput,
      handleTokenInput,
      handleTokenAmountInput,
      handleNFTInput,
      handleCancel,
      handleChange,
      handleConfirmChange,
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
  grid-template-columns: 3fr 2fr 4fr 4fr;
  grid-column-gap: 1rem;
}

</style>
