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
  <o-select
      v-bind:model-value="selected"
      @update:model-value="onSelect($event)"
      class="h-is-text-size-2"
      data-cy="select-page-size"
  >
    <!--        Use "as number" to avoid warning as o-select does not allow to force type-->
    <option :value="5 as number">5 per page</option>
    <option :value="10 as number">10 per page</option>
    <option :value="15 as number">15 per page</option>
    <option :value="20 as number">20 per page</option>
    <option :value="50 as number">50 per page</option>
    <option :value="100 as number">100 per page</option>
  </o-select>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onMounted, PropType, ref, watch} from "vue";
import {AppStorage} from "@/AppStorage";


export default defineComponent({
  name: "TablePageSize",

  props: {
    size: {
      type: Number,
      required: true
    },
    storageKey: {
      type: String as PropType<string | null>,
      default: null
    }
  },
  emits: ["update:size"],

  setup(props, context) {
    const defaultValue = props.size
    const selected = ref(props.size)
    watch(() => props.size, () => selected.value = props.size)
    onMounted(() => {
      const preferred = props.storageKey ? AppStorage.getTablePageSize(props.storageKey) : null
      if (preferred) {
        selected.value = preferred
        context.emit("update:size", preferred)
      }
    })
    const onSelect = (value: number) => {
      selected.value = value
      if (props.storageKey !== null) {
        if (value != defaultValue) {
          AppStorage.setTablePageSize(props.storageKey, value)
        } else {
          AppStorage.setTablePageSize(props.storageKey, null)
        }
      }
      context.emit("update:size", value)
    }
    return {
      selected,
      onSelect
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>