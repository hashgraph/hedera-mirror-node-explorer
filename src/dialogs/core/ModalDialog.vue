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
  <div class="modal has-text-white" v-bind:class="{'is-active': showDialog}">
    <div class="modal-background"/>
    <div class="modal-content h-modal-content" style="border-radius: 16px">
      <div class="box">

        <div class="is-flex is-justify-content-space-between is-align-items-baseline">
          <div class="is-flex is-justify-content-start is-align-items-baseline">
            <span v-if="iconClass" class="icon ml-2 mr-5"><i :class="iconClass"/></span>
            <div class="block h-is-tertiary-text mt-2">
              <slot name="dialogMessage"/>
            </div>
          </div>
          <a v-if="showCloseIcon" @click="handleClose">
            <img alt="Modal close icon" src="../../assets/close-icon.png" style="max-height: 20px;">
          </a>

        </div>

        <hr class="h-card-separator"/>

        <div class="block h-is-property-text has-text-grey mb-2" style="line-height: 1.5">
          <slot name="dialogDetails"/>
        </div>

      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent} from "vue";

export default defineComponent({
  name: "ModalDialog",
  components: {},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    iconClass: String,
    showCloseIcon: {
      type: Boolean,
      default: true
    },
  },

  setup(props, context) {
    const handleClose = () => {
      context.emit('update:showDialog', false)
      context.emit('onClose')
    }
    return {handleClose}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
span.icon {
  align-items: flex-start;
}
</style>

