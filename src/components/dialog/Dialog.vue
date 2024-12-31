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
  <template v-if="controller.visible.value">
    <div class="is-active modal has-text-white">
      <div class="modal-background"/>
      <div class="modal-content" :style="{'width': props.width+'px'}" style="border-radius: 16px">
        <div class="box" style="padding: 32px">

          <div class="is-flex is-justify-content-space-between is-align-items-baseline">
            <slot name="dialogTitle"/>
          </div>

          <hr v-if="slots.dialogTitle" class="h-card-separator"/>

          <div class="dialog-stack mb-4">
            <div :class="{'is-invisible': !dialogInputVisible}">
              <slot name="dialogInput"/>
            </div>
            <div :class="{'is-invisible': !dialogBusyVisible}" class="is-flex-direction-column is-align-content-center">
              <slot name="dialogBusy">Task is on-going…</slot>
            </div>
            <div :class="{'is-invisible': !dialogSuccessVisible}"
                 class="is-flex-direction-column is-align-content-center">
              <slot name="dialogSuccess">Task did succeed</slot>
            </div>
            <div :class="{'is-invisible': !dialogErrorVisible}"
                 class="is-flex-direction-column is-align-content-center">
              <slot name="dialogError">Task did fail</slot>
            </div>
          </div>

          <div class="is-flex is-align-items-center is-justify-content-space-between column-gap-1">
            <div class="has-text-danger">
              <slot name="dialogFeedback"/>
            </div>
            <div class="is-flex is-justify-content-space-between column-gap-1">
              <div class="is-flex is-justify-content-flex-start column-gap-1">
                <template v-if="dialogInputVisible || dialogBusyVisible">
                  <slot name="dialogInputControls"/>
                </template>
              </div>
              <div class="is-flex is-justify-content-flex-end column-gap-1">
                <template v-if="dialogInputVisible || dialogBusyVisible">
                  <slot name="dialogInputButtons">
                    <DialogButton :controller="props.controller">Close</DialogButton>
                  </slot>
                </template>
                <template v-else-if="dialogSuccessVisible">
                  <slot name="dialogSuccessButtons">
                    <DialogButton :controller="props.controller">Close</DialogButton>
                  </slot>
                </template>
                <template v-else-if="dialogErrorVisible">
                  <slot name="dialogErrorButtons">
                    <DialogButton :controller="props.controller">Close</DialogButton>
                  </slot>
                </template>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </template>
</template>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType, useSlots, watch} from "vue";
import DialogButton from "@/components/dialog/DialogButton.vue";
import {DialogController, DialogMode} from "@/components/dialog/DialogController";

const props = defineProps({
      controller: {
        type: Object as PropType<DialogController>,
        required: true
      },
      width: {
        type: Number,
        default: 768
      },
    })

const slots = useSlots()
const dialogInputVisible = computed(() => props.controller.mode.value === DialogMode.Input)
const dialogBusyVisible = computed(() => props.controller.mode.value === DialogMode.Busy)
const dialogSuccessVisible = computed(() => props.controller.mode.value === DialogMode.Success)
const dialogErrorVisible = computed(() => props.controller.mode.value === DialogMode.Error)

watch(props.controller.visible, () => {
  if (props.controller.visible.value) {
    props.controller.mode.value = DialogMode.Input
  }
})


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
.dialog-stack {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  justify-items: stretch;
  place-items: stretch;
}

.dialog-stack div {
  grid-column-start: 1;
  grid-row-start: 1
}

.column-gap-1 {
  column-gap: 1em
}
</style>

