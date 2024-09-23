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

  <DashboardCard collapsible-key="contractBytecode">
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
        <template v-if="!isVerified">
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
            <p class="mr-2">{{ isFullMatch ? "Full Match" : "Partial Match" }}</p>
            <InfoTooltip :label="tooltipText"/>
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
        <template v-slot:name>Solidity Compiler Version</template>
        <template v-slot:value>
          <StringValue :string-value="solcVersion ?? undefined"/>
        </template>
      </Property>
      <template  v-if="logicContractId">
        <Property id="logicContract" :full-width="true">
          <template v-slot:name>Proxying to Logic Contract</template>
          <template v-slot:value>
            <AccountLink v-bind:accountId="logicContractId"
                         v-bind:show-extra="true"/>
          </template>
        </Property>
        <Property id="adminContract" :full-width="true">
          <template v-slot:name>Proxying with Admin Contract</template>
          <template v-slot:value>
            <AccountLink v-bind:accountId="adminContractId"
                         v-bind:show-extra="true"/>
          </template>
        </Property>
      </template>
      <div v-if="isVerified" class="is-flex is-justify-content-space-between is-align-items-center mb-0">
        <Tabs :tab-ids=tabIds :tab-labels=tabLabels
              :selected-tab="selectedOption"
              @update:selected-tab="handleTabUpdate($event)"
        />
        <div v-if="selectedOption==='source'" class="is-flex is-justify-content-end">
          <DownloadButton @click="handleDownload"/>
          <o-field class="ml-2">
            <o-select v-model="selectedSource" class="h-is-text-size-3">
              <option value="">All source files</option>
              <optgroup label="Main contract file">
                <option :value="contractFileName">{{ sourceFileName }}</option>
              </optgroup>
              <optgroup label="Include files">
                <option v-for="file in solidityFiles" v-bind:key="file.path"
                        v-bind:value="file.name"
                        v-show="isImportFile(file)">
                  {{ relevantPath(file.path) }}
                </option>
              </optgroup>
            </o-select>
          </o-field>
        </div>
        <div v-else-if="selectedOption==='bytecode'" class="is-flex is-align-items-center is-justify-content-end">
          <p class="has-text-weight-light">Show hexa opcode</p>
          <label class="checkbox pt-1 ml-3">
            <input type="checkbox" v-model="showHexaOpcode">
          </label>
        </div>
        <div v-else-if="selectedOption==='abi'" class="is-flex is-justify-content-end is-align-items-center">
          <template v-if="logicModeAvailable">
            <p class="mr-2 h-is-text-size-3">Show Logic Contract ABI</p>
            <o-switch v-model="showLogicABI"/>
          </template>
          <DownloadButton @click="handleDownloadABI"/>
          <o-field class="ml-2">
            <o-select v-model="selectedType" class="h-is-text-size-3">
              <option :value="FragmentType.ALL">All definitions</option>
              <option :value="FragmentType.READONLY">Read-only functions</option>
              <option :value="FragmentType.READWRITE">Read-write functions</option>
              <option :value="FragmentType.EVENTS">Events</option>
              <option :value="FragmentType.ERRORS">Errors</option>
              <option :value="FragmentType.OTHER">Other definitions</option>
            </o-select>
          </o-field>
        </div>
      </div>
      <SourceCodeValue v-if="isVerified && selectedOption==='source'"
                       :source-files="solidityFiles ?? undefined"
                       :filter="selectedSource"/>
      <div v-if="!isVerified || selectedOption==='bytecode'" class="columns is-multiline h-is-property-text"
           :class="{'mt-3':!isVerified,'mt-0':isVerified}">
        <div id="bytecode" class="column is-6 pt-0 mb-0" :class="{'is-full': !isSmallScreen}">
          <span v-if="!isVerified" class="has-text-weight-light">Runtime Bytecode</span>
          <div>
            <ByteCodeValue :byte-code="byteCode ?? undefined" class="mb-0" :class="{'mt-3':!isVerified}"/>
          </div>
        </div>
        <div id="assembly-code" class="column is-6 pt-0 mb-0" :class="{'h-has-column-separator':isSmallScreen}">
          <div v-if="!isVerified" class="is-flex is-align-items-center is-justify-content-space-between">
            <p class="has-text-weight-light">Assembly Bytecode</p>
            <div class="is-flex is-align-items-center is-justify-content-end">
              <p class="has-text-weight-light">Show hexa opcode</p>
              <label class="checkbox pt-1 ml-3">
                <input type="checkbox" v-model="showHexaOpcode">
              </label>
            </div>
          </div>
          <DisassembledCodeValue :byte-code="byteCode ?? undefined" :show-hexa-opcode="showHexaOpcode" class="mb-0"/>
        </div>
      </div>
      <ContractAbiValue v-if="isVerified && selectedOption==='abi'"
                        :abiController="abiController"
                        :fragment-type="selectedType as FragmentType"/>
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

