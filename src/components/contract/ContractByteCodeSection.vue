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
      <span class="h-is-secondary-title">Contract Bytecode</span>
      <span v-if="contractName" class="icon has-text-success ml-2"><i class="far fa-check-circle"></i></span>
    </template>

    <template v-slot:control>
      <div v-if="sourcifyURL" id="showSource" class="is-inline-block ml-3">
        <a :href="sourcifyURL" target="_blank">View in Sourcify</a>
      </div>
      <div v-else id="showVerifier" class="is-inline-block ml-3">
        <a :href="verifierURL" target="_blank">Verify in Sourcify</a>
      </div>
    </template>

    <template v-slot:content>
        <Property id="code" :full-width="true">
            <template v-slot:name>Runtime Bytecode</template>
            <template v-slot:value>
                <ByteCodeValue :byte-code="byteCode ?? undefined"/>
            </template>
        </Property>
        <Property id="solcVersion" :full-width="true">
            <template v-slot:name>Compiler Version</template>
            <template v-slot:value>
                <StringValue :string-value="solcVersion ?? undefined"/>
            </template>
        </Property>
        <Property id="ipfsHash" :full-width="true">
            <template v-slot:name>IPFS Hash</template>
            <template v-slot:value>
                <StringValue :string-value="ipfsHash ?? undefined"/>
            </template>
        </Property>
        <Property id="swarmHash" :full-width="true">
            <template v-slot:name>SWARM Hash</template>
            <template v-slot:value>
                <StringValue :string-value="swarmHash ?? undefined"/>
            </template>
        </Property>

        <Property id="verificationStatus" :full-width="true">
            <template v-slot:name>Verification Status</template>
            <template v-slot:value>
              <span v-if="isVerified">
                {{ isFullMatch ? "Full Match" : "Partial Match" }}
                <span class="has-text-grey">
                <span class="ml-1">(see Sourcify</span>
                  <a class="ml-1" href="https://docs.sourcify.dev/docs/full-vs-partial-match/">documentation</a>
                  <span class="ml-1">for details)</span>
                </span>
              </span>
              <!--          <span v-else-if="compiling">Verifying contract…</span>-->
              <span v-else>Not yet verified</span>
            </template>
        </Property>

        <Property id="contractName" :full-width="true">
            <template v-slot:name>Contract Name</template>
            <template v-slot:value>
                <StringValue :string-value="contractName ?? undefined"/>
            </template>
        </Property>

    </template>
  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import ByteCodeValue from "@/components/values/ByteCodeValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import Property from "@/components/Property.vue";
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import {routeManager} from "@/router";

export default defineComponent({
  name: 'ContractByteCodeSection',

  components: {Property, StringValue, ByteCodeValue, DashboardCard},

  props: {
    contractAnalyzer: {
        type: Object as PropType<ContractAnalyzer>,
        required: true
    }
  },

  setup: function (props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)

    const isVerified = computed(() => props.contractAnalyzer.sourcifyRecord.value !== null)
    const isFullMatch = computed(() => {
        return props.contractAnalyzer.sourcifyRecord.value !== null && props.contractAnalyzer.sourcifyRecord.value.fullMatch
    })

    const contractName = computed(
        () => isVerified.value ? props.contractAnalyzer.contractName.value : null)

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      byteCode: props.contractAnalyzer.byteCodeAnalyzer.byteCode,
      solcVersion: props.contractAnalyzer.byteCodeAnalyzer.solcVersion,
      ipfsHash: props.contractAnalyzer.byteCodeAnalyzer.ipfsHash,
      ipfsURL: props.contractAnalyzer.byteCodeAnalyzer.ipfsURL,
      swarmHash: props.contractAnalyzer.byteCodeAnalyzer.swarmHash,
      contractName,
      sourcifyURL: props.contractAnalyzer.sourcifyURL,
      verifierURL: routeManager.currentNetworkEntry.value.sourcifySetup?.verifierURL,
      isVerified,
      isFullMatch
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
