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

<!--Documentation for vue-datepicker: https://vue3datepicker.com-->

<template>
  <div class="date-picker">
    <Datepicker
        v-model="date"
        placeholder="SELECT A DATE"
        :is-24="false"
        time-picker-inline
        :dark="darkSelected"
        @closed="handleClosed"
        @cleared="emit('dateCleared')"
    />
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType, ref} from "vue";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";
import {ThemeController} from "@/components/ThemeController.ts";

const props = defineProps({
  controller: Object as PropType<TransactionTableControllerXL>
})

const emit = defineEmits(["dateCleared"])

const darkSelected = ThemeController.inject().darkSelected
const date = ref(new Date())
const handleClosed = () => {
  if (props.controller) {
    const controller = props.controller
    // + 60 to account for when users select for a transaction executed
    //  the minute they selected
    const timestamp = (date.value as Date).getTime() / 1000 + 60
    controller.onKeyChange(timestamp.toString())
  } else {
    console.log("Ignoring click because props.controller is undefined")
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

div.date-picker {
  align-items: center;
  display: flex;
}

</style>
