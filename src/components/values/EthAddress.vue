<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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
  <HexaValue v-bind:byte-string="address" v-bind:show-none="showNone"/>
  <template v-if="showImport">
    <br/>
    <ActionLink title="Import in MetaMask"
                :enabled="address !== undefined"
                :running="executing"
                @action="handleAction"/>
    <span style="display: inline-block">
    <ModalDialog v-model:show-dialog="showErrorDialog">
      <template v-slot:dialogMessage>Please install MetaMask!</template>
      <template v-slot:dialogDetails>
        <div class="block">
          To watch this asset with MetaMask, you must download and install <a href="https://metamask.io">MetaMask</a> extension for your browser.
        </div>
      </template>
    </ModalDialog>
  </span>
  </template>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, ref} from "vue";
import HexaValue from "@/components/values/HexaValue.vue";
import ModalDialog from "@/components/ModalDialog.vue";
import ActionLink from "@/components/ActionLink.vue";
import {MetaMask_Status, MetaMask_watchAsset} from "@/utils/MetaMask";

export default defineComponent({
  name: "EthAddress",
  components: {HexaValue, ModalDialog, ActionLink},
  props: {
    address: String,
    symbol: String,
    decimals: String,
    showImport: {
      type: Boolean,
      default: false
    },
    showNone: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {

    const executing = ref(false)

    const clickDisabled = computed(() => {
      return executing.value || props.address == undefined
    })

    //
    // showErrorDialog
    //
    const showErrorDialog = ref(false)

    const handleAction = () => {
      executing.value = true
      MetaMask_watchAsset(props.address as string, props.symbol, props.decimals)
          .then((status: MetaMask_Status) => {
            if (status == MetaMask_Status.metaMaskNotInstalled) {
              showErrorDialog.value = true
            }
          })
          .finally(() => {
        executing.value = false
      })
    }

    return { showErrorDialog, handleAction, clickDisabled, executing }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
