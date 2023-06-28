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

  <DashboardCard>
    <template v-slot:title>
      <p class="h-is-secondary-title">Contract Bytecode</p>
    </template>

    <template v-slot:content>
        <Property id="code">
            <template v-slot:name>Runtime Bytecode</template>
            <template v-slot:value>
                <ByteCodeValue :byte-code="byteCode ?? undefined"/>
            </template>
        </Property>
        <Property id="solcVersion">
            <template v-slot:name>Compiler Version</template>
            <template v-slot:value>
                <StringValue :string-value="solcVersion ?? undefined"/>
            </template>
        </Property>
        <Property id="ipfsHash">
            <template v-slot:name>IPFS Hash</template>
            <template v-slot:value>
                <StringValue :string-value="ipfsHash ?? undefined"/>
            </template>
        </Property>
        <Property id="swarmHash">
            <template v-slot:name>SWARM Hash</template>
            <template v-slot:value>
                <StringValue :string-value="swarmHash ?? undefined"/>
            </template>
        </Property>

    </template>
  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import ByteCodeValue from "@/components/values/ByteCodeValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import Property from "@/components/Property.vue";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {ByteCodeAnalyzer} from "@/utils/analyzer/ByteCodeAnalyzer";

export default defineComponent({
  name: 'ContractByteCodeSection',

  components: {Property, StringValue, ByteCodeValue, DashboardCard},

  props: {
    contractId: String,
  },

  setup: function (props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)

    const contractLookup = ContractByIdCache.instance.makeLookup(computed(() => props.contractId ?? null))
    onMounted(() => contractLookup.mount())
    onBeforeUnmount(() => contractLookup.unmount())

    const byteCode = computed(() => contractLookup.entity.value?.runtime_bytecode ?? null)
    const byteCodeAnalyzer = new ByteCodeAnalyzer(byteCode)

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      byteCode: byteCodeAnalyzer.byteCode,
      solcVersion: byteCodeAnalyzer.solcVersion,
      ipfsHash: byteCodeAnalyzer.ipfsHash,
      ipfsURL: byteCodeAnalyzer.ipfsURL,
      swarmHash: byteCodeAnalyzer.swarmHash,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
