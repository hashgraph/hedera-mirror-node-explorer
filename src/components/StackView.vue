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
  <render/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {h, useSlots, VNode} from "vue";

const props = defineProps({
  visibleIndex: {
    type: Number,
    default: 0
  }
})

const slots = useSlots()
const render = () => {
  const childNodes: VNode[] = []
  if (slots.default) {
    let i = 0
    for (const c of slots.default()) {
      const visibility = i == props.visibleIndex ? 'inherit' : 'hidden'
      const style = "visibility: " + visibility + "; grid-area: 1 / 1 / 2 / 2"
      childNodes.push(h('div', {'style': style}, c))
      i += 1
    }
  }
  return h('div', {'class': 'stack-view'}, childNodes)
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.stack-view {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  justify-items: stretch;
  place-items: stretch;
  width: 100%
}

</style>
