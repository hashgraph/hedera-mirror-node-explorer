// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <EntityIOL
    :entity-id="contractId"
    :label="label"
  />
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import {NameQuery} from "@/utils/name_service/NameQuery";
import EntityIOL from "@/components/values/link/EntityIOL.vue";

export default defineComponent({
  name: "ContractIOL",
  components: {EntityIOL},
  props: {
    contractId: {
      type: String as PropType<string | null>,
      default: null
    },
  },
  setup(props) {

    const nameQuery = new NameQuery(computed(() => props.contractId))
    onMounted(() => nameQuery.mount())
    onBeforeUnmount(() => nameQuery.unmount())

    return {
      label: nameQuery.name
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style />
