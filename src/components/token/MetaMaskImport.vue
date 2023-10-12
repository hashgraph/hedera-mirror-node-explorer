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

<template class="">
  <button id="showStakingDialog" class="button is-white h-is-smaller"
          @click="handleAction">IMPORT TO METAMASK</button>
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

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType, ref} from "vue";
import ModalDialog from "@/components/ModalDialog.vue";
import {TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer";
import {walletManager} from "@/router";

export default defineComponent({
  name: "MetaMaskImport",
  components: {ModalDialog},
  props: {
    analyzer: {
        type: Object as PropType<TokenInfoAnalyzer>,
        required: true
    }
  },
  setup(props) {

    const executing = ref(false)

    const clickDisabled = computed(() => {
      return executing.value || props.analyzer.tokenId.value === null
    })

    //
    // showErrorDialog
    //
    const showErrorDialog = ref(false)

    const handleAction = async () => {
      executing.value = true
      const tokenId = props.analyzer.tokenId.value!
      try {
        await walletManager.watchToken(tokenId)
      } catch {
        showErrorDialog.value = true
      } finally {
        executing.value = false
      }
    }

    return { showErrorDialog, handleAction, clickDisabled, executing }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
