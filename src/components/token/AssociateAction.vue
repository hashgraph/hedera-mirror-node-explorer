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
    <button v-if="isDissociated" id="associate-button" class="button is-white h-is-smaller"
            @click="handleAssociate">
        {{ associateButtonLabel }}
    </button>
    <button v-else-if="isAssociated" id="associate-button" class="button is-white h-is-smaller"
            @click="handleDissociate">
        DISSOCIATE TOKEN
    </button>
    <div v-else/>

    <span style="display: inline-block">
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
    </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType, ref} from "vue";
import {TokenAssociationStatus, TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer";
import {walletManager} from "@/router";
import ProgressDialog, {Mode} from "@/components/staking/ProgressDialog.vue";
import {WalletDriverCancelError, WalletDriverError} from "@/utils/wallet/WalletDriverError";

export default defineComponent({
    name: "AssociateAction",
    components: {ProgressDialog},
    props: {
        analyzer: {
            type: Object as PropType<TokenInfoAnalyzer>,
            required: true
        }
    },
    setup(props) {

        //
        // Progress dialog
        //

        const showProgressDialog = ref(false)
        const progressDialogMode = ref(Mode.Busy)
        const progressMainMessage = ref<string|null>(null)
        const progressExtraMessage = ref<string|null>(null)
        const progressExtraTransactionId = ref<string|null>(null)
        const showProgressSpinner = ref(false)
        const dialogTitle = ref<string|null>(null)

        const isAssociated = computed(() => props.analyzer.associationStatus.value == TokenAssociationStatus.Associated )
        const isDissociated = computed(() => props.analyzer.associationStatus.value == TokenAssociationStatus.Dissociated )
        const associateButtonLabel = computed(() => walletManager.isMetamaskWallet.value ? 'IMPORT TOKEN' : 'ASSOCIATE TOKEN')

        const handleAssociate = async () => {
            const tokenId = props.analyzer.tokenId.value!
            const tokenSymbol = props.analyzer.tokenSymbol.value!
            const accountId = walletManager.accountId.value!
            dialogTitle.value = walletManager.isMetamaskWallet.value ? 'Associate and import token to Metamask' : 'Associate token'
            showProgressDialog.value = true
            progressDialogMode.value = Mode.Busy
            showProgressSpinner.value = true
            progressMainMessage.value = null
            progressExtraMessage.value = null

            try {
                progressMainMessage.value = "Associating token " + tokenSymbol + " to account " + accountId
                try {
                    await walletManager.associateToken(tokenId)
                } finally {
                    props.analyzer.tokenAssociationDidChange()
                }
                if (walletManager.isMetamaskWallet.value) {
                    progressMainMessage.value = "Importing token " + tokenSymbol + " to MetaMask"
                    await walletManager.watchToken(tokenId)
                }
                showProgressDialog.value = false
            } catch(reason) {
                if (reason instanceof WalletDriverCancelError) {
                    showProgressDialog.value = false
                } else {
                    showProgressDialog.value = true
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
        }

        const handleDissociate = async () => {
            const tokenId = props.analyzer.tokenId.value!
            const tokenSymbol = props.analyzer.tokenSymbol.value!
            const accountId = walletManager.accountId.value!
            dialogTitle.value = 'Dissociate token'
            showProgressDialog.value = true
            progressDialogMode.value = Mode.Busy
            showProgressSpinner.value = true
            progressExtraMessage.value = null

            try {
                progressMainMessage.value = "Dissociating token " + tokenSymbol + " from account " + accountId
                try {
                    await walletManager.dissociateToken(tokenId)
                } finally {
                    props.analyzer.tokenAssociationDidChange()
                }
                showProgressDialog.value = false
            } catch(reason) {
                if (reason instanceof WalletDriverCancelError) {
                    showProgressDialog.value = false
                } else {
                    showProgressDialog.value = true
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
        }

        return {
            handleAssociate,
            handleDissociate,
            showProgressDialog,
            progressDialogMode,
            progressMainMessage,
            progressExtraMessage,
            progressExtraTransactionId,
            showProgressSpinner,
            isAssociated,
            isDissociated,
            associateButtonLabel,
            dialogTitle,
        }
    }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
