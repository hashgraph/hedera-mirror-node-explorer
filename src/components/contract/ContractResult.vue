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

  <div v-if="contractResult">

    <DashboardCard class="h-card">
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
        <Property id="errorMessage">
          <template v-slot:name>Error Message</template>
          <template v-slot:value>
            <StringValue :string-value ="contractResult?.error_message"/>
          </template>
        </Property>
        <Property id="from">
          <template v-slot:name>From</template>
          <template v-slot:value>
            <EVMAddress :address="contractResult?.from" :id="fromId" :compact="isSmallScreen && !isMediumScreen"/>
          </template>
        </Property>
        <Property id="to">
          <template v-slot:name>To</template>
          <template v-slot:value>
            <EVMAddress :address="contractResult?.to" :id="toId" :compact="isSmallScreen && !isMediumScreen"/>
          </template>
        </Property>
        <FunctionInput :analyzer="functionCallAnalyzer"/>
        <FunctionResult :analyzer="functionCallAnalyzer"/>
      </template>

      <template v-slot:rightContent>
        <Property id="type">
          <template v-slot:name>Type</template>
          <template v-slot:value>
            <StringValue :string-value="contractType(contractResult?.type)"/>
          </template>
        </Property>
        <Property id="gasLimit">
          <template v-slot:name>Gas Limit</template>
          <template v-slot:value>
            <PlainAmount :amount="contractResult?.gas_limit" none-label="None"/>
          </template>
        </Property>
        <Property id="gasUsed">
          <template v-slot:name>Gas Used</template>
          <template v-slot:value>
            <PlainAmount :amount="contractResult?.gas_used" none-label="None"/>
          </template>
        </Property>
        <Property id="maxFeePerGas">
          <template v-slot:name>Max Fee Per Gas</template>
          <template v-slot:value>
            <PlainAmount :amount="maxFeePerGas" none-label="None"/>
          </template>
        </Property>
        <Property id="maxPriorityFeePerGas">
          <template v-slot:name>Max Priority Fee Per Gas</template>
          <template v-slot:value>
            <PlainAmount :amount="maxPriorityFeePerGas" none-label="None"/>
          </template>
        </Property>
        <Property id="gasPrice">
          <template v-slot:name>Gas Price</template>
          <template v-slot:value>
            <HbarAmount :amount="gasPrice" :show-extra="true"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

    <ContractResultTrace v-if="isParent" :transaction-id-or-hash="transactionIdOrHash"/>

    <ContractResultStates :state-changes="contractResult?.state_changes" :time-stamp="contractResult?.timestamp"/>

    <ContractResultLogs :logs="contractResult?.logs"/>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import {ContractResultDetailsLoader} from "@/components/contract/ContractResultDetailsLoader";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StringValue from "@/components/values/StringValue.vue";
import Property from "@/components/Property.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import ContractResultTrace from "@/components/contract/ContractResultTrace.vue";
import ContractResultStates from "@/components/contract/ContractResultStates.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import ContractResultLogs from "@/components/contract/ContractResultLogs.vue";
import {FunctionCallAnalyzer} from "@/utils/FunctionCallAnalyzer";
import {EntityID} from "@/utils/EntityID";
import FunctionInput from "@/components/values/FunctionInput.vue";
import FunctionResult from "@/components/values/FunctionResult.vue";

export default defineComponent({

  name: 'ContractResult',

  components: {
    FunctionResult,
    FunctionInput,
    ContractResultLogs,
    EVMAddress,
    ContractResultStates,
    ContractResultTrace,
    PlainAmount,
    Property,
    HbarAmount,
    DashboardCard,
    StringValue
  },

  props: {
    timestamp: String,
    contractId: String,
    transactionIdOrHash: String,
    topLevel: {
      type: Boolean,
      default: false
    },
    isParent: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const fromId = computed(() => {
      let result
      if (contractResultDetailsLoader.entity.value?.from) {
        const entity = EntityID.fromAddress(contractResultDetailsLoader.entity.value?.from)
        result = entity ? entity.toString() : null
      } else {
        result = null
      }
      return result
    })

    const toId = computed(() => {
      let result
      if (contractResultDetailsLoader.entity.value?.from) {
        const entity = EntityID.fromAddress(contractResultDetailsLoader.entity.value?.to)
        result = entity ? entity.toString() : null
      } else {
        result = null
      }
      return result
    })

    const gasPrice = computed(() => {
      return (contractResultDetailsLoader.entity.value?.gas_price !== null)
          ? Number(filter0x(contractResultDetailsLoader.entity.value?.gas_price))
          : null
    })

    const maxFeePerGas = computed(() => {
      return (contractResultDetailsLoader.entity.value?.max_fee_per_gas !== null)
          ? Number(filter0x(contractResultDetailsLoader.entity.value?.max_fee_per_gas))
          : null
    })

    const maxPriorityFeePerGas = computed(() => {
      return (contractResultDetailsLoader.entity.value?.max_priority_fee_per_gas !== null)
          ? Number(filter0x(contractResultDetailsLoader.entity.value?.max_priority_fee_per_gas))
          : null
    })

    const contractResultDetailsLoader = new ContractResultDetailsLoader(
        computed(() => props.contractId ?? null),
        computed(() => props.timestamp ?? null),
        computed(() => props.transactionIdOrHash ?? null))
    onMounted(() => contractResultDetailsLoader.requestLoad())

    const filter0x = (value: string|null|undefined) => value === '0x' ? '0' : value

    const functionCallAnalyzer = new FunctionCallAnalyzer(
        contractResultDetailsLoader.functionParameters,
        contractResultDetailsLoader.callResult,
        contractResultDetailsLoader.actualContractId)
    onMounted(() => functionCallAnalyzer.mount())
    onBeforeUnmount(() => functionCallAnalyzer.unmount())

    const contractType = (typeValue: number | null): string | null => {
      let result
      if (typeValue !== null) {
        result =  typeValue === 0 ? "Pre-Eip1559" : typeValue === 2 ? "Post-Eip1559" : typeValue.toString()
      } else {
        result = null
      }
      return result
    }

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      fromId,
      toId,
      gasPrice,
      maxFeePerGas,
      maxPriorityFeePerGas,
      contractResult: contractResultDetailsLoader.entity,
      functionCallAnalyzer: functionCallAnalyzer,
      contractType
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>