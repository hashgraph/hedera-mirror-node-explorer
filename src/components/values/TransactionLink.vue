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

  <div v-if="transactionId">
    <router-link :to="{name: 'TransactionDetails', params: {transactionId: transactionId}}">
      <span class="is-numeric should-wrap">{{ normalizedId }}</span>
    </router-link>
  </div>

  <span v-else-if="showNone" class="has-text-grey">None</span>

  <span v-else/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {TransactionID} from "@/utils/TransactionID";

export default defineComponent({
  name: "TransactionLink",

  props: {
    transactionId: String as PropType<string|null>,
    showNone: {
      type: Boolean,
      default: true
    },
  },

  setup(props) {
    const normalizedId = computed(() => TransactionID.normalize(props.transactionId ?? "?"))
    return { normalizedId }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

