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
  <EVMAddress :address="senderAddress ?? undefined" :compact="false" :show-id="true" :show-none="false"/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from "vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import {ContractResultByTransactionIdCache} from "@/utils/cache/ContractResultByTransactionIdCache";

export default defineComponent({
  name: "InnerSenderEVMAddress",
  components: {EVMAddress},
  props: {
    transactionId: String,
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', ref(false))

    const contractResultLookup = ContractResultByTransactionIdCache.instance.makeLookup(computed(() => props.transactionId ?? null))
    onMounted(() => contractResultLookup.mount())
    onBeforeUnmount(() => contractResultLookup.unmount())

    const senderAddress = computed(() => {
      return contractResultLookup.entity.value?.from ?? null
    })

    return {
      isSmallScreen,
      senderAddress
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
