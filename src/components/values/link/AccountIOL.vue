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

  <EntityIOL :entityId="accountId" :label="label" :null-label="nullLabel"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import EntityIOL from "@/components/values/link/EntityIOL.vue";
import {NetworkCache} from "@/utils/cache/NetworkCache";
import {NamingStore} from "@/utils/name_service/NamingStore";

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

    const domainName = computed(() => {
      return props.accountId ? NamingStore.instance.lookup(props.accountId) : null
    })

    const networkLookup = NetworkCache.instance.makeLookup()
    onMounted(
        () => networkLookup.mount()
    )
    onBeforeUnmount(
        () => networkLookup.unmount()
    )

    return {
      label: domainName,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
