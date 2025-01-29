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

<!-- TODO: remove BULMA styling -->

<template>

  <div id="abi" class="abi-container">

    <template v-if="showAll && roContractCallBuilders.length == 0 && rwContractCallBuilders.length == 0">
      <SolidityCode class="source-code">
        {{ "//\n// No function\n//" }}
      </SolidityCode>
    </template>
    <template v-else>
      <template v-if="showReadOnly">
        <template v-if="roContractCallBuilders.length >= 1">
          <SolidityCode class="source-code">
            {{ "//\n// Functions (read-only)\n//" }}
          </SolidityCode>
          <div v-for="(b,i) in roContractCallBuilders" :key="b.fragment.selector">
            <div class="mb-2" style="margin-left: 0.6rem">
              <ContractAbiEntry :contract-call-builder="b" :index="i"
                                @did-update-contract-state="entryDidUpdateContractState"/>
            </div>
          </div>
        </template>
        <template v-else>
          <SolidityCode class="source-code">
            {{ "//\n// No read-only function\n//" }}
          </SolidityCode>
        </template>
      </template>

      <hr v-if="showAll" class="has-background-grey-dark m-0" style="height: 0.5px"/>

      <template v-if="showReadWrite">
        <template v-if="rwContractCallBuilders.length >= 1">
          <SolidityCode class="source-code">
            {{ "//\n// Functions (read-write)\n//" }}
          </SolidityCode>
          <div v-for="(b,i) in rwContractCallBuilders" :key="b.fragment.selector">
            <div class="mb-2" style="margin-left: 0.6rem">
              <ContractAbiEntry :contract-call-builder="b" :index="i"
                                @did-update-contract-state="entryDidUpdateContractState"/>
            </div>
          </div>
        </template>
        <template v-else>
          <SolidityCode class="source-code">
            {{ "//\n// No read-write function\n//" }}
          </SolidityCode>
        </template>
      </template>
    </template>

    <hr v-if="showAll" class="has-background-grey-dark m-0" style="height: 0.5px"/>

    <template v-if="showEvents">
      <SolidityCode class="source-code">
        {{ eventList }}
      </SolidityCode>
    </template>

    <hr v-if="showAll" class="has-background-grey-dark m-0" style="height: 0.5px"/>

    <template v-if="showErrors">
      <SolidityCode class="source-code">
        {{ errorList }}
      </SolidityCode>
    </template>

    <hr v-if="showAll" class="has-background-grey-dark m-0" style="height: 0.5px"/>

    <template v-if="showOther">
      <SolidityCode class="source-code">
        {{ otherList }}
      </SolidityCode>
    </template>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {ethers} from "ethers";
import ContractAbiEntry from "@/dialogs/abi/ContractAbiEntry.vue";
import "prismjs/prism";
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/prism.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-solidity.js";
import SolidityCode from "@/components/SolidityCode.vue";
import {ContractCallBuilder} from "@/dialogs/abi/ContractCallBuilder.ts";
import {ABIController} from "@/components/contract/ABIController.ts";

export enum FragmentType {
  ALL = "all",
  READONLY = "read-only",
  READWRITE = "read-write",
  EVENTS = "events",
  ERRORS = "errors",
  OTHER = "other",
}

