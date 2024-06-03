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
  <span class="h-is-text-size-3 has-text-grey ml-3">
    <a v-if="providerHomeURL" :href="providerHomeURL" target="_blank">
      {{ providerDisplayName }}
    </a>
    <span v-else>
      {{ providerDisplayName }}
    </span>
  </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent} from "vue";
import {NameService} from "@/utils/name_service/NameService";
import {NameServiceProvider} from "@/utils/name_service/provider/NameServiceProvider"

export default defineComponent({
  name: "NameServiceProviderLabel",
  components: {},
  props: {
    providerAlias: {
      type: String,
      required: true
    },
  },
  setup(props) {
    const provider = computed<NameServiceProvider|null>(
        () => NameService.instance.lookupProvider(props.providerAlias) ?? null)
    const providerDisplayName = computed(
        () => provider.value?.providerDisplayName ?? props.providerAlias)
    const providerHomeURL = computed(
        () => provider.value?.providerHomeURL ?? null)

    return {
      providerDisplayName,
      providerHomeURL,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
