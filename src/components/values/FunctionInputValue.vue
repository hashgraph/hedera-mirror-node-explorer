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
      <table class="has-text-grey h-is-text-size-3">
        <tbody>
          <template v-for="kv in parameters" :key="kv">
            <tr>
              <td>{{ kv[0] }}</td>
              <td style="padding-left: 10px">{{ kv[1] }}</td>
            </tr>
          </template>
        </tbody>
      </table>
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
import {ethers} from "ethers";

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

    const transactionDescription = ref<ethers.utils.TransactionDescription|null>(null)
    const updateTransactionDescription = () => {
      if (systemContractEntry.value !== null && props.byteString) {
        systemContractEntry.value?.parseTransaction(props.byteString)
            .then((td: ethers.utils.TransactionDescription|null) => {
              transactionDescription.value = td
            })
            .catch(() => { transactionDescription.value = null })
      } else {
        transactionDescription.value = null
      }
    }
    watch([systemContractEntry, () => props.byteString], () => updateTransactionDescription())
    onMounted(() => updateTransactionDescription())

    const signature = computed(() => {
      return transactionDescription.value?.signature ?? null
    })

    const parameters = computed(() => {
      const result: [string,string][] = []
      const args = transactionDescription.value?.args as Array<unknown> ?? []
      const inputs = transactionDescription.value?.functionFragment.inputs as Array<ethers.utils.ParamType>?? []
      for (let i = 0; i < args.length; i += 1) {
        const key = i < inputs.length ? inputs[i].name : "?"
        const value = JSON.stringify(args[i])
        result.push([key, value])
      }
      return result
    })

    const initialLoading = inject(initialLoadingKey, ref(false))
    return {
      signature,
      parameters,
      initialLoading
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>