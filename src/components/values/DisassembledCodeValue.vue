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
        <div id="disassembly" class="mt-4 py-4 px-2 is-flex analyzed-data-box">
            <div v-if="disassembly && disassembly.length > 0" v-for="opcode in disassembly" :key="opcode.index16">
                <OpcodeValue :opcode="opcode"/>
            </div>
            <p class="has-text-grey is-italic has-text-weight-medium" v-else>{{ disassembledError }}</p>
        </div>
</template>
  
<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, ref, onMounted, watch} from 'vue';
import {Disassembler} from '@/utils/bytecode_tools/disassembler/BytecodeDisassembler'
import { DisassembledOpcodeOutput } from '@/utils/bytecode_tools/disassembler/utils/helpers';
import OpcodeValue from "@/components/values/OpcodeValue.vue";

export default defineComponent({
    name: 'DisassembledCodeValue',
    components: {OpcodeValue},

    props: {
        byteCode: {
            type: String,
            default: ""
        }
    },

    setup(props) {
        const disassembly = ref<DisassembledOpcodeOutput[]|null>(null)
        const disassembledError = ref<string|null>("Input bytecode to start.")

        onMounted(() => handleDisassembleBytecode())
        watch(() => props.byteCode, () => handleDisassembleBytecode())

        const handleDisassembleBytecode = () => {
            const BYTECODE_REGEX = /^(0x)?([0-9a-fA-F]{2})+$/;
            if (BYTECODE_REGEX.test(props.byteCode)) {
                disassembly.value = Disassembler.disassemble(props.byteCode)
                disassembledError.value = null
            } else {
                disassembly.value = null
                disassembledError.value = props.byteCode === "" ? "No data found..." : "Invalid bytecode"
            }
        }

        return {
            disassembly,
            handleDisassembleBytecode,
            disassembledError,
        }
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

.analyzed-data-box {
    border: 0.5px solid white;
    gap: 0.42rem;
    flex-direction: column; 
    max-height: 20rem;
    overflow-y: auto; 
    font-family: 
    novamonoregular, monospace; 
    min-height: 5rem
}

</style>