export default defineComponent({
  components: {
    SolidityCode,
    ContractAbiEntry,
  },

  props: {
    abiController: {
      type: Object as PropType<ABIController>,
      required: true
    },
    fragmentType: {
      type: String as PropType<FragmentType>,
      default: FragmentType.ALL
    }
  },

  setup: function (props) {

    const showAll = computed(() => props.fragmentType === FragmentType.ALL)
    const showReadOnly = computed(() => showAll.value || props.fragmentType === FragmentType.READONLY)
    const showReadWrite = computed(() => showAll.value || props.fragmentType === FragmentType.READWRITE)
    const showEvents = computed(() => showAll.value || props.fragmentType === FragmentType.EVENTS)
    const showErrors = computed(() => showAll.value || props.fragmentType === FragmentType.ERRORS)
    const showOther = computed(() => showAll.value || props.fragmentType === FragmentType.OTHER)

    const functionFragments = computed(() => {
      const result: ethers.FunctionFragment[] = []
      const i = props.abiController.targetInterface.value
      if (i !== null) {
        for (const f of i.fragments) {
          if (f instanceof ethers.FunctionFragment) {
            result.push(f)
          }
        }
      }
      return result

    })

    const eventFragments = computed(() => {
      const result: ethers.EventFragment[] = []
      const i = props.abiController.targetInterface.value
      if (i !== null) {
        for (const f of i.fragments) {
          if (f instanceof ethers.EventFragment) {
            result.push(f)
          }
        }
      }
      return result
    })

    const eventList = computed(() => {
      let result: string
      if (eventFragments.value.length >= 1) {
        result = "//\n// Events\n//\n\n"
        for (const f of eventFragments.value) {
          result += f.format("full") + "\n"
        }
      } else {
        result = "//\n// No event\n//"
      }
      return result
    })

    const errorFragments = computed(() => {
      const result: ethers.ErrorFragment[] = []
      const i = props.abiController.targetInterface.value
      if (i !== null) {
        for (const f of i.fragments) {
          if (f instanceof ethers.ErrorFragment) {
            result.push(f)
          }
        }
      }
      return result
    })

    const errorList = computed(() => {
      let result: string
      if (errorFragments.value.length >= 1) {
        result = "//\n// Errors\n//\n\n"
        for (const f of errorFragments.value) {
          result += f.format("full") + "\n"
        }
      } else {
        result = "//\n// No error\n//"
      }
      return result
    })

    const otherFragments = computed(() => {
      const result: ethers.Fragment[] = []
      const i = props.abiController.targetInterface.value
      if (i !== null) {
        for (const f of i.fragments) {
          const regular = (
              f instanceof ethers.FunctionFragment ||
              f instanceof ethers.EventFragment ||
              f instanceof ethers.ErrorFragment
          )
          if (!regular) {
            result.push(f)
          }
        }
      }
      return result
    })

    const otherList = computed(() => {
      let result: string
      if (otherFragments.value.length >= 1) {
        result = "//\n// Others\n//\n\n"
        for (const f of otherFragments.value) {
          result += f.format("full") + "\n"
        }
      } else {
        result = "//\n// No other definitions\n//"
      }
      return result
    })

    const contractCallBuilders = computed(() => {
      const result: ContractCallBuilder[] = []
      for (const f of functionFragments.value) {
        result.push(new ContractCallBuilder(f, props.abiController))
      }
      return result
    })

    const roContractCallBuilders = computed(() => {
      const result: ContractCallBuilder[] = []
      for (const b of contractCallBuilders.value) {
        if (b.isReadOnly()) {
          result.push(b)
        }
      }
      return result
    })

    const rwContractCallBuilders = computed(() => {
      const result: ContractCallBuilder[] = []
      for (const b of contractCallBuilders.value) {
        if (!b.isReadOnly()) {
          result.push(b)
        }
      }
      return result
    })

    const entryDidUpdateContractState = () => {
      for (const b of contractCallBuilders.value) {
        if (b.isGetter()) {
          b.execute()
        }
      }
    }

    return {
      showAll,
      showReadOnly,
      showReadWrite,
      showEvents,
      showErrors,
      showOther,
      roContractCallBuilders,
      rwContractCallBuilders,
      eventList,
      errorList,
      otherList,
      entryDidUpdateContractState
    }
  }

})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.abi-container {
  background-color: var(--background-secondary);
  border: 1px solid transparent;
  border-radius: 8px;
  max-height: 400px;
  min-height: 5rem;
  overflow-y: auto;
  padding: 16px;
}

.source-code {
  font-size: 10.5px;
  background-color: var(--background-secondary);
}

</style>
