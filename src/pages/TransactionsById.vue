// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>

  <PageFrameV2 page-title="Transactions by ID">

    <DashboardCardV2>
      <template #title>
        {{ `Transactions with ID ${normalizedTransactionId}` }}
      </template>
      <template #content>
        <TransactionByIdTable :transactions="transactions"/>
      </template>
    </DashboardCardV2>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted} from 'vue';
import TransactionByIdTable from "@/components/transaction/TransactionByIdTable.vue";
import {TransactionID} from "@/utils/TransactionID";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {TransactionGroupCache} from "@/utils/cache/TransactionGroupCache";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";

const props = defineProps({
  network: String,
  transactionId: String
})

const normalizedTransactionId = computed(() => {
  return props.transactionId ? TransactionID.normalizeForDisplay(props.transactionId) : "?";
})

const paramTransactionId = computed(() => {
  return props.transactionId ? TransactionID.normalize(props.transactionId) : null
})

const groupLookup = TransactionGroupCache.instance.makeLookup(paramTransactionId)
onMounted(() => groupLookup.mount())
onBeforeUnmount(() => groupLookup.unmount())

const transactions = computed(() => groupLookup.entity.value ?? [])

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
