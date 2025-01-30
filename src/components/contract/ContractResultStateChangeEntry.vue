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

<template v-if="change">

  <template v-if="change?.header===true">
    <div class="state-header">
      <div class="property-value">
        <EVMAddress
            style="display: inline-block"
            :id="change?.changes.contract_id"
            :address="change.changes.address"
            compact
            has-custom-font
        />
      </div>
      <div class="balance-info">
        <div class="property-name">
          HBar Balance Difference:
        </div>
        <div class="property-value">
          <HbarAmount :amount="change?.balanceChange" :timestamp="timestamp" :colored="true" :show-extra="true"/>
        </div>
      </div>
    </div>
    <hr class="table-separator"/>
  </template>

  <div class="state-change">

    <div></div>
    <div>
      <HexaDumpValue :byte-string="change?.changes.slot" :low-contrast="false" :word-wrap-small="4" :word-wrap-medium="8"/>
      <div class="h-is-extra-text">
        {{ 'Decimal: ' + (change?.slotDecimal ?? 'not available') }}
      </div>
    </div>
    <div>
      <HexaDumpValue :byte-string="change?.changes.value_read" :word-wrap-small="4" :word-wrap-medium="8"
                 :show-none="true" :low-contrast="change?.valueReadDecimal === 0"/>
      <div class="h-is-extra-text">
        {{ 'Decimal: ' + (change?.valueReadDecimal ?? 'not available') }}
      </div>
    </div>
    <div>
      <HexaDumpValue :byte-string="change?.changes.value_written" :word-wrap-small="4" :word-wrap-medium="8"
                 :show-none="true" :low-contrast="change?.valueWrittenDecimal === 0"/>
      <div class="h-is-extra-text">
        <span v-if="change?.changes.value_written">
          {{ 'Decimal: ' + (change?.valueWrittenDecimal ?? 'not available') }}
        </span>
        <span v-if="change?.valueChange">
          {{ '(Difference: ' + change?.valueChange + ')' }}
        </span>
      </div>
    </div>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";
import {DisplayStateChange} from "@/components/contract/ContractResultStates.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import HexaDumpValue from "@/components/values/HexaDumpValue.vue";

defineProps({
  change: Object as PropType<DisplayStateChange | undefined>,
  timestamp: {
    type: String,
    default: null
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.state-header {
  display: flex;
  gap: 32px;
  justify-content: flex-start;
}

div.balance-info {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

div.property-name {
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
}

div.property-value {
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 400;
}

hr.table-separator {
  background-color: var(--table-border);
  height: 1px;
  margin: 0;
}

div.state-change {
  display: grid;
  grid-template-columns: 1.5fr 3fr 3fr 3fr;
  color: var(--text-primary);
  font-size: 12px;
  font-weight: 400;
}

</style>
