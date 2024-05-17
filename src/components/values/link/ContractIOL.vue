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

  <EntityIOL :entityId="contractId" :label="label"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import {LabelByIdCache} from "@/utils/cache/LabelByIdCache";
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

    const labelLookup = LabelByIdCache.instance.makeLookup(computed(() => props.contractId))
    onMounted(
        () => labelLookup.mount()
    )
    onBeforeUnmount(
        () => labelLookup.unmount()
    )
    return {
      label: nameQuery.name
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
