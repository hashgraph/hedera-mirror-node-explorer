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

    <div id="abi"
         class="h-code-box h-has-page-background mt-2 px-3 py-1"
         style="max-height: 400px;">

        <template v-if="showAll && roContractCallBuilders.length == 0 && rwContractCallBuilders.length == 0">
            <prism language="solidity" style="background-color: #171920; font-size: 0.7rem">
                {{ "//\n// No function\n//"}}
            </prism>
        </template>
        <template v-else>
            <template v-if="showReadOnly">
                <template v-if="roContractCallBuilders.length >= 1">
                    <prism language="solidity" style="background-color: #171920; font-size: 0.7rem">
                        {{ "//\n// Functions (read-only)\n//"}}
                    </prism>
                    <div v-for="(b,i) in roContractCallBuilders" :key="b.fragment.selector">
                        <div class="mb-2" style="margin-left: 0.6rem">
                            <ContractAbiEntry :contract-call-builder="b" :index="i"
                                              @did-update-contract-state="entryDidUpdateContractState"/>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <prism language="solidity" style="background-color: #171920; font-size: 0.7rem">
                        {{ "//\n// No read-only function\n//"}}
                    </prism>
                </template>
            </template>

            <hr v-if="showAll" class="has-background-grey-dark m-0" style="height: 0.5px"/>

            <template v-if="showReadWrite">
                <template v-if="rwContractCallBuilders.length >= 1">
                    <prism language="solidity" style="background-color: #171920; font-size: 0.7rem">
                        {{ "//\n// Functions (read-write)\n//"}}
                    </prism>
                    <div v-for="(b,i) in rwContractCallBuilders" :key="b.fragment.selector">
                        <div class="mb-2" style="margin-left: 0.6rem">
                            <ContractAbiEntry :contract-call-builder="b" :index="i"
                                              @did-update-contract-state="entryDidUpdateContractState"/>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <prism language="solidity" style="background-color: #171920; font-size: 0.7rem">
                        {{ "//\n// No read-write function\n//"}}
                    </prism>
                </template>
            </template>
        </template>

        <hr v-if="showAll" class="has-background-grey-dark m-0" style="height: 0.5px"/>

        <template v-if="showEvents">
            <prism language="solidity" style="background-color: #171920; font-size: 0.7rem">
                {{ eventList }}
            </prism>
        </template>

        <hr v-if="showAll" class="has-background-grey-dark m-0" style="height: 0.5px"/>

        <template v-if="showErrors">
            <prism language="solidity" style="background-color: #171920; font-size: 0.7rem">
                {{ errorList }}
            </prism>
        </template>

        <hr v-if="showAll" class="has-background-grey-dark m-0" style="height: 0.5px"/>

        <template v-if="showOther">
            <prism language="solidity" style="background-color: #171920; font-size: 0.7rem">
                {{ otherList }}
            </prism>
        </template>

    </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {ethers} from "ethers";
import Property from "@/components/Property.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import ByteCodeValue from "@/components/values/ByteCodeValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import StringValue from "@/components/values/StringValue.vue";
import DisassembledCodeValue from "@/components/values/DisassembledCodeValue.vue";
import ContractAbiEntry from "@/components/values/abi/ContractAbiEntry.vue";
import {ContractAnalyzer} from "@/utils/analyzer/ContractAnalyzer";
import "prismjs/prism";
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/prism.js";
import "prismjs/components/prism-clike.js";
import "prismjs/components/prism-solidity.js";
import Prism from "vue-prism-component"
import {ContractCallBuilder} from "@/components/values/abi/ContractCallBuilder";
import ContractAbiDialog from "@/components/values/abi/ContractAbiDialog.vue";

export enum FragmentType {
    ALL = "ALL",
    READONLY = "READONLY",
    READWRITE = "READWRITE",
    EVENTS = "EVENTS",
    ERRORS = "ERRORS",
    OTHER = "OTHER",
}

export default defineComponent({
    components: {
        ContractAbiDialog,
        ContractAbiEntry,
        DisassembledCodeValue,
        StringValue,
        DashboardCard,
        ByteCodeValue,
        InfoTooltip,
        Prism,
        Property
    },

    props: {
        contractAnalyzer: {
            type: Object as PropType<ContractAnalyzer>,
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
            const i = props.contractAnalyzer.interface.value
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
            const i = props.contractAnalyzer.interface.value
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
            const i = props.contractAnalyzer.interface.value
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
            const i = props.contractAnalyzer.interface.value
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
                result.push(new ContractCallBuilder(f, props.contractAnalyzer))
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

<style/>
