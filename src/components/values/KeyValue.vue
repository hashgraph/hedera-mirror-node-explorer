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
  <template v-if="isComplexKey">
    <ComplexKeyValue :account-id="accountId" :details="details" :key-bytes="keyBytes" :show-none="showNone"/>
  </template>
  <template v-else>
    <div v-if="details" class="h-is-property-text">
      <span class="h-is-extra-text">{{ keyType }}</span>
      <span class="is-family-monospace has-text-grey">{{ ':&#8239;' + keyBytes }}</span>
    </div>
    <div v-else>
      <HexaDumpValue :byte-string="keyBytes" :none-extra="noneExtra" :show-none="showNone"/>
      <div v-if="keyBytes" class="h-is-extra-text">{{ keyType }}</div>
    </div>
  </template>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import HexaDumpValue from "@/components/values/HexaDumpValue.vue";
import ComplexKeyValue from "@/components/values/ComplexKeyValue.vue";

export default defineComponent({
  name: "KeyValue",
  components: {ComplexKeyValue, HexaDumpValue},
  props: {
    keyBytes: {
      type: String as PropType<string | null>,
      default: null
    },
    keyType: {
      type: String as PropType<string | null>,
      default: null
    },
    accountId: {
      type: String as PropType<string | null>,
      default: null
    },
    details: {
      type: Boolean,
      default: false
    },
    showNone: {
      type: Boolean,
      default: false
    },
    noneExtra: String
  },
  setup(props) {

    const isComplexKey = computed(() => props.keyType == "ProtobufEncoded")
    return {
      isComplexKey,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>


</style>
