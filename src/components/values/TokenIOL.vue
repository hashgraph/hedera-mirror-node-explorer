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

  <EntityIOL :entityId="tokenId" :label="label"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import EntityIOL from "@/components/values/EntityIOL.vue";
import {LabelByIdCache} from "@/utils/cache/LabelByIdCache";
import TokenExtra from "@/components/values/TokenExtra.vue";

export default defineComponent({
  name: "TokenIOL",
  components: {EntityIOL, TokenExtra},
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

<style/>
