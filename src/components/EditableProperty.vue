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

  <Property :id="id" :full-width="fullWidth" :custom-nb-col-class="customNbColClass" :tooltip="tooltip">
    <template #name>
      <slot name="name"/>
    </template>
    <template #value>
      <div class="is-flex is-align-items-center">
        <slot name="value"/>
        <img v-if="editable" alt="Edit" class="ml-2"
             @click="onEdit"
             src="@/assets/pencil.svg"
        >
      </div>
    </template>
  </Property>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import Property from "@/components/Property.vue";

defineProps({
  id: String,
  fullWidth: {
    type: Boolean,
    default: false
  },
  customNbColClass: String,
  tooltip: String,
  editable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['edit'])

const onEdit = () => emit('edit')

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
</style>