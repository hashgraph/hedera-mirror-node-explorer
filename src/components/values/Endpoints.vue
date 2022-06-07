<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

  <div v-if="endpoints && endpoints.length">
    <div v-for="s in endpoints" :key="s.ip_address_v4">
      <span v-if="s.ip_address_v4">{{ s.ip_address_v4 }}</span>
      <span v-if="s.ip_address_v4 && s.port != null" class="has-text-grey h-is-smaller">{{ ':' + s.port }}</span>
    </div>
  </div>

  <span v-else-if="initialLoading"/>

  <span v-else class="has-text-grey">None</span>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import {ServiceEndPoint} from "@/schemas/HederaSchemas";

export default defineComponent({
  name: 'Endpoints',

  props: {
    endpoints: Object as PropType<Array<ServiceEndPoint>|undefined>,
  },

  setup() {
    const initialLoading = inject(initialLoadingKey, ref(false))
    return {initialLoading}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>