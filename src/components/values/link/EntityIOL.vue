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

  <div class="is-inline-block">

    <template v-if="label !== null">
      <span :class="{'h-is-label':!compact, 'h-is-compact-label':compact}" class="is-inline-block">
        {{ label }}
      </span>
    </template>

    <template v-else-if="entityId !== null">
      <span class="is-numeric">
        {{ entityId ?? "" }}
      </span>
    </template>

    <template v-else-if="!initialLoading">
      <span>{{ nullLabel ?? "None" }}</span>
    </template>

    <template v-else>
      <!-- Nothing because entityId is null and (showNone=false or initialLoading is true) -->
    </template>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import {computed, defineComponent, inject, PropType, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";

export const DEFAULT_LABEL_SIZE = 18

export default defineComponent({

  name: "EntityIOL",

  props: {
    entityId: {
      type: String as PropType<string | null>,
      default: null
    },
    label: {
      type: String as PropType<string | null>,
      default: null
    },
    slice: {
      type: Number as PropType<number | null>,
      default: DEFAULT_LABEL_SIZE
    },
    compact: {
      type: Boolean,
      default: true
    },
    nullLabel: {
      type: String,
      default: null
    },
  },

  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))

    const label = computed(() => {
      let result = props.label
      if (result != null
          && props.slice != null
          && props.slice > 0
          && props.slice < result.length) {
        result = result.slice(0, props.slice) + '…'
      }
      return result
    })

    return {
      initialLoading,
      label,
    }
  }

})
</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
