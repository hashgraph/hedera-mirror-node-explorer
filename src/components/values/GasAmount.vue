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
  <PlainAmount :amount="gas" none-label="None"/>
  <span v-if="amount" class="h-is-extra-text ml-2">
    <HbarAmount :amount="amount"/>
  </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";

export default defineComponent({
  name: "GasAmount",
  components: {HbarAmount, PlainAmount},

  props: {
    gas: {
      type: Number as PropType<number | null>,
      default: null
    },
    price: {
      type: Number as PropType<number | null>,
      default: null
    },
  },

  setup(props) {
    const amount = computed(() =>
        props.gas !== null && props.price !== null ? props.gas * props.price : null
    )
    return {
      amount
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

