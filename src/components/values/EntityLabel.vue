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
  <div v-if="label"
       :class="{'h-is-label':!compact, 'h-is-compact-label':compact}"
       class="is-inline-block">
    <slot/>
    <span>
      {{ label }}
    </span>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import {LabelByIdCache} from "@/utils/cache/LabelByIdCache";

export const MAX_LABEL_SIZE = 35

export default defineComponent({
  name: "EntityLabel",

  components: {},

  props: {
    id: {
      type: String as PropType<string | null>,
      default: null
    },
    slice: {
      type: Number as PropType<number | null>,
      default: MAX_LABEL_SIZE
    },
    compact: {
      type: Boolean,
      default: false
    },
  },

  setup(props) {
    const id = computed(() => props.id)

    const labelLookup = LabelByIdCache.instance.makeLookup(id)
    onMounted(() =>labelLookup.mount())
    onBeforeUnmount(() => labelLookup.unmount())

    const slice = computed(() => props.compact ? 12 : props.slice)
    const label = computed(() => {
      let result = labelLookup.entity.value
      if (result != null
          && slice.value != null
          && slice.value > 0
          && slice.value < result.length) {
        result = result.slice(0, slice.value) + '…'
      }
      return result
    })

    return {
      label,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
