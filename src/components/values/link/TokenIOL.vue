// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <EntityIOL
    :entity-id="tokenId"
    :label="label"
  />
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import EntityIOL from "@/components/values/link/EntityIOL.vue";
import {LabelByIdCache} from "@/utils/cache/LabelByIdCache";

export default defineComponent({
  name: "TokenIOL",
  components: {EntityIOL},
  props: {
    tokenId: {
      type: String as PropType<string | null>,
      default: null
    },
  },
  setup(props) {
    const labelLookup = LabelByIdCache.instance.makeLookup(computed(() => props.tokenId))
    onMounted(() => labelLookup.mount())
    onBeforeUnmount(() => labelLookup.unmount())
    return {
      label: labelLookup.entity
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style />
