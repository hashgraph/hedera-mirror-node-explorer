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

  <PageFrameV2 page-title="Topics">
    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Recent Topics</span>
      </template>
      <template v-slot:content>
        <TopicTable v-bind:controller="transactionTableController"/>
      </template>
    </DashboardCard>
  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import TopicTable from "@/components/topic/TopicTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import {TransactionTableController} from "@/components/transaction/TransactionTableController";
import {TransactionResult, TransactionType} from "@/schemas/MirrorNodeSchemas";
import {useRouter} from "vue-router";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'Topics',

  props: {
    network: String
  },

  components: {
    PageFrameV2,
    DashboardCard,
    TopicTable
  },

  setup(props) {
    const isMediumScreen = inject('isMediumScreen', true)


    const router = useRouter()
    const pageSize = ref(isMediumScreen ? 15 : 5)
    const transactionTableController = new TransactionTableController(
        router,
        pageSize,
        TransactionType.CONSENSUSCREATETOPIC,
        TransactionResult.SUCCESS,
        AppStorage.TOPIC_TABLE_PAGE_SIZE_KEY
    )
    onMounted(() => transactionTableController.mount())
    onBeforeUnmount(() => transactionTableController.unmount())

    watch(() => props.network, () => {
      transactionTableController.reset()
    })

    return {
      transactionTableController,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
