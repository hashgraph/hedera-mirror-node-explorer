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
  <div :class="{'is-active': showDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px; border-radius: 16px">
      <div class="box">

        <div class="h-is-primary-title">
          <slot name="dialogTitle"/>
        </div>

        <hr class="h-card-separator"/>

        <div v-if="mainMessage" class="block h-is-tertiary-text mt-2">{{ mainMessage }}</div>
        <div v-else class="block h-is-property-text" style="visibility: hidden">Filler</div>
        <div v-if="extraMessage" class="my-4" style="line-height: 21px">
          <span v-if="extraMessage" class="h-is-property-text">{{ extraMessage }}</span>
          <span v-else class="h-is-property-text" style="visibility: hidden">Filler</span>
        </div>


        <div v-if="slots.dialogOption">
          <slot name="dialogOption"/>
        </div>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleCancel">{{ cancelLabel }}</button>
          <button class="button is-info is-small ml-4" @click="handleConfirm">{{ confirmLabel }}</button>
        </div>

      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType, useSlots} from "vue";

export default defineComponent({
  name: "ConfirmDialog",
  components: {},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    mainMessage: {
      type: String as PropType<string | null>,
      default: null
    },
    extraMessage: {
      type: String as PropType<string | null>,
      default: null
    },
    confirmLabel: {
      type: String as PropType<string>,
      default: "CONFIRM"
    },
    cancelLabel: {
      type: String as PropType<string>,
      default: "CANCEL"
    },
  },

  setup(props, context) {
    const slots = useSlots()

    const handleCancel = () => {
      context.emit('update:showDialog', false)
      context.emit('onCancel')
    }

    const handleConfirm = () => {
      context.emit('update:showDialog', false)
      context.emit('onConfirm')
    }

    return {
      slots,
      handleCancel,
      handleConfirm,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

