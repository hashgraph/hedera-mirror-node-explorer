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
                <p class="has-text-grey">**Notice: CBOR-encoded metadata will be automatically omitted during the disassmeblation</p>
            </div>
        
            <button id="disassmbleBtn" v-if="isCustom"
                    class="button is-white is-small has-text-right mr-3"
                    @click="handleDisassembleBytecode">
                DISASSEMBLE
            </button>
        </div>

            
        <div id="disassembly" class="mt-4 py-4 px-2 is-flex analyzed-data-box">
            <div v-if="disassembly && disassembly.length > 0" v-for="opcode in disassembly" :key="opcode.index16" class="is-flex" style="gap: 0.5rem">
                <p>[{{ opcode.index16 }}]:</p>

                <p>{{ opcode.hex }} - {{ opcode.mnemonic }}</p>

                <p v-if="opcode.operand.length > 0" class="ml-">{{ `0x${opcode.operand.join("")}` }}</p>
            </div>
            <p class="has-text-grey is-italic has-text-weight-medium" v-else>{{ disassembledError }}</p>

        </div>
    </div>


    <div  v-else-if="toolType === 2" class="mt-3">

    <div class="header-wrapper">
        <div>
            <p class="header-title">Bytecode to Solidity Decompiler</p>
            <p class="has-text-grey">Attempts to decode the low level Contract Bytecode to Solidity smart contract.</p>
            <p class="has-text-grey">**Attribution: This decompiler uses the 
                <a class="has-text-grey is-underlined has-text-weight-medium" 
                    href="https://github.com/Jon-Becker/heimdall-rs/tree/main" 
                    target="_blank"
                >
                    heimdall-rs</a>,
                an EVM bytecode tool, created and mainted by 
                <a class="has-text-grey is-underlined has-text-weight-medium"
                    href="https://twitter.com/beckerrjon" target="_blank">
                    @beckerrjon</a>
            </p>
        </div>

        <button id="decompileBtn" v-if="isCustom"
                class="button is-white is-small has-text-right mr-3"
                @click="handleDecompileBytecode">
            DECOMPILE
        </button>
    </div>

        
    <div class="mt-4 py-1 px-2 is-flex analyzed-data-box">
        <prism language="scss" v-if="decompiledContract">
            <pre style="background: none">{{decompiledContract}}</pre>
        </prism>
        <p class="has-text-grey is-italic has-text-weight-medium py-3" v-else>{{ decompiledError }}</p>
    </div>
    </div>
</template>
  
<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, ref, watch, computed, onUpdated} from 'vue';
import {Disassembler} from '@/utils/bytecode_tools/disassembler/BytecodeDisassembler'
import { DisassembledOpcodeOutput } from '@/utils/bytecode_tools/disassembler/Utils';
import {DecompiledResult, Decompiler} from '@/utils/bytecode_tools/decompiler/BytecodeDecompiler'
import "prismjs/prism";
import "prismjs/themes/prism-tomorrow.css"
import "prismjs/components/prism-scss.js";
import Prism from "vue-prism-component"

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
    components: {Prism},

    setup(props) {
        const disassembly = ref<DisassembledOpcodeOutput[]|null>(null)
        const disassembledError = ref<string|null>("Input bytecode to start.")
        const decompiledContract = ref<string|null>(null)
        const decompiledError = ref<string|null>("Input bytecode to start.")

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

        const handleDecompileBytecode = async () => {
            const BYTECODE_REGEX = /^(0x)?([0-9a-fA-F]{2})+$/;
            if (BYTECODE_REGEX.test(props.byteCode)) {
                const decompiledResult: DecompiledResult = await Decompiler.decompile(props.byteCode)
                if (decompiledResult.error) {
                    decompiledContract.value = null
                    decompiledError.value = decompiledResult.error;
                } else if (decompiledResult.decompiled) {
                    decompiledError.value = null
                    decompiledContract.value = decompiledResult.decompiled
                }
            } else {
                decompiledContract.value = null
                decompiledError.value = props.byteCode === "" ? "No data found..." : "Invalid bytecode"
            }
        }

        onUpdated(() => {
            if (!props.isCustom && !decompiledContract.value && !disassembly.value) {
                handleDisassembleBytecode();
                handleDecompileBytecode();
            }
        })

        return {
            disassembly,
            handleDecompileBytecode,
            handleDisassembleBytecode,
            decompiledError,
            decompiledContract,
            disassembledError
        }
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
    max-height: 600px; 
    overflow-y: auto; 
    font-family: 
    novamonoregular, monospace; 
    min-height: 150px
}

</style>
