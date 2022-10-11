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
  <div v-if="signature">
    <HexaValue :byte-string="signature" show-none/>
    <div v-if="signatureInfo" class="h-is-extra-text h-is-text-size-3">{{ signatureInfo }}</div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else class="has-text-grey">None</div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, PropType, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import HexaValue from "@/components/values/HexaValue.vue";
import {ContractAction} from "@/schemas/HederaSchemas";
import {SignatureAnalyzer} from "@/utils/SignatureAnalyzer";

export default defineComponent({
  name: "SignatureValue",
  components: {HexaValue},
  props: {
    action: Object as PropType<ContractAction|undefined>
  },

  setup(props) {

    const signatureAnalyzer = new SignatureAnalyzer(computed(() => props.action ?? null))
    onMounted(() => signatureAnalyzer.mount())
    onBeforeUnmount(() => signatureAnalyzer.unmount())
    const initialLoading = inject(initialLoadingKey, ref(false))

    return {
      signature: signatureAnalyzer.functionHash,
      signatureInfo: signatureAnalyzer.signature,
      initialLoading
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
