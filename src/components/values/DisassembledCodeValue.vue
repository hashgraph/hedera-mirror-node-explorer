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
  <div v-if="disassembly" id="disassembly">
    <template v-if="disassembly.length > 0">
      <div v-for="opcode in disassembly" :key="opcode.index16">
        <OpcodeValue :opcode="opcode" :show-hexa-opcode="showHexaOpcode"/>
      </div>
    </template>
    <p v-else class="has-text-grey">{{ disassembledError }}</p>
  </div>

  <span v-else-if="initialLoading"/>

  <span v-else class="has-text-grey">None</span>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from 'vue';
import {Disassembler} from '@/utils/bytecode_tools/disassembler/BytecodeDisassembler'
import {DisassembledOpcodeOutput} from '@/utils/bytecode_tools/disassembler/utils/helpers';
import OpcodeValue from "@/components/values/OpcodeValue.vue";
import {initialLoadingKey} from "@/AppKeys";

export default defineComponent({
  name: 'DisassembledCodeValue',
  components: {OpcodeValue},

  props: {
    byteCode: {
      type: String,
      default: ""
    },
    showHexaOpcode: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))

    const isValidBytecode = computed(() => {
      const BYTECODE_REGEX = /^(0x)?([0-9a-fA-F]{2})+$/;
      return BYTECODE_REGEX.test(props.byteCode)
    })

    const disassembly = computed<DisassembledOpcodeOutput[] | null>(
        () => isValidBytecode.value ? Disassembler.disassemble(props.byteCode) : null)

    const disassembledError = computed<string | null>(() =>
        isValidBytecode.value ? null : (props.byteCode === "" ? "No data found..." : "Invalid bytecode")
    )

    return {
      initialLoading,
      disassembly,
      disassembledError,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
