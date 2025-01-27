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
  <template v-if="isMediumScreen">
    <div class="columns pt-2 pb-0 mb-0">
      <div class="column property-container">
        <Property id="actionDetailFrom" :custom-nb-col-class="propertySizeClass">
          <template v-slot:name>From</template>
          <template v-slot:value>
            <EVMAddress :id="action?.caller" :address="action?.from" :entity-type="action?.caller_type"
                        :show-type="true"/>
          </template>
        </Property>
        <Property id="actionDetailTo" :custom-nb-col-class="propertySizeClass">
          <template v-slot:name>To</template>
          <template v-slot:value>
            <EVMAddress :id="action?.recipient" :address="action?.to" :entity-type="action?.recipient_type"
                        :show-type="true"/>
          </template>
        </Property>
      </div>
      <div class="column property-container h-has-column-dashed-separator">
        <Property id="actionDetailValue" :custom-nb-col-class="propertySizeClass">
          <template v-slot:name>Value</template>
          <template v-slot:value>
            <HbarAmount :amount="action?.value"/>
          </template>
        </Property>
        <Property id="actionDetailGasLimit" :custom-nb-col-class="propertySizeClass">
          <template v-slot:name>Gas Limit</template>
          <template v-slot:value>
            <PlainAmount :amount="action?.gas"/>
          </template>
        </Property>
        <Property id="actionDetailGasUsed" :custom-nb-col-class="propertySizeClass">
          <template v-slot:name>Gas Used</template>
          <template v-slot:value>
            <PlainAmount :amount="action?.gas_used"/>
          </template>
        </Property>
        <FunctionError :analyzer="functionCallAnalyzer" :custom-nb-col-class="propertySizeClass" :show-none="true"/>
      </div>
    </div>

    <hr class="dotted"/>

    <div class="columns pt-0 mt-0 pb-2">
      <div class="column property-container">
        <FunctionInput :analyzer="functionCallAnalyzer" :custom-nb-col-class="propertySizeClass" :show-none="true"/>
      </div>
      <div class="column property-container h-has-column-dashed-separator">
        <FunctionResult :analyzer="functionCallAnalyzer" :custom-nb-col-class="propertySizeClass" :show-none="true"/>
      </div>
    </div>
  </template>

  <template v-else>
    <div class="pt-2 pb-0 mb-0">
      <Property id="actionDetailFrom" :custom-nb-col-class="propertySizeClass">
        <template v-slot:name>From</template>
        <template v-slot:value>
          <EVMAddress :id="action?.caller" :address="action?.from" :entity-type="action?.caller_type"
                      :show-type="true"/>
        </template>
      </Property>
      <Property id="actionDetailTo" :custom-nb-col-class="propertySizeClass">
        <template v-slot:name>To</template>
        <template v-slot:value>
          <EVMAddress :id="action?.recipient" :address="action?.to" :entity-type="action?.recipient_type"
                      :show-type="true"/>
        </template>
      </Property>
      <Property id="actionDetailGasUsed" :custom-nb-col-class="propertySizeClass">
        <template v-slot:name>Gas Used</template>
        <template v-slot:value>
          <PlainAmount :amount="action?.gas_used"/>
        </template>
      </Property>
      <FunctionError :analyzer="functionCallAnalyzer" :custom-nb-col-class="propertySizeClass" :show-none="true"/>
      <FunctionInput :analyzer="functionCallAnalyzer" :custom-nb-col-class="propertySizeClass" :show-none="true"/>
      <FunctionResult :analyzer="functionCallAnalyzer" :custom-nb-col-class="propertySizeClass" :show-none="true"/>
    </div>
  </template>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

//
// defineComponent
//

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, PropType, ref} from "vue";
import {ContractAction} from "@/schemas/MirrorNodeSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/BreakPoints";
import Property from "@/components/Property.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import FunctionInput from "@/components/values/FunctionInput.vue";
import FunctionResult from "@/components/values/FunctionResult.vue";
import FunctionError from "@/components/values/FunctionError.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import {ContractActionAnalyzer} from "@/utils/analyzer/ContractActionAnalyzer";

export default defineComponent({
  name: 'ContractActionDetails',

  components: {
    HbarAmount,
    FunctionError,
    FunctionResult,
    FunctionInput, EVMAddress, PlainAmount, Property
  },

  props: {
    action: Object as PropType<ContractAction>
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', ref(false))
    const isSmallScreen = inject('isSmallScreen', ref(false))
    const isMediumScreen = inject('isMediumScreen', ref(false))
    const propertySizeClass = 'is-one-fifth'

    const contractActionAnalyzer = new ContractActionAnalyzer(computed(() => props.action ?? null))
    onMounted(() => contractActionAnalyzer.mount())
    onBeforeUnmount(() => contractActionAnalyzer.unmount())

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      propertySizeClass,
      ORUGA_MOBILE_BREAKPOINT,
      functionCallAnalyzer: contractActionAnalyzer.functionCallAnalyzer,
      functionHash: contractActionAnalyzer.functionCallAnalyzer.functionHash,
      signature: contractActionAnalyzer.functionCallAnalyzer.signature,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.property-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

</style>
