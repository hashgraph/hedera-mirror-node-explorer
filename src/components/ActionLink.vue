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
  <span class="is-inline-flex is-align-items-center">
    <a @click="$emit('action')" :class="{'pointer-events-none': actionDisabled}">{{ title }}</a>
    <span v-if="running" class="loader is-inline-block ml-2"/>
  </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent} from "vue";

export default defineComponent({
  name: "ActionLink",
  props: {
    title: {
      type: String,
      default: "Action"
    },
    enabled: {
      type: Boolean,
      default: true
    },
    running: {
      type: Boolean,
      default: false
    }
  },
  emits: ['action'],
  setup(props) {

    const actionDisabled = computed(() => {
      return props.running || !props.enabled
    })

    return { actionDisabled }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

a.pointer-events-none {
  pointer-events: none
}
</style>
