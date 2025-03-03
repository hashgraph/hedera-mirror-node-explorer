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

  <PageFrameV2 page-title="Transactions">

    <DashboardCardV2>
      <template #title>
        <span>Recent Transactions</span>
      </template>
      <template #left-control>
        <PlayPauseButton :controller="transactionTableController"/>
      </template>
      <template #right-control>
        <TransactionFilterSelect v-model:selected-filter="transactionType"/>
      </template>
      <template #content>
        <TransactionTable :controller="transactionTableController"/>
      </template>
    </DashboardCardV2>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {onBeforeUnmount, onMounted, Ref, ref} from 'vue';

import TransactionTable from "@/components/transaction/TransactionTable.vue";
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue";
import {useRouter} from "vue-router";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {TransactionTableControllerXL} from "@/components/transaction/TransactionTableControllerXL";
import {AppStorage} from "@/AppStorage";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";

defineProps({
  network: String
})

const router = useRouter()

//
// transactionTableController
//

const accountId: Ref<string | null> = ref(null)
const pageSize = ref(15)
const transactionTableController = new TransactionTableControllerXL(
    router,
    accountId,
    pageSize,
    false,
    AppStorage.TRANSACTION_TABLE_PAGE_SIZE_KEY
)
onMounted(() => transactionTableController.mount())
onBeforeUnmount(() => transactionTableController.unmount())

const transactionType = transactionTableController.transactionType

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
