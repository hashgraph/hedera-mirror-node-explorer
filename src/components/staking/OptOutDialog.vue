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
  <ModalDialog :icon-class="iconClass" :show-dialog="showDialog">
    <template v-slot:dialogMessage>
      <slot name="dialogMessage"/>
    </template>
    <template v-slot:dialogDetails>
      <slot name="dialogDetails"/>

      <div class="is-flex is-justify-content-space-between is-align-items-baseline mt-4">
        <div class="is-flex is-justify-content-start is-align-items-center mt-3 has-text-grey-light">
          <label class="checkbox mr-2 mt-1">
            <input v-model="dontShowNextTime" type="checkbox">
          </label>
          <span>Please don't show me this next time</span>
        </div>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
          <button class="button is-info is-small ml-4" @click="handleAgree">AGREE</button>
        </div>
      </div>

    </template>
  </ModalDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, ref} from "vue";
import ModalDialog from "@/components/ModalDialog.vue";

export default defineComponent({
  name: "OptOutDialog",
  components: {ModalDialog},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    iconClass: String
  },
  setup(props, context) {
    const dontShowNextTime = ref(false)
    const handleAgree = () => {
      if (dontShowNextTime.value) {
        console.log("Should store NOT NEXT TIME")
      }
      context.emit('update:showDialog', false)
      context.emit('onAgree')
    }
    const handleCancel = () => {
      context.emit('update:showDialog', false)
      context.emit('onClose')
    }
    return {
      dontShowNextTime,
      handleAgree,
      handleCancel
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>

