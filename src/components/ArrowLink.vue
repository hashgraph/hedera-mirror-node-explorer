<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <router-link :to="props.route">
    <div class="arrow-link">
      <span class="link-text">{{ props.text }}</span>
      <ArrowRight :size="16"/>
    </div>
  </router-link>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";
import {ArrowRight} from "lucide-vue-next";
import {RouteLocationRaw} from "vue-router";

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  route: {
    type: Object as PropType<RouteLocationRaw>,
    required: true
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.arrow-link {
  align-items: center;
  color: var(--icon-default-color);
  display: flex;
  gap: 2px;
  height: 18px;
  justify-content: center;
}

span.link-text {
  font-family: "Styrene A Web", sans-serif;
  font-size: 14px;
  font-weight: 400;
}

</style>