import {computed, ComputedRef, defineComponent, inject, onBeforeUnmount, onMounted, PropType, ref, watch} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import ByteCodeValue from "@/components/values/ByteCodeValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import Property from "@/components/Property.vue";
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import {routeManager} from "@/router";
import InfoTooltip from "@/components/InfoTooltip.vue";
import ContractVerificationDialog from "@/components/verification/ContractVerificationDialog.vue";
import DisassembledCodeValue from "@/components/values/DisassembledCodeValue.vue";
import {AppStorage} from "@/AppStorage";
import SourceCodeValue from "@/components/values/SourceCodeValue.vue";
import ContractAbiValue, {FragmentType} from "@/components/values/abi/ContractAbiValue.vue";
import {SourcifyResponseItem} from "@/utils/cache/SourcifyCache";
import DownloadButton from "@/components/DownloadButton.vue";
import JSZip from "jszip";
import {saveAs} from "file-saver";
import Tabs from "@/components/Tabs.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import {ABIController, ABIMode} from "@/components/contract/ABIController";
import {ABIAnalyzer} from "@/utils/analyzer/ABIAnalyzer";

const FULL_MATCH_TOOLTIP = `A Full Match indicates that the bytecode of the deployed contract is byte-by-byte the same as the compilation output of the given source code files with the settings defined in the metadata file. This means the contents of the source code files and the compilation settings are exactly the same as when the contract author compiled and deployed the contract.`
const PARTIAL_MATCH_TOOLTIP = `A Partial Match indicates that the bytecode of the deployed contract is the same as the compilation output of the given source code files except for the metadata hash. This means the deployed contract and the given source code + metadata function in the same way but there are differences in source code comments, variable names, or other metadata fields such as source paths.`

