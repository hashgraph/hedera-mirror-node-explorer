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

  <div>
    <Copyable
        :content-to-copy="props.id ?? ''"
        :enable-copy="props.enableCopy"
    >
      <template #content>
        <span style="font-weight: bold">{{ props.id ?? "" }}</span>
      </template>
    </Copyable>
    <span v-if="props.checksum" class="has-text-grey">-{{ props.checksum }}</span>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";
import Copyable from "@/elements/Copyable.vue";

const props = defineProps({
  id: {
    type: String as PropType<string | null>,
    default: null
  },
  checksum: {
    type: String as PropType<string | null>,
    default: null
  },
  enableCopy: {
    type: Boolean,
    default: true
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
