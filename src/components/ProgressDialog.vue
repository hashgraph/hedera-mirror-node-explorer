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
  <div :class="{'is-active': showDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px; border-radius: 16px">
      <div class="box">

        <div class="h-is-primary-title">
          <slot name="dialogTitle"/>
        </div>

        <hr class="h-card-separator"/>

        <div v-if="mainMessage" class="block h-is-tertiary-text mt-2"> {{ mainMessage }} </div>
        <div v-else class="block h-is-tertiary-text" style="visibility: hidden">Filler</div>

        <div v-if="extraMessage" class="block h-is-property-text"> {{ extraMessage }} </div>
        <div v-else class="block h-is-property-text" style="visibility: hidden">Filler</div>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" :disabled="closeDisabled" @click="handleClose">CLOSE</button>
        </div>

      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";

export enum Mode { Busy = 1, Success = 2, Error = 3 }

export default defineComponent({
  name: "ConfirmDialog",
  components: {},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    mode: {
      type: Number as PropType<Mode>,
      default: Mode.Busy
    },
    mainMessage: String,
    extraMessage: String,
  },

  setup(props, context) {

    const handleClose = () => {
      context.emit('update:showDialog', false)
    }

    const closeDisabled = computed(() => props.mode == Mode.Busy)

    return {
      handleClose,
      closeDisabled,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

