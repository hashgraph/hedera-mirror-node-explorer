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
  <div class="is-flex" style="font-family: novamonoregular, monospace; gap: 0.5rem">
    <p class="has-text-grey">{{ opcode.index16 }}:</p>
    <p v-if="showHexaOpcode" class="h-is-extra-text">{{ opcode.hex }}</p>
    <p v-if="showHexaOpcode" class="has-text-grey">-</p>
    <p :class="{'has-text-grey':isInvalidOpcode}">{{ opcode.mnemonic }}</p>
    <div v-if="opcode.operand.length > 0">
      <ContractLink v-if="contract" :contract-id="displayAddress"/>
      <AccountLink v-else-if="account" :account-id="displayAddress"/>
      <p v-else>{{ displayAddress }}</p>
    </div>
    <div v-if="contract || account" class="is-flex has-text-grey">
      <p class="mr-2">//</p>
      <ContractLink v-if="contract" :contract-id="contract.contract_id"/>
      <AccountLink v-else-if="account" :account-id="account.account"/>
      <p v-else/>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, PropType, ref, Ref} from 'vue';
import {DisassembledOpcodeOutput, Helpers} from '@/utils/bytecode_tools/disassembler/utils/helpers';
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import ContractLink from "@/components/values/link/ContractLink.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import {AccountBalanceTransactions, ContractResponse} from "@/schemas/MirrorNodeSchemas";

export default defineComponent({
  name: 'OpcodeValue',
  components: {AccountLink, ContractLink},

  props: {
    opcode: {
      type: Object as PropType<DisassembledOpcodeOutput>,
      required: true
    },
    showHexaOpcode: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const displayAddress = computed(() => {
      return `0x${props.opcode.operand.join("")}`
    })

    const isInvalidOpcode = computed(() => props.opcode.mnemonic === Helpers.INVALID_OPCODE_MNEMONIC)

    const contract: Ref<ContractResponse | null> = ref(null)
    const account: Ref<AccountBalanceTransactions | null> = ref(null)

    onMounted(() => {
      if (props.opcode.mnemonic === 'PUSH20') {
        ContractByAddressCache.instance.lookup(displayAddress.value)
            .then((result) => {
              contract.value = result
              if (!result) {
                AccountByAddressCache.instance.lookup(displayAddress.value)
                    .then((result) => account.value = result)
              }
            })
      }
    })

    return {
      displayAddress,
      isInvalidOpcode,
      contract,
      account,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
