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

<template v-if="change">

  <template v-if="change.header===true">
    <div class="is-flex is-align-items-baseline">
      <ContractLink :contract-id="change.changes.contract_id"></ContractLink>
      <EVMAddress :address="change.changes.address" :compact="isSmallScreen && !isMediumScreen" class="ml-3"/>
      <span class="mb-2 h-is-text-size-3">
            <span class="ml-4 mr-2">Contract HBar Balance Difference:</span>
            <HbarAmount :amount="change.balanceChange" :timestamp="timestamp" :colored="true" :show-extra="true"/>
          </span>
    </div>
    <hr class="h-card-separator" style="margin-bottom: 12px; margin-top: 0"/>
  </template>

  <div class="columns" style="margin-bottom:0">

    <div class="column is-1 py-1"></div>

    <div class="column py-1">
      <HexaValue :byte-string="change.changes.slot" :low-contrast="false" :word-wrap-small="4" :word-wrap-medium="8"/>
      <div class="h-is-extra-text h-is-text-size-2">
        {{ 'Decimal: ' + (change.slotDecimal??'not available') }}
      </div>
    </div>

    <div class="column py-1">
      <HexaValue :byte-string="change.changes.value_read" :word-wrap-small="4" :word-wrap-medium="8"
                 :show-none="true" :low-contrast="change.valueReadDecimal === 0"/>
      <div class="h-is-extra-text h-is-text-size-2">
        {{ 'Decimal: ' + (change.valueReadDecimal??'not available') }}
      </div>
    </div>

    <div class="column py-1">
      <HexaValue :byte-string="change.changes.value_written" :word-wrap-small="4" :word-wrap-medium="8"
                 :show-none="true" :low-contrast="change.valueWrittenDecimal === 0"/>
      <div class="h-is-extra-text h-is-text-size-2">
              <span v-if="change.changes.value_written">
                {{ 'Decimal: ' + (change.valueWrittenDecimal??'not available') }}
              </span>
        <span v-if="change.valueChange" class="ml-2">
          {{ '(Difference: ' + change.valueChange + ')' }}
        </span>
      </div>
    </div>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType} from "vue";
import {DisplayStateChange} from "@/components/contract/ContractResultStates.vue";
import ContractLink from "@/components/values/ContractLink.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import HexaValue from "@/components/values/HexaValue.vue";

export default defineComponent({
  name: "ContractResultStateChangeEntry",
  components: {HexaValue, HbarAmount, EVMAddress, ContractLink},
  props: {
    change: Object as PropType<DisplayStateChange | undefined>,
    timestamp: {
      type: String,
      default: null
    }
  },
  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    return {
      isSmallScreen,
      isMediumScreen
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
