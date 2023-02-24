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
  <div class="should-wrap">

    <EVMAddress :address="hexValue" :show-id="false"/>

  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent} from "vue";
import {base32ToAlias, byteToHex} from "@/utils/B64Utils";
import EVMAddress from "@/components/values/EVMAddress.vue";

export default defineComponent( {
  name: "AliasValue",
  components: {EVMAddress},
  props: {
    aliasValue: String,
  },
  setup(props) {
    const hexValue = computed(() => {
      let result
      if (props.aliasValue) {
        const alias = base32ToAlias(props.aliasValue)
        result = alias ? "0x" + byteToHex(alias) : null
      } else {
        result = null
      }
      return result
    })
    return {
      hexValue
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>


</style>
