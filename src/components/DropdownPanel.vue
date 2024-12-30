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

  <div ref="rootRef">
    <slot name="button"/>
    <div v-if="deployed" style="position: relative">
      <div
          class="panelHolder"
          style="position: absolute; z-index: 999; top:6px;"
          :style="{left: panelDX + 'px', 'box-shadow': boxShadow, 'background-color': props.backgroundColor, 'right': rightDX}"
          ref="panelRef">
        <slot name="panel"/>
      </div>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {ThemeController} from "@/components/ThemeController.ts";

const props = defineProps({
  rightAligned: {
    type: Boolean,
    default: false
  },
  stretched: {
    type: Boolean,
    default: false
  },
  backgroundColor: {
    type: String,
    default: "var(--background-tertiary)"
  }
})

//
// deployed
//

const deployed = defineModel("deployed",{
  type: Boolean,
  required: true
})

const rootRef = ref<HTMLElement|null>(null)
const isInside = (target: Node) => rootRef.value !== null && rootRef.value.contains(target)

const onMouseDown = (ev: MouseEvent) => {
  if (ev.target instanceof Node && !isInside(ev.target)) {
    deployed.value = false
  }
}

//
// right alignment
//

const buttonWidth = ref<number|null>(null)
const panelRef = ref<HTMLElement|null>(null)
const panelWidth = ref<number|null>(null)

const resizeObserver = new ResizeObserver(() => {
  buttonWidth.value = rootRef.value?.offsetWidth ?? 0
  panelWidth.value = panelRef.value?.offsetWidth ?? 0
})

watch(rootRef, (newValue, oldValue) => {
  if (newValue !== null) {
    resizeObserver.observe(newValue)
    buttonWidth.value = rootRef.value?.offsetWidth ?? 0
  } else if (oldValue !== null) {
    resizeObserver.unobserve(oldValue)
    buttonWidth.value = 0
  }
})

watch(panelRef, (newValue, oldValue) => {
  if (newValue !== null) {
    resizeObserver.observe(newValue)
    panelWidth.value = panelRef.value?.offsetWidth ?? 0
  } else if (oldValue !== null) {
    resizeObserver.unobserve(oldValue)
    panelWidth.value = null
  }
})

const panelDX = computed(() => {
  let result: number
  if (props.rightAligned && buttonWidth.value !== null && panelWidth.value !== null) {
    result = -(panelWidth.value - buttonWidth.value)
  } else {
    result = 0
  }
  return result
})

//
// rightDX
//

const rightDX = computed(() => props.stretched ? "0" : "auto")

//
// mount/unmount
//

onMounted(() => {
  document.addEventListener("mousedown", onMouseDown)
})
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onMouseDown)
})

//
// box shadow
//

const lightShadow = "0 4px 18px 0 rgba(0, 0, 0, 7%)"
const darkShadow = "0 4px 18px 0 rgba(255, 255, 255, 7%)"
const darkSelected = ThemeController.inject().darkSelected
const boxShadow = computed(() => darkSelected.value ? darkShadow : lightShadow)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.panelHolder {
  border-color: var(--border-secondary);
  border-radius: 16px;
  border-style: solid;
  border-width: 1px;
  padding: 24px;
}

</style>
