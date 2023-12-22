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
            <div class="is-flex is-align-items-center is-flex-wrap-wrap">
                <span class="h-is-secondary-title mr-3">Contract Bytecode</span>
                <div v-if="isVerificationAvailable" class="h-is-text-size-2 mt-1">
                    <div v-if="isVerified" class="h-has-pill has-background-success">VERIFIED</div>
                    <div v-else class="h-has-pill has-background-warning">NOT VERIFIED</div>
                </div>
            </div>
        </template>

        <template v-slot:control>
            <template v-if="isVerificationAvailable">
                <template v-if="isVerified">
                    <div v-if="sourcifyURL" id="showSource" class="is-inline-block ml-3">
                        <a :href="sourcifyURL" target="_blank">View contract sources</a>
                    </div>
                </template>
                <template v-else>
                    <button id="verify-button"
                            class="button is-white is-small has-text-right"
                            @click="showVerifyDialog = true">
                        VERIFY CONTRACT
                    </button>
                </template>
            </template>
        </template>

        <template v-slot:content>
            <Property v-if="isVerified" id="verificationStatus" :full-width="true">
                <template v-slot:name>Verification Status</template>
                <template v-slot:value>
                    <div class="is-flex is-align-items-center">
                        <span>
                            {{ isFullMatch ? "Full Match" : "Partial Match" }}
                            <InfoTooltip :label="tooltipText"/>
                        </span>
                        <button v-if="!isFullMatch" id="verify-button"
                                class="button is-white h-is-smaller ml-3"
                                @click="showVerifyDialog = true">
                            RE-VERIFY CONTRACT
                        </button>
                    </div>
                </template>
            </Property>
            <Property v-if="isVerified" id="contractName" :full-width="true">
                <template v-slot:name>Contract Name</template>
                <template v-slot:value>
                    <StringValue :string-value="contractName ?? undefined"/>
                </template>
            </Property>
            <Property id="solcVersion" :full-width="true">
                <template v-slot:name>Compiler Version</template>
                <template v-slot:value>
                    <StringValue :string-value="solcVersion ?? undefined"/>
                </template>
            </Property>
            <Property id="code" :full-width="true">
                <template v-slot:name>Runtime Bytecode</template>
            </Property>
            <ByteCodeValue :byte-code="byteCode ?? undefined" class="mt-3 mb-4"/>
            <Property id="disassembledCode" :full-width="true">
                <template v-slot:name>Disassembled Bytecode</template>
                <template v-slot:value>
                    <div class="is-flex is-align-items-center is-justify-content-end">
                        <p class="has-text-weight-light">Show hexadecimal opcode</p>
                        <label class="checkbox pt-1 ml-3">
                            <input type="checkbox" v-model="showOpcodeHexa">
                        </label>
                    </div>
                </template>
            </Property>
            <DisassembledCodeValue :byte-code="byteCode ?? undefined" :show-opcode-hexa="showOpcodeHexa"/>
        </template>
    </DashboardCard>


    <ContractVerificationDialog
        v-model:show-dialog="showVerifyDialog"
        :contract-id="contractId ?? undefined"
        v-on:verify-did-complete="verifyDidComplete"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import ByteCodeValue from "@/components/values/ByteCodeValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import Property from "@/components/Property.vue";
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import {routeManager} from "@/router";
import InfoTooltip from "@/components/InfoTooltip.vue";
import ContractVerificationDialog from "@/components/verification/ContractVerificationDialog.vue";
import DisassembledCodeValue from "@/components/values/DisassembledCodeValue.vue";

const FULL_MATCH_TOOLTIP = `A Full Match indicates that the bytecode of the deployed contract is byte-by-byte the same as the compilation output of the given source code files with the settings defined in the metadata file. This means the contents of the source code files and the compilation settings are exactly the same as when the contract author compiled and deployed the contract.`
const PARTIAL_MATCH_TOOLTIP = `A Partial Match indicates that the bytecode of the deployed contract is the same as the compilation output of the given source code files except for the metadata hash. This means the deployed contract and the given source code + metadata function in the same way but there are differences in source code comments, variable names, or other metadata fields such as source paths.`

export default defineComponent({
  name: 'ContractByteCodeSection',

  components: {DisassembledCodeValue, ContractVerificationDialog, InfoTooltip, Property, StringValue, ByteCodeValue, DashboardCard},

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

    const isVerified = computed(() => props.contractAnalyzer.sourcifyURL.value != null)

    const isFullMatch = computed(() => props.contractAnalyzer.fullMatch.value)

    const contractName = computed(
        () => isVerified.value ? props.contractAnalyzer.contractName.value : null)

    // True when the verification is ENABLED by configuration and the current verification STATUS is known, which
    // enables to decide which option to present to the user
    const isVerificationAvailable = computed(() => {
        const sourcifySetup = routeManager.currentNetworkEntry.value.sourcifySetup
        return sourcifySetup?.activate
            && sourcifySetup?.serverURL.length
    })

    const showVerifyDialog = ref(false)
    const verifyDidComplete = () => {
        props.contractAnalyzer.verifyDidComplete()
    }

    const tooltipText = computed(() => isFullMatch.value ? FULL_MATCH_TOOLTIP : PARTIAL_MATCH_TOOLTIP)

    const showOpcodeHexa = ref(false)

    return {
      isTouchDevice,
      isSmallScreen,
      isMediumScreen,
      byteCode: props.contractAnalyzer.byteCodeAnalyzer.byteCode,
      solcVersion: props.contractAnalyzer.byteCodeAnalyzer.solcVersion,
      contractName,
      isVerificationAvailable,
      tooltipText,
      sourcifyURL: props.contractAnalyzer.sourcifyURL,
      isVerified,
      showVerifyDialog,
      contractId: props.contractAnalyzer.contractId,
      byteCodeAnalyzer: props.contractAnalyzer.byteCodeAnalyzer,
      verifyDidComplete,
      isFullMatch,
      showOpcodeHexa,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
