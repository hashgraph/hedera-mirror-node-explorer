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
    <div  v-if="toolType === 1" class="mt-3">

        <div class="header-wrapper">
            <div>
                <p class="header-title">Bytecode to Opcode Disassembler</p>
                <p class="has-text-grey">Attempts to decode the low level Contract Bytecode to EVM Opcodes.</p>
                <p class="has-text-grey">**Notice**: CBOR-encoded metadata will be automatically omitted during the disassmeblation</p>
            </div>
        
            <button id="disassmbleBtn" v-if="isCustom"
                    class="button is-white is-small has-text-right mr-3"
                    @click="finalBytecode = byteCode">
                    DISASSEMBLE
            </button>
        </div>

            
        <div id="disassembly" class="mt-4 py-1 px-2 is-flex analyzed-data-box">
            <div v-if="opcodes && opcodes.length > 0" v-for="opcode in opcodes" :key="opcode.index16" class="is-flex" style="gap: 0.5rem">
                <p>[{{ opcode.index16 }}]:</p>

                <p>{{ opcode.hex }} - {{ opcode.mnemonic }}</p>

                <p v-if="opcode.operand.length > 0" class="ml-">{{ `0x${opcode.operand.join("")}` }}</p>
            </div>

            <p class="has-text-grey is-italic has-text-weight-medium" v-else>no opcodes found...</p>
        </div>
    </div>


    <div  v-else-if="toolType === 2" class="mt-3">

    <div class="header-wrapper">
        <div>
            <p class="header-title">Bytecode to Solidity Decompiler</p>
            <p class="has-text-grey">Attempts to decode the low level Contract Bytecode to Solidity smart contract.</p>
        </div>

        <button v-if="isCustom"
                class="button is-white is-small has-text-right mr-3"
                @click="finalBytecode = byteCode">
                DECOMPILE
        </button>
    </div>

        
    <div class="mt-4 py-1 px-2 is-flex analyzed-data-box">
        <p class="has-text-grey is-italic has-text-weight-medium">WIP...</p>
    </div>
    </div>
</template>
  
<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, ref, watch, computed} from 'vue';
import {Disassembler} from '@/utils/bytecode_tools/disassembler/BytecodeDisassembler.ts'

export default defineComponent({
    name: 'BytecodeTools',

    props: {
        byteCode: {
            type: String || undefined,
            required: true,
        },
        toolType: {
            type: Number, // 1 - disassembler, 2 - decompiler
            required: true,
        },
        isCustom: {
            type: Boolean,
            default: false,
        }
    },

    setup(props) {
        const finalBytecode = props.isCustom ? ref("") : ref(props.byteCode)

        const opcodes: DisassembledOpcodeOutput[] = computed(() => {
            if (finalBytecode !== "") {
                return Disassembler.disassemble(finalBytecode.value)
            } else {
                return []
            }
        })

        return {opcodes, finalBytecode}
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

.header-wrapper {
    display: flex;
    justify-content: space-between;
    width: 100%;
    align-items: center;
}

.header-title {
    font-size: 0.9rem;
    font-weight: 500;
}

.analyzed-data-box {
    border: 0.5px solid white; 
    gap: 0.42rem; 
    flex-direction: column; 
    max-height: 300px; 
    overflow-y: auto; 
    font-family: 
    novamonoregular, monospace; 
    min-height: 150px
}

</style>
