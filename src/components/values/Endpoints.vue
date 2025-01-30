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

  <div v-if="props.endpoints && props.endpoints.length">
    <div v-for="s in props.endpoints" :key="s.ip_address_v4" class="h-is-monospace">
      <span v-if="s.ip_address_v4">{{ s.ip_address_v4 }}</span>
      <span v-if="s.ip_address_v4 && s.port != null" class="has-text-grey">{{ ':' + s.port }}</span>
    </div>
  </div>

  <span v-else-if="initialLoading"/>

  <span v-else class="has-text-grey">None</span>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import {ServiceEndPoint} from "@/schemas/MirrorNodeSchemas";

const props = defineProps({
  endpoints: Object as PropType<Array<ServiceEndPoint> | undefined>,
})

const initialLoading = inject(initialLoadingKey, ref(false))

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
