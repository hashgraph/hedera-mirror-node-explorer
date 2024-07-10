!--
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
  <span>
    <span class="is-numeric">{{ transactionText }}</span>
    <span v-if="errorFlagVisible" class="icon has-text-danger">
      <i class="fas fa-exclamation-triangle"></i>
    </span>
  </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent} from "vue";
import {TransactionID} from "@/utils/TransactionID";
import {isSuccessfulResult} from "@/utils/TransactionTools";

export default defineComponent({
  name: "TransactionLabel",

  props: {
    transactionId: String,
    result: String
  },

  setup(props) {
    const transactionText = computed(() => {
      return props.transactionId ? TransactionID.normalize(props.transactionId) : ""
    })

    const errorFlagVisible = computed(() => {
      return props.result && !isSuccessfulResult(props.result)
    })

    return {transactionText, errorFlagVisible}
  }

})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
