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

  <div v-if="nonNullValue" id="bytecode">
    <HexaDumpValue :byte-string="textValue" :copyable="false"/>
  </div>

  <span v-else-if="initialLoading"/>

  <span v-else class="has-text-grey">None</span>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref, watch} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import HexaDumpValue from "@/components/values/HexaDumpValue.vue";

export default defineComponent({
  name: 'ByteCodeValue',
  components: {HexaDumpValue},

  props: {
    byteCode: String,
  },

  setup(props) {
    const textValue = ref(props.byteCode)
    watch(() => props.byteCode, () => {
      textValue.value = props.byteCode
    })
    const nonNullValue = computed(() => props.byteCode != undefined && props.byteCode != '0x')
    const initialLoading = inject(initialLoadingKey, ref(false))
    return {
      textValue,
      nonNullValue,
      initialLoading
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>