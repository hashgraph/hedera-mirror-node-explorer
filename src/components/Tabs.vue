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
<!--                                                     TEMPLATE                                                 -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
    <div  class="is-flex is-justify-content-space-between is-align-items-center mt-5 mb-4">
        <div class="tabs is-toggle h-is-property-text mb-1" >
            <ul>
                <li v-for="(tab, i) in tabs" :key="i" :class="{'is-active':selectedTab===i}">
                    <a :id="cssId + '-' + i" :style="{ fontWeight: selectedTab===i?500:300 }"
                       @click="handleSelect(i)">
                        <span>{{ tab }}</span>
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType, ref} from "vue";

export default defineComponent({
  name: "Tabs",

  props: {
      selectedTab: {
          type: Number,
          required: true
      },
      tabs: {
          type: Array as PropType<string[]>,
          required: true
      },
      cssId: {
          type: String,
          default: 'tab'
      }
  },

  emits: ["update:selectedTab"],

  setup(props, context) {

      const selection = ref(props.selectedTab)

      const handleSelect = (tab: number) => {
          selection.value = tab
          context.emit('update:selectedTab', tab)
      }

    return {
        selection,
        handleSelect,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>