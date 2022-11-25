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

  <div v-if="byteString">
    <HexaValue :byte-string="byteString"/>
    <div v-if="signature">
      <div class="has-text-grey h-is-text-size-3">{{ signature }}</div>
    </div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else>
    <div class="has-text-grey">None</div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, ref, watch} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";
import HexaValue from "@/components/values/HexaValue.vue";

export default defineComponent({
  name: 'FunctionInputValue',
  components: {HexaValue},
  props: {
    byteString: String,
    contractId: String,
  },

  setup(props) {

    const systemContractEntry = computed(() => {
      return props.contractId ? systemContractRegistry.lookup(props.contractId) : null
    })

    const signature = ref<string|null>(null)
    const updateSignature = () => {
      if (systemContractEntry.value !== null && props.byteString) {
        systemContractEntry.value?.getSignature(props.byteString)
            .then((s: string|null) => {
              signature.value = s
            })
            .catch(() => { signature.value = null })
      } else {
        signature.value = null
      }
    }
    watch([systemContractEntry, () => props.byteString], () => updateSignature())
    onMounted(() => updateSignature())

    const initialLoading = inject(initialLoadingKey, ref(false))
    return {
      signature,
      initialLoading
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>