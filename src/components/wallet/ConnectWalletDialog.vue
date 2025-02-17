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

    <template v-slot:dialogTitle>
      <DialogTitle>{{ title }}</DialogTitle>
    </template>

    <template v-slot:dialogInput>
      <DialogStatus :controller="controller" :is-success="false">
        <template v-slot:mainMessage>{{ mainMessage }}</template>
        <template v-slot:extraMessage>{{ extraMessage }}</template>
      </DialogStatus>
    </template>

    <template v-slot:dialogInputButtons>
      <DialogButton :controller="controller">CLOSE</DialogButton>
    </template>

  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import Dialog from "@/components/dialog/Dialog.vue";
import DialogButton from "@/components/dialog/DialogButton.vue";
import DialogTitle from "@/components/dialog/DialogTitle.vue";
import {DialogController} from "@/components/dialog/DialogController";
import DialogStatus from "@/components/dialog/DialogStatus.vue";
import {WalletClientError} from "@/utils/wallet/client/WalletClient";

export default defineComponent({
  name: "ConnectWalletDialog",

  components: {DialogStatus, DialogTitle, DialogButton, Dialog},

  props: {
    controller: {
      type: Object as PropType<DialogController>,
      required: true
    },
    error: {
      type: Object as PropType<unknown>,
      required: false
    }
  },

  setup(props) {
    const title = "Could not connect wallet"
    const mainMessage = computed(
        () => props.error instanceof WalletClientError
            ? props.error.message
            : "Unexpected error"
    )
    const extraMessage = computed(
        () => props.error instanceof WalletClientError
            ? props.error.extra
            : JSON.stringify(props.error)
    )
    return {
      title,
      mainMessage,
      extraMessage,
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
