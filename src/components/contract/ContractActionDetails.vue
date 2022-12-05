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
  <div class="columns pt-2 pb-0 mb-0">
    <div class="column">
      <Property id="actionDetailFrom" :custom-nb-col-class="propertySizeClass">
        <template v-slot:name>From</template>
        <template v-slot:value>
          <EVMAddress :address="action.from" :id="action.caller" :entity-type="action.caller_type" :show-type="true"/>
        </template>
      </Property>
      <Property id="actionDetailTo" :custom-nb-col-class="propertySizeClass">
        <template v-slot:name>To</template>
        <template v-slot:value>
          <EVMAddress :address="action.to" :id="action.recipient" :entity-type="action.recipient_type" :show-type="true"/>
        </template>
      </Property>
      <Property v-if="signature" id="function" :custom-nb-col-class="propertySizeClass">
        <template v-slot:name>Function</template>
        <template v-slot:value>
          <SignatureValue :analyzer="functionCallAnalyzer"/>
        </template>
      </Property>
    </div>
    <div class="column h-has-column-dashed-separator">
      <Property id="actionDetailGasLimit" :custom-nb-col-class="propertySizeClass">
        <template v-slot:name>Gas Limit</template>
        <template v-slot:value>
          <PlainAmount :amount="action.gas"/>
        </template>
      </Property>
      <Property id="actionDetailGasUsed" :custom-nb-col-class="propertySizeClass">
        <template v-slot:name>Gas Used</template>
        <template v-slot:value>
          <PlainAmount :amount="action.gas_used"/>
        </template>
      </Property>
      <Property id="actionDetailError" :custom-nb-col-class="propertySizeClass">
        <template v-slot:name>Error Message</template>
        <template v-slot:value>
          <StringValue :string-value="errorMessage"/>
        </template>
      </Property>
    </div>
  </div>

  <hr class="dotted"/>

  <div class="columns pt-0 mt-0 pb-2">

    <div class="column">
      <FunctionInput :analyzer="analyzer" :custom-nb-col-class="propertySizeClass"/>
    </div>
    <div class="column h-has-column-dashed-separator">
      <FunctionResult :analyzer="analyzer" :custom-nb-col-class="propertySizeClass"/>
    </div>

  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

//
// defineComponent
//

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, PropType} from "vue";
import {ContractAction, ResultDataType} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/App.vue";
import Property from "@/components/Property.vue";
import StringValue from "@/components/values/StringValue.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import ByteCodeValue from "@/components/values/ByteCodeValue.vue";
import SignatureValue from "@/components/values/SignatureValue.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import {FunctionCallAnalyzer} from "@/utils/FunctionCallAnalyzer";
import FunctionInput from "@/components/values/FunctionInput.vue";
import FunctionResult from "@/components/values/FunctionResult.vue";

export default defineComponent({
  name: 'ContractActionDetails',

  components: {
    FunctionResult,
    FunctionInput, EVMAddress, SignatureValue, ByteCodeValue, PlainAmount, StringValue, Property},

  props: {
    action: Object as PropType<ContractAction | undefined>,
    analyzer: {
      type: Object as PropType<FunctionCallAnalyzer>,
      required: true
    }
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)
    const propertySizeClass = 'is-one-fifth'

    const errorMessage = computed(() => {
      let result
      if (props.action?.result_data_type != ResultDataType.OUTPUT) {
        result = props.action?.result_data
      } else {
        result = null
      }
      return result
    })

    const isNullByteCodeValue = (value: string|null) => value == null || value == "0x"

    const input = computed(() => props.action?.input ?? null)
    const output = computed(() => null)
    const contractId = computed(() => props.action?.recipient ?? null)
    const functionCallAnalyzer = new FunctionCallAnalyzer(input, output, contractId)
    onMounted(() => functionCallAnalyzer.mount())
    onBeforeUnmount(() => functionCallAnalyzer.unmount())

    return {
      isTouchDevice,
      isMediumScreen,
      propertySizeClass,
      ORUGA_MOBILE_BREAKPOINT,
      errorMessage,
      isNullByteCodeValue,
      functionCallAnalyzer,
      functionHash: functionCallAnalyzer.functionHash,
      signature: functionCallAnalyzer.signature,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
</style>
