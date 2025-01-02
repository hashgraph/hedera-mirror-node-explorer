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

  <div class="is-flex is-align-items-baseline">

    <div v-if="dialogSuccessVisible" class="icon is-medium has-text-success ml-0">
      <i class="fas fa-check"/>
    </div>
    <div v-else-if="dialogErrorVisible" class="icon is-medium has-text-danger">
      <span style="font-size: 18px; font-weight: 900">X</span>
    </div>
    <div v-else/>

    <div class="block h-is-tertiary-text mt-2">
      <slot name="mainMessage"/>
    </div>
  </div>

  <div class="h-is-property-text my-4">
    <slot name="extraMessage"/>
  </div>

</template>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from "vue";
import {DialogController, DialogMode} from "@/dialogs/core/DialogController.ts";

const props = defineProps({
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
  isSuccess: {
    type: Boolean as PropType<boolean | undefined>,
    default: undefined
  }
})

const dialogSuccessVisible = computed(
    () => props.isSuccess !== undefined
        ? props.isSuccess
        : props.controller.mode.value === DialogMode.Success)
const dialogErrorVisible = computed(
    () => props.isSuccess !== undefined
        ? !props.isSuccess
        : props.controller.mode.value === DialogMode.Error)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
