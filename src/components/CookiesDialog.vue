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
  <ModalDialog :icon-class="iconClass" :show-dialog="showDialog" :show-close-icon="false">
    <template v-slot:dialogMessage>
      <span>Accept Cookies</span>
    </template>
    <template v-slot:dialogDetails>
      <span class="mr-1">We use cookies to deliver the best experience on our website and to analyze traffic.
        By continuing to use this site, you consent to our cookie policy.
        Review our</span>
      <a class="mr-1" href="https://swirldslabs.com/privacy-policy/">Privacy Policy</a>
      <span>to understand how Swirlds Labs collects and uses information.</span>
      <div class="is-flex is-justify-content-space-between is-align-items-baseline mt-4">
        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleChooseReject">REJECT</button>
          <button class="button is-info is-small ml-4" @click="handleChooseAccept">ACCEPT</button>
        </div>
      </div>
    </template>
  </ModalDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent} from "vue";
import ModalDialog from "@/components/ModalDialog.vue";

export default defineComponent({
  name: "CookiesDialog",
  components: {ModalDialog},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    iconClass: String
  },
  setup(props, context) {
    const handleChooseAccept = () => {
      context.emit('update:showDialog', false)
      context.emit('onChooseAccept')
    }
    const handleChooseReject = () => {
      context.emit('update:showDialog', false)
      context.emit('onChooseReject')
    }
    return {
      handleChooseAccept,
      handleChooseReject,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>

