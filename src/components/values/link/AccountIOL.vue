// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <EntityIOL
    :entity-id="accountId"
    :label="label"
    :null-label="nullLabel"
  />
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import EntityIOL from "@/components/values/link/EntityIOL.vue";
import {NameQuery} from "@/utils/name_service/NameQuery";
import {NetworkCache} from "@/utils/cache/NetworkCache";

export default defineComponent({
  name: "AccountIOL",
  components: {EntityIOL},
  props: {
    accountId: {
      type: String as PropType<string | null>,
      default: null
    },
    nullLabel: {
      type: String,
      default: null
    }
  },
  setup(props) {

    const nameQuery = new NameQuery(computed(() => props.accountId))
    onMounted(() => nameQuery.mount())
    onBeforeUnmount(() => nameQuery.unmount())

    const networkLookup = NetworkCache.instance.makeLookup()
    onMounted(
        () => networkLookup.mount()
    )
    onBeforeUnmount(
        () => networkLookup.unmount()
    )

    return {
      label: nameQuery.name,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style />
