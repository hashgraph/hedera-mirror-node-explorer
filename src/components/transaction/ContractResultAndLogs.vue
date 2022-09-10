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

  <div>

    <DashboardCard v-if="contractResult" class="h-card">
      <template v-slot:title>
        <span v-if="topLevel"  class="h-is-primary-title">
          Contract Result for {{ contractResult?.contract_id }} at {{ contractResult?.timestamp }}
        </span>
        <span v-else class="h-is-secondary-title">Contract Result</span>
      </template>

      <template v-slot:leftContent>
        <Property id="result">
          <template v-slot:name>Result</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.result"/>
          </template>
        </Property>
        <Property id="from">
          <template v-slot:name>From</template>
          <template v-slot:value>
            <HexaValue :byte-string="contractResult?.from" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="to">
          <template v-slot:name>To</template>
          <template v-slot:value>
            <HexaValue :byte-string="contractResult?.to" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="type">
          <template v-slot:name>Type</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.type?.toString()"/>
          </template>
        </Property>
        <Property id="errorMessage">
          <template v-slot:name>Error Message</template>
          <template v-slot:value>
            <HexaValue :byte-string ="contractResult?.error_message" v-bind:show-none="true"/>
          </template>
        </Property>
      </template>

      <template v-slot:rightContent>
        <Property id="gasLimit">
          <template v-slot:name>Gas Limit</template>
          <template v-slot:value>
            <PlainAmount :amount="contractResult?.gas_limit"/>
          </template>
        </Property>
        <Property id="gasUsed">
          <template v-slot:name>Gas Used</template>
          <template v-slot:value>
            <PlainAmount :amount="contractResult?.gas_used"/>
          </template>
        </Property>
        <Property id="maxFeePerGas">
          <template v-slot:name>Max Fee Per Gas</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.max_fee_per_gas"/>
          </template>
        </Property>
        <Property id="maxPriorityFeePerGas">
          <template v-slot:name>Max Priority Fee Per Gas</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.max_priority_fee_per_gas"/>
          </template>
        </Property>
        <Property id="gasPrice">
          <template v-slot:name>Gas Price</template>
          <template v-slot:value>
            <HbarAmount :amount="contractResult?.gas_price ?? 0" :show-extra="true"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

    <DashboardCard v-if="contractResult?.logs?.length" class="h-card">
      <template v-slot:title>
        <span class="h-is-secondary-title">Logs</span>
      </template>

      <template v-slot:control v-if="contractResult?.logs.length > 2">
        <div class="is-flex is-justify-content-flex-end is-align-items-baseline">
          <o-field>
            <o-select v-model="nbLogLines" class="h-is-text-size-1">
              <option v-for="n in Math.min(MAX_LOG_LINES, Math.ceil(contractResult?.logs?.length / 2))" :key="n" :value="n">
                {{ (n === Math.ceil(contractResult?.logs?.length / 2)) ? 'Show all' : 'Show ' + n + (n === 1 ? ' line' :' lines') }}
              </option>
            </o-select>
          </o-field>
          <button id="prev-block-button" :disabled="logCursor===0"
                  class="button is-white is-small ml-4" @click="logCursor -= 1">&lt; PREVIOUS
          </button>
          <button id="next-block-button" :disabled="logCursor >= contractResult?.logs.length - 2 * nbLogLines"
                  class="button is-white is-small ml-4" @click="logCursor += 1">NEXT &gt;
          </button>
        </div>
      </template>

      <template v-slot:leftContent>

        <template v-for="l in nbLogLines" :key="l">
          <ContractResultLog :log="contractResult?.logs[logCursor + l - 1]"/>
          <hr v-if="l < nbLogLines" class="h-card-separator" style="height: 1px; background: grey"/>
        </template>

      </template>

      <template v-slot:rightContent>

        <template v-for="l in nbLogLines" :key="l">
          <ContractResultLog v-if="logCursor + nbLogLines + l - 1 < contractResult?.logs.length"
                             :log="contractResult?.logs[logCursor + nbLogLines + l - 1]"/>
          <hr v-if="logCursor + nbLogLines + l - 1 < contractResult?.logs.length - 1 && l < nbLogLines"
              class="h-card-separator" style="height: 1px; background: grey"/>
        </template>

      </template>

    </DashboardCard>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, ref, watch} from 'vue';
import {ContractResultDetailsLoader} from "@/components/contract/ContractResultDetailsLoader";
import HexaValue from "@/components/values/HexaValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StringValue from "@/components/values/StringValue.vue";
import Property from "@/components/Property.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import ContractResultLog from "@/components/contract/ContractResultLog.vue";

const NB_LOG_LINES = 2
const MAX_LOG_LINES = 10

export default defineComponent({

  name: 'ContractResultAndLogs',

  components: {
    ContractResultLog,
    PlainAmount,
    Property,
    HbarAmount,
    DashboardCard,
    HexaValue,
    StringValue
  },

  props: {
    contractId: String,
    timestamp: String,
    transactionIdOrHash: String,
    topLevel: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const logCursor = ref(0)
    const nbLogLines = ref(NB_LOG_LINES)
    watch(nbLogLines, () => logCursor.value = 0)

    const contractResultDetailsLoader = new ContractResultDetailsLoader(
        computed(() => props.contractId ?? null),
        computed(() => props.timestamp ?? null),
        computed(() => props.transactionIdOrHash ?? null))
    onMounted(() => contractResultDetailsLoader.requestLoad())

    watch(contractResultDetailsLoader.entity, () => {
      const nbLinesForAll = Math.ceil(contractResultDetailsLoader.entity.value?.logs?.length ?? 0 / 2)
      nbLogLines.value = Math.min(nbLogLines.value, nbLinesForAll)
    })

    return {
      NB_LOG_LINES,
      MAX_LOG_LINES,
      isSmallScreen,
      isTouchDevice,
      logCursor,
      nbLogLines,
      contractResult: contractResultDetailsLoader.entity
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.columns button{
  vertical-align: initial;
}
.button.is-small {
  font-size: 0.65rem;
}

</style>