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

  <div v-if="log">
    <Property id="logAddress" :full-width="true">
      <template v-slot:name>Address</template>
      <template v-slot:value>
        <EVMAddress :address="log.address" :id="log.contract_id"/>
      </template>
    </Property>
    <Property id="logData" :full-width="true">
      <template v-slot:name>Data</template>
      <template v-slot:value>
        <HexaValue :show-none="true" v-bind:byteString="log.data" :low-contrast="false"/>
      </template>
    </Property>
    <Property id="logIndex" :full-width="true">>
      <template v-slot:name>Index</template>
      <template v-slot:value>
        <StringValue :string-value="log?.index.toString()"/>
      </template>
    </Property>
    <Property id="logTopics" :full-width="true">>
      <template v-slot:name>Topics</template>
      <template v-slot:value>
        <div v-for="(t, topicIndex) in log.topics" :key="t" class="is-flex">
          <span class="is-family-monospace h-is-text-size-3 mt-1 mr-2">{{ '(' + topicIndex + ') ' }}</span>
          <HexaValue :show-none="true" v-bind:byteString="t" :low-contrast="false"
                     :word-wrap-small="8" :word-wrap-medium="8" />
        </div>
      </template>
    </Property>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType} from "vue";
import {ContractResultLog} from "@/schemas/HederaSchemas";
import Property from "@/components/Property.vue";
import StringValue from "@/components/values/StringValue.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";

export default defineComponent({
  name: "ContractResultLogEntry",
  components: {EVMAddress, HexaValue, StringValue, Property},
  props: {
    log: Object as PropType<ContractResultLog | undefined>
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
