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
    <div class="modal-content" style="width: 772px; border-radius: 16px">
      <div class="box">

        <div class="h-is-primary-title">
          <slot name="dialogTitle"/>
        </div>

        <hr class="h-card-separator"/>

        <div v-if="mainMessage" class="block h-is-tertiary-text mt-2">{{ mainMessage }}</div>
        <div v-if="extraMessage" class="my-4" style="line-height: 21px">
          <span v-if="extraMessage" class="h-is-property-text">{{ extraMessage }}</span>
        </div>
        
        
        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-info is-small ml-4" @click="handleDone">{{ confirmLabel }}</button>
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
  name: "DoneDialog",
  components: {},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    mainMessage: {
      type: String as PropType<string|null>,
      default: null
    },
    extraMessage: {
      type: String as PropType<string|null>,
      default: null
    },
    confirmLabel: {
        type: String as PropType<string>,
        default: "DONE"
    }
  },

  setup(props, context) {
    const slots = useSlots()

    const handleDone = () => {
      context.emit('update:showDoneDialog', false)
      context.emit('onDoneConfirm')
    }

    return {
      slots,
      handleDone,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

