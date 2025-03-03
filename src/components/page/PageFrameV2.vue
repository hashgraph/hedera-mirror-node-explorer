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
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>

  <div class="page-frame">
    <PageHeader :page-title="props.pageTitle"/>

    <div v-if="slots.banner">
      <slot name="banner"/>
    </div>

    <div class="h-page-content">
      <slot/>
    </div>

    <Footer/>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import Footer from "@/components/page/Footer.vue";
import PageHeader from "@/components/page/header/PageHeader.vue";
import {PropType, useSlots} from "vue";

const props = defineProps({
  pageTitle: {
    type: String,
    required: true,
  },
  notification: {
    type: String as PropType<string | null>,
    default: null,
  }
})

const slots = useSlots()

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.page-frame {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

</style>
