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

  <template v-if="contractResult">

    <DashboardCard class="h-card" collapsible-key="contractResult">
      <template v-slot:title>
        <span v-if="props.topLevel" class="h-is-primary-title">
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
        <Property id="evm-hash">
          <template v-slot:name>EVM Transaction Hash</template>
          <template v-slot:value>
            <HexaValue v-bind:byteString="contractResult?.hash" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="from">
          <template v-slot:name>From</template>
          <template v-slot:value>
            <EVMAddress :address="contractResult?.from" :id="fromId ?? undefined"
                        :compact="isSmallScreen && !isMediumScreen"/>
          </template>
        </Property>
        <Property id="to">
          <template v-slot:name>To</template>
          <template v-slot:value>
            <EVMAddress :address="contractResult?.to ?? undefined" :id="toId ?? undefined"
                        :compact="isSmallScreen && !isMediumScreen"/>
          </template>
        </Property>

        <FunctionInput :analyzer="analyzer"/>
        <FunctionResult :analyzer="analyzer"/>
        <FunctionError :analyzer="analyzer"/>
      </template>

      <template v-slot:rightContent>
        <Property v-if="contractType" id="type">
          <template v-slot:name>Type</template>
          <template v-slot:value>
            <StringValue :string-value="contractType"/>
          </template>
        </Property>
        <Property id="gasLimit">
          <template v-slot:name>Gas Limit</template>
          <template v-slot:value>
            <GasAmount
                :gas="contractResult?.gas_limit"
                :price="displayedPrice"
            />
          </template>
        </Property>
        <Property id="gasUsed">
          <template v-slot:name>Gas Used</template>
          <template v-slot:value>
            <GasAmount
                :gas="contractResult?.gas_used"
                :price="displayedPrice"
            />
          </template>
        </Property>
        <Property id="gasConsumed">
          <template v-slot:name>Gas Consumed</template>
          <template v-slot:value>
            <GasAmount
                :gas="contractResult?.gas_consumed"
                :price="displayedPrice"
            />
          </template>
        </Property>
        <Property v-if="contractType==='Post-Eip1559'" id="maxFeePerGas">
          <template v-slot:name>Max Fee Per Gas</template>
          <template v-slot:value>
            <HbarAmount :amount="maxFeePerGas"/>
            <span v-if="maxFeePerGas"
                  class="h-is-extra-text is-numeric h-is-smaller ml-1">{{ ` ${maxFeePerGas * 10} gWei` }}</span>
          </template>
        </Property>
        <Property v-if="contractType==='Post-Eip1559'" id="maxPriorityFeePerGas">
          <template v-slot:name>Max Priority Fee Per Gas</template>
          <template v-slot:value>
            <HbarAmount :amount="maxPriorityFeePerGas"/>
            <span v-if="maxPriorityFeePerGas"
                  class="h-is-extra-text is-numeric h-is-smaller ml-1">{{ ` ${maxPriorityFeePerGas * 10} gWei` }}</span>
          </template>
        </Property>
        <Property v-if="contractType==='Pre-Eip1559' || contractType === null" id="gasPrice">
          <template v-slot:name>Gas Price</template>
          <template v-slot:value>
            <HbarAmount :amount="gasPrice"/>
            <span v-if="gasPrice"
                  class="h-is-extra-text is-numeric h-is-smaller ml-1">{{ ` ${gasPrice * 10} gWei` }}</span>
          </template>
        </Property>
        <Property id="ethereumNonce">
          <template v-slot:name>Ethereum Nonce</template>
          <template v-slot:value>
            <PlainAmount :amount="ethereumNonce" none-label="None"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

    <ContractResultTrace v-if="props.isParent" :transaction-id-or-hash="contractResult?.hash ?? undefined"
                         :analyzer="analyzer"/>

    <ContractResultStates :state-changes="contractResult?.state_changes" :time-stamp="contractResult?.timestamp"/>

    <ContractResultLogs :logs="contractResult?.logs" :block-number="props.blockNumber" :transaction-hash="props.transactionHash"/>

  </template>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StringValue from "@/components/values/StringValue.vue";
import Property from "@/components/Property.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import ContractResultTrace from "@/components/contract/ContractResultTrace.vue";
import ContractResultStates from "@/components/contract/ContractResultStates.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import ContractResultLogs from "@/components/contract/ContractResultLogs.vue";
import {ContractResultAnalyzer} from "@/utils/analyzer/ContractResultAnalyzer";
import FunctionInput from "@/components/values/FunctionInput.vue";
import FunctionResult from "@/components/values/FunctionResult.vue";
import FunctionError from "@/components/values/FunctionError.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import GasAmount from "@/components/values/GasAmount.vue";

const props = defineProps({
  timestamp: {
    type: String,
  },
  topLevel: {
    type: Boolean,
    default: false
  },
  isParent: {
    type: Boolean,
    default: false
  },
  blockNumber: {
    type: Number
  },
  transactionHash: {
    type: String
  }
})

const isSmallScreen = inject('isSmallScreen', true)
const isMediumScreen = inject('isMediumScreen', true)

const contractResultAnalyzer = new ContractResultAnalyzer(computed(() => props.timestamp ?? null))
onMounted(() => contractResultAnalyzer.mount())
onBeforeUnmount(() => contractResultAnalyzer.unmount())

const displayedPrice = computed(() => {
  let result: number | null
  if (contractResultAnalyzer.contractType.value === 'Pre-Eip1559') {
    result = contractResultAnalyzer.gasPrice.value
  } else if (contractResultAnalyzer.contractType.value === 'Post-Eip1559') {
    result = contractResultAnalyzer.maxFeePerGas.value
  } else {
    result = contractResultAnalyzer.gasPrice.value
  }
  return result
})

const fromId = contractResultAnalyzer.fromId
const toId = contractResultAnalyzer.toId
const gasPrice = contractResultAnalyzer.gasPrice
const maxFeePerGas = contractResultAnalyzer.maxFeePerGas
const maxPriorityFeePerGas = contractResultAnalyzer.maxPriorityFeePerGas
const contractResult = contractResultAnalyzer.contractResult
const analyzer = contractResultAnalyzer.functionCallAnalyzer
const contractType = contractResultAnalyzer.contractType
const ethereumNonce = contractResultAnalyzer.ethereumNonce

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
