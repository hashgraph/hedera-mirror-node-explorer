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
    <div class="entry-container m-0">
        <!-- Row 0 -->
        <button
                class="button h-is-smaller has-text-white"
                data-cy="execFunction"
                style="background-color: #202532; border:0; border-radius: 0;"
                v-on:click="handleClick()">
            <i :class="{ 'fa-play': !isGetter, 'fa-redo': isGetter}" class="fas fa-xs" style="background-color: #202532"/>
        </button>
        <div class="is-flex is-align-items-baseline">
            <prism language="solidity" style="background-color: #171920; font-size: 0.7rem">{{ signature }}</prism>
            <div class="h-has-pill has-background-black has-text-grey has-text-weight-normal">{{ mutability }}</div>
        </div>

        <!-- Row 1 -->
        <div/>
        <div v-if="hasResult" class="ml-2 has-text-grey h-is-extra-text">{{ callOutput }}</div>
    </div>
    <ContractAbiDialog
            :controller="dialogController"
            :contract-call-builder="contractCallBuilder"
            @did-update-contract-state="dialogDidUpdateContractState"/>
    <Dialog :controller="alertController">
        <template v-slot:dialogTitle>
            <DialogTitle>Connect your Wallet</DialogTitle>
        </template>
        <template v-slot:dialogInput>
            <DialogStatus :controller="alertController">
                <template v-slot:mainMessage>To execute this function first connect your wallet</template>
                <template v-slot:extraMessage>Use Metamask, Coinbase or Brave (other wallets to be supported soon)</template>
            </DialogStatus>
        </template>
    </Dialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, PropType, ref} from "vue";
import "prismjs/prism";
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/prism.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-solidity.js";
import Prism from "vue-prism-component"
import ContractAbiDialog from "@/components/values/abi/ContractAbiDialog.vue";
import {DialogController} from "@/components/dialog/DialogController";
import {ContractCallBuilder} from "@/components/values/abi/ContractCallBuilder";
import Dialog from "@/components/dialog/Dialog.vue";
import {walletManager} from "@/router";
import DialogStatus from "@/components/dialog/DialogStatus.vue";
import DialogTitle from "@/components/dialog/DialogTitle.vue";

export default defineComponent({
    components: {DialogTitle, DialogStatus, ContractAbiDialog, Dialog, Prism},
    emits: ["didUpdateContractState"],
    props: {
        contractCallBuilder: {
            type: Object as PropType<ContractCallBuilder>,
            required: true
        }
    },

    setup(props, ctx) {

        const running = ref(true)

        const handleClick = () => {
            if (props.contractCallBuilder.isGetter()) {
                running.value = true
                try {
                    props.contractCallBuilder.execute()
                        .finally(() => {
                            running.value = false
                        })
                } catch {
                    running.value = false
                }
            } else {
                if (props.contractCallBuilder.isReadOnly() || walletManager.connected.value) {
                    dialogController.visible.value = true
                } else {
                    alertController.visible.value = true
                }
            }
        }

        const dialogController = new DialogController()
        const alertController = new DialogController()

        onMounted(() => {
            if (props.contractCallBuilder.isGetter()) {
                handleClick()
            }
        })

        const isGetter = computed(() => props.contractCallBuilder.isGetter())

        const signature = computed(() => props.contractCallBuilder.fragment.format("full"))

        const mutability = computed(() => props.contractCallBuilder.fragment.stateMutability)

        const hasResult = computed(() => props.contractCallBuilder.hasResult())

        const dialogDidUpdateContractState = () => {
            ctx.emit("didUpdateContractState")
        }

        return {
            running,
            signature,
            mutability,
            isGetter,
            hasResult,
            callOutput: props.contractCallBuilder.callOutput,
            dialogController,
            alertController,
            handleClick,
            dialogDidUpdateContractState
        }
    }

})

</script>

<style scoped>

.entry-container {
    display: grid;
    grid-template-columns: min-content auto;
    align-items: center;
}

</style>