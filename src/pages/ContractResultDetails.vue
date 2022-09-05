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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Contract Result for {{ result?.contract_id ?? "" }} at {{ result?.timestamp }}</span>
      </template>

      <template v-slot:leftContent>
            <Property id="from">
              <template v-slot:name>From</template>
              <template v-slot:value>
                <HexaValue :byte-string="result?.from" v-bind:show-none="true"/>
              </template>
            </Property>
            <Property id="to">
              <template v-slot:name>To</template>
              <template v-slot:value>
                <HexaValue :byte-string="result?.to" v-bind:show-none="true"/>
              </template>
            </Property>
            <Property id="type">
              <template v-slot:name>Type</template>
              <template v-slot:value>
                <StringValue :string-value="result?.type?.toString()"/>
              </template>
            </Property>
            <Property id="errorMessage">
              <template v-slot:name>Error Message</template>
              <template v-slot:value>
                <StringValue :string-value="result?.error_message"/>
              </template>
            </Property>
      </template>

      <template v-slot:rightContent>
            <Property id="gasLimit">
              <template v-slot:name>Gas Limit</template>
              <template v-slot:value>
                <PlainAmount :amount="result?.gas_limit"/>
              </template>
            </Property>
            <Property id="gasUsed">
              <template v-slot:name>Gas Used</template>
              <template v-slot:value>
                <PlainAmount :amount="result?.gas_used"/>
              </template>
            </Property>
            <Property id="maxFeePerGas">
              <template v-slot:name>Max Fee Per Gas</template>
              <template v-slot:value>
                <StringValue :string-value="result?.max_fee_per_gas"/>
              </template>
            </Property>
            <Property id="maxPriorityFeePerGas">
              <template v-slot:name>Max Priority Fee Per Gas</template>
              <template v-slot:value>
                <StringValue :string-value="result?.max_priority_fee_per_gas"/>
              </template>
            </Property>
            <Property id="gasPrice">
              <template v-slot:name>Gas Price</template>
              <template v-slot:value>
                <StringValue :string-value="result?.gas_price"/>
              </template>
            </Property>
      </template>

    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import Property from "@/components/Property.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import {ContractResultDetailsLoader} from "@/components/contract/ContractResultDetailsLoader";

export default defineComponent({

  name: 'ContractResultDetails',

  components: {
    DashboardCard,
    Property,
    PlainAmount,
    HexaValue,
    StringValue,
    Footer,
  },

  props: {
    contractId: String,
    timestamp: String,
    transactionIdOrHash: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const contractResultDetailsLoader = new ContractResultDetailsLoader(
        computed(() => props.contractId ?? null),
        computed(() => props.timestamp ?? null),
        computed(() => props.transactionIdOrHash ?? null))
    onMounted(() => contractResultDetailsLoader.requestLoad())

    return {
      isSmallScreen,
      isTouchDevice,
      result: contractResultDetailsLoader.entity
    }
  }
});

</script>

<style/>