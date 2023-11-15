<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

  <div v-if="log" :class="{'log-wrapper-grid': isMediumScreen, 'log-wrapper-flex': !isMediumScreen}">
    <!-- left content-->
    <div :class="{'log-left-content-grid': isMediumScreen}">
      <PropertyVertical id="transactionHash" :is-horizontal="!isMediumScreen">
        <template v-slot:name>Transaction Hash</template>
        <template v-slot:value>
          <HexaValue v-bind:byteString="txHashToShow" v-bind:show-none="true"/>
        </template>
      </PropertyVertical>

      <PropertyVertical id="blockNumber" :is-horizontal="!isMediumScreen">
        <template v-slot:name>Block</template>
        <template v-slot:value>
          {{ blockNumberToShow }}
        </template>
      </PropertyVertical>

      <PropertyVertical id="address" :is-horizontal="!isMediumScreen">
        <template v-slot:name>Address</template>
        <template v-slot:value>
          <EVMAddress :address="log.address" :enable-copy="true" :compact="!isSmallScreen && !isMediumScreen"/>
        </template>
      </PropertyVertical>

      <PropertyVertical id="method" :is-horizontal="!isMediumScreen">
        <template v-slot:name>Method</template>
        <template v-slot:value>
          <div style="border: 1px solid grey; width: 120px; text-align: center; padding: 3px 0; border-radius: 3px;">
            <!-- 0x5533478x -->
            TBD
          </div>
        </template>
      </PropertyVertical>

    </div>

    <!-- right content -->
    <PropertyVertical id="Args" style="grid-column: span 14;">
      <template v-slot:name>Logs</template>
      <template v-slot:value>
        <!-- not verified -->
        <div v-if="!isContractVerified" style="display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0.25rem;">
          <div v-for="(t, ti) in log.topics" :class="{'unverif-log-args-prop': !isMediumScreen || !isSmallScreen}" :key="t" style="display: flex; gap: 1rem;">
            <div style="border: 1px solid grey; width: 70px; text-align: center; padding: 3px 0; border-radius: 3px;">
              <span style="font-size: 0.85rem">{{ 'Topic ' + ti }}</span>
            </div>
            
            <HexaValue :show-none="true" v-bind:byteString="t" :low-contrast="ti === 0"
            :word-wrap-small="0" :word-wrap-medium="8"/>
          </div>
        </div>

        <div v-else style="border: 1px solid grey; padding: 9px; border-radius: 3px; display: flex; flex-direction: column; gap: 0.75rem">
          <span class="h-is-property-text">{{ fullLogSignature }}</span>

          <template v-for="(arg, i) in args" :key="arg.name">
            <PropertyVertical :id="'logArg_' + arg.name" :full-width="true" :is-horizontal="!isMediumScreen">
                <template v-slot:name>
                  <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <div v-if="arg.indexed" style="border: 1px solid grey; width: 70px; text-align: center; padding: 3px 0; border-radius: 3px;">
                      <span style="font-size: 0.85rem">{{ 'Topic ' + i }}</span>
                    </div>  
                    <span class="h-is-property-text is-italic" style="font-size: small; letter-spacing: -0.025em;">
                      {{ arg.type + " " + arg.name }}
                    </span>
                  </div>

                </template>
                <template v-slot:value>
                    <FunctionValue :ntv="arg" :hide-type="true" :low-contrast="i === 0"/>
                </template>
            </PropertyVertical>
        </template>
        </div>
      </template>
    </PropertyVertical>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, PropType, ref} from "vue";
import {ContractLog} from "@/schemas/HederaSchemas";
import PropertyVertical from "@/components/PropertyVertical.vue";
import StringValue from "@/components/values/StringValue.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import {ContractLogAnalyzer} from "@/utils/analyzer/ContractLogAnalyzer";
import SignatureValue from "@/components/values/SignatureValue.vue";
import FunctionValue from "@/components/values/FunctionValue.vue";
import DashboardCard from '../DashboardCard.vue';

export default defineComponent({
  name: "ContractResultLogEntryV2",
  components: { FunctionValue, SignatureValue, EVMAddress, HexaValue, StringValue, PropertyVertical, DashboardCard },
  props: {
    log: {
        type: Object as PropType<ContractLog | null>,
        default: null
    },
    blockNumber: {
      type:  Number,
    },
    transactionHash: {
      type: String
    }
  },
  setup(props) {
      const isSmallScreen = inject('isSmallScreen', true)
      const isMediumScreen = inject('isMediumScreen', true)
      const isTouchDevice = inject('isTouchDevice', false)

      const logAnalyzer = new ContractLogAnalyzer(computed(() => props.log))
      onMounted(() => logAnalyzer.mount())
      onBeforeUnmount(() => logAnalyzer.unmount())

      const blockNumberToShow = computed(() => props.blockNumber ? props.blockNumber : props.log?.block_number)
      const txHashToShow = computed(() => props.transactionHash ? props.transactionHash : props.log?.transaction_hash)

      return {
          isSmallScreen,
          isMediumScreen,
          isTouchDevice,
          args: logAnalyzer.args,
          signature: logAnalyzer.signature,
          fullLogSignature: logAnalyzer.fullLogSignature,
          blockNumberToShow,
          txHashToShow,
          isContractVerified: logAnalyzer.isContractVerified
      }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

.log-wrapper-grid {
  position: relative; 
  display: grid; 
  column-gap: 3rem; 
  grid-template-columns: repeat(19, minmax(0, 1fr));
}

.log-left-content-grid {
  grid-column: span 5; 
  display: flex; 
  flex-direction: column; 
  gap: 1rem;
}

.log-wrapper-flex {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 1rem
}

.unverif-log-args-prop {
  justify-content: space-between;
}

</style>
