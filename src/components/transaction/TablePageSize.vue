// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <SelectView
    :model-value="selected"
    :small="true"
    data-cy="select-page-size"
    @update:model-value="onSelect($event)"
  >
    <!--        Use "as number" to avoid warning as o-select does not allow to force type-->
    <option :value="5 as number">
      5 per page
    </option>
    <option :value="10 as number">
      10 per page
    </option>
    <option :value="15 as number">
      15 per page
    </option>
    <option :value="20 as number">
      20 per page
    </option>
    <option :value="50 as number">
      50 per page
    </option>
    <option :value="100 as number">
      100 per page
    </option>
  </SelectView>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onMounted, PropType, ref, watch} from "vue";
import {AppStorage} from "@/AppStorage";
import SelectView from "@/elements/SelectView.vue";


export default defineComponent({
  name: "TablePageSize",
  components: {SelectView},

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

<style />