export default defineComponent({
  name: 'ContractByteCodeSection',

  components: {
    AccountLink,
    Tabs,
    ContractAbiValue,
    DownloadButton,
    SourceCodeValue,
    DisassembledCodeValue,
    ContractVerificationDialog,
    InfoTooltip,
    Property,
    StringValue,
    ByteCodeValue,
    DashboardCard
  },

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

    const showHexaOpcode = ref(false)
    onMounted(() => showHexaOpcode.value = AppStorage.getShowHexaOpcode())
    watch(showHexaOpcode, () => AppStorage.setShowHexaOpcode(showHexaOpcode.value ? showHexaOpcode.value : null))

    const tabIds = ['abi', 'source', 'bytecode']
    const tabLabels = ['ABI', 'Source', 'Bytecode']
    const selectedOption = ref<string|null>(AppStorage.getContractByteCodeTab() ?? tabIds[0])
    const handleTabUpdate = (tab: string|null) => {
      selectedOption.value = tab
      AppStorage.setContractByteCodeTab(tab)
    }

    const selectedSource = ref('')
    watch(props.contractAnalyzer.contractFileName,
        () => selectedSource.value = props.contractAnalyzer.contractFileName.value ?? '', {immediate: true})

    const isImportFile = (file: SourcifyResponseItem): boolean => {
      return file.name !== props.contractAnalyzer.contractFileName.value
    }

    const relevantPath = (fullPath: string): string => {
      return fullPath.substring(fullPath.indexOf('sources') + 8)
    }

    const handleDownload = async () => {
      const contractURL = props.contractAnalyzer.sourcifyURL.value ?? ''
      if (selectedSource.value === '') {
        const zip = new JSZip();
        for (const file of props.contractAnalyzer.sourceFiles.value) {
          const filePath = file.path.substring(file.path.indexOf('match') + 10)
          zip.file(filePath, file.content);
        }
        zip.generateAsync({type: "blob"})
            .then(function (content: any) {
              const zipName = props.contractAnalyzer.contractAddress.value + '.zip'
              saveAs(content, zipName);
            });
      } else {
        for (const file of props.contractAnalyzer.solidityFiles.value) {
          if (file.name === selectedSource.value) {
            const URLPrefix = contractURL.substring(0, contractURL.indexOf('contracts'))
            const filePath = file.path.substring(file.path.indexOf('contracts'))
            const fileURL = URLPrefix + filePath

            const a = document.createElement('a')
            a.setAttribute('href', fileURL)
            a.setAttribute('download', file.name);
            a.click()
          }
        }
      }
    }

    const selectedType = ref<string>(FragmentType.ALL)
    onMounted(() => {
      const preferredType = AppStorage.getFragmentType()
      if (preferredType && Object.values(FragmentType).includes(preferredType as FragmentType)) {
        selectedType.value = preferredType
      } else {
        AppStorage.setFragmentType(null)
        selectedType.value = FragmentType.ALL
      }
    })
    watch(selectedType, () => AppStorage.setFragmentType(selectedType.value))

    const abiBlob = computed(() => {
      let result: Blob | null
      const itf = abiController.targetInterface.value
      if (itf !== null) {
        result = new Blob([itf.formatJson()], {type: "text/json"})
      } else {
        result = null
      }
      return result
    })

    const handleDownloadABI = () => {
      if (abiBlob.value !== null) {
        const url = window.URL.createObjectURL(abiBlob.value)
        const outputName = abiController.targetContractName.value + ".json"
        const a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('download', outputName);
        a.click()
      }
    }

    const abiAnalyzer  = new ABIAnalyzer(props.contractAnalyzer)
    onMounted(() => abiAnalyzer.mount())
    onBeforeUnmount(() => abiAnalyzer.unmount())

    const logicContractId = computed(() => {
      return abiAnalyzer.logicContractId.value ?? undefined
    })

    const adminContractId = computed(() => {
      return abiAnalyzer.adminContractId.value ?? undefined
    })

    const showLogicABI = ref(AppStorage.getShowLogicABI())
    watch(showLogicABI, () => {
      AppStorage.setShowLogicABI(showLogicABI.value)
    })

    const mode: ComputedRef<ABIMode> = computed(() => {
      return showLogicABI.value && abiController.logicModeAvailable.value ? ABIMode.Logic : ABIMode.Normal
    })
    const abiController = new ABIController(abiAnalyzer, mode)

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
      solidityFiles: props.contractAnalyzer.solidityFiles,
      sourceFileName: props.contractAnalyzer.sourceFileName,
      contractFileName: props.contractAnalyzer.contractFileName,
      logicContractId,
      adminContractId,
      verifyDidComplete,
      isFullMatch,
      showHexaOpcode,
      selectedOption,
      tabIds,
      tabLabels,
      handleTabUpdate,
      selectedSource,
      isImportFile,
      relevantPath,
      handleDownload,
      selectedType,
      handleDownloadABI,
      abiController,
      logicModeAvailable: abiController.logicModeAvailable,
      FragmentType,
      showLogicABI,
      ABIMode,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
