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
        <Property id="from">
          <template v-slot:name>From</template>
          <template v-slot:value>
            <EVMAddress :address="contractResult?.from"/>
          </template>
        </Property>
        <Property id="to">
          <template v-slot:name>To</template>
          <template v-slot:value>
            <EVMAddress :address="contractResult?.to"/>
          </template>
        </Property>
        <Property id="type">
          <template v-slot:name>Type</template>
          <template v-slot:value>
            <StringValue :string-value="contractResult?.type?.toString()"/>
          </template>
        </Property>
        <Property id="functionParameters">
          <template v-slot:name>Function Parameters</template>
          <template v-slot:value>
            <HexaValue :byte-string ="contractResult?.function_parameters" v-bind:show-none="true"/>
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

    <ContractResultTrace :transaction-id-or-hash="transactionIdOrHash"/>

    <ContractResultStates :state-changes="contractResult?.state_changes" :time-stamp="contractResult?.timestamp"/>

    <ContractResultLogs :logs="contractResult?.logs"/>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, ref} from 'vue';
import {ContractResultDetailsLoader} from "@/components/contract/ContractResultDetailsLoader";
import HexaValue from "@/components/values/HexaValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StringValue from "@/components/values/StringValue.vue";
import Property from "@/components/Property.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import ContractResultTrace from "@/components/contract/ContractResultTrace.vue";
import ContractResultStates from "@/components/contract/ContractResultStates.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import ContractResultLogs from "@/components/contract/ContractResultLogs.vue";

export default defineComponent({

  name: 'ContractResult',

  components: {
    ContractResultLogs,
    EVMAddress,
    ContractResultStates,
    ContractResultTrace,
    PlainAmount,
    Property,
    HbarAmount,
    DashboardCard,
    HexaValue,
    StringValue
  },

  props: {
    transactionIdOrHash: String,
    topLevel: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const contractResultDetailsLoader = new ContractResultDetailsLoader(
        ref(null),
        ref(null),
        computed(() => props.transactionIdOrHash ?? null))
    onMounted(() => contractResultDetailsLoader.requestLoad())

    return {
      isSmallScreen,
      isTouchDevice,
      contractResult: contractResultDetailsLoader.entity
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>