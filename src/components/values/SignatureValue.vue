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
    <div v-if="signatureInfo" class="h-is-extra-text h-is-text-size-3">{{ signatureInfo.text_signature }}</div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else class="has-text-grey">None</div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from "vue";
import {byteToHex, hexToByte} from "@/utils/B64Utils";
import {SignatureCollector} from "@/utils/SignatureCollector";
import {initialLoadingKey} from "@/AppKeys";
import HexaValue from "@/components/values/HexaValue.vue";

export default defineComponent({
  name: "SignatureValue",
  components: {HexaValue},
  props: {
    input: String
  },

  setup(props) {

    const signature = computed(() => {
      let result: string|null
      if (props.input) {
        const bytes = hexToByte(props.input)?.slice(0, 4)
        result = bytes ? "0x" + byteToHex(bytes) : null
      } else {
        result = null
      }
      return result
    })

    const signature4 = computed(() => signature.value && signature.value.length >= 6 ? signature.value : null )

    const signatureResponse = SignatureCollector.instance.ref(signature4)

    const signatureInfo = computed(() => {
      const results = signatureResponse.value?.results
      return results && results.length >= 1 ? results[0] : null
    })

    const initialLoading = inject(initialLoadingKey, ref(false))

    return { signature, signatureInfo, initialLoading }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
