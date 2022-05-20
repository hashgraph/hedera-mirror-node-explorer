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
  <div class="modal has-text-white" v-bind:class="{'is-active': showDialog}">
    <div class="modal-background" @click="handleClose"/>
    <div class="modal-content">
      <div class="box">
        <div class="is-flex is-flex-direction-row is-align-items-start">
          <span class="icon is-large mr-4"><i :class="iconClass"/></span>
          <div>
            <div class="block h-is-tertiary-text mt-2">
              <slot name="dialogMessage"/>
            </div>
            <div class="block h-is-property-text has-text-grey mb-2" style="line-height: 1.5">
              <slot name="dialogDetails"/>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button class="modal-close is-large has-background-grey" aria-label="close" @click="handleClose"/>
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
    iconClass: String
  },

  setup(props, context) {
    const handleClose = () => {
      context.emit('update:showDialog', false)
    }
    return { handleClose }
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

