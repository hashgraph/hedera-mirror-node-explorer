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
  <div class="is-flex is-align-items-center" style="margin-right: 8px">
    <Datepicker v-model="date" @closed="handleClosed" @cleared="handleCleared"/>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onMounted, PropType, ref} from "vue";
import {TableController} from "@/utils/table/TableController";
import Datepicker from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { TransactionTableControllerXL } from "@/components/transaction/TransactionTableControllerXL";

export default defineComponent({
  name: "DateTimePicker",

  components: {
    Datepicker
  },

  props: {
    controller: Object as PropType<TransactionTableControllerXL>
  },

  setup(props) {
    const userRequestedStop = ref(false)
    const date = ref()
    onMounted(() => userRequestedStop.value = false)
    const handleClosed = () => {
      if (props.controller) {
        const controller = props.controller
        const timestamp = (date.value as Date).getTime() / 1000
        controller.onKeyChange(timestamp.toString())
      } else {
        console.log("Ignoring click because props.controller is undefined")
      }
    }
    const handleCleared = () => {
      if (props.controller) {
        const controller = props.controller
        controller.startAutoRefresh()
      } else {
        console.log("Ignoring click because props.controller is undefined")
      }
    }


    return {
      handleClosed,
      handleCleared,
      date
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>