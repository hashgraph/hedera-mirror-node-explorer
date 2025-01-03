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

  <DashboardCard v-if="logs?.length" class="h-card" collapsible-key="contractEvents">
    <template v-slot:title>
      <span class="h-is-secondary-title">Events</span>
    </template>

    <template v-slot:control v-if="logs.length > 2">
      <SelectView v-model="pageSize" :small="true">
        <option v-for="n of actualSizeOptions" :key="n" :value="n">
          {{ (n >= logs?.length) ? 'Show all items' : 'Show ' + n + ' items' }}
        </option>
      </SelectView>
    </template>
    <template v-slot:content>
      <template v-for="l in nbLogDisplayed" :key="l">
        <ContractResultLogEntry :log="logs[logCursor + l - 1]" :block-number="blockNumber"
                                :transaction-hash="transactionHash"/>
        <hr class="h-card-separator" style="height: 1px; background: grey"/>
      </template>

      <div v-if="isPaginated" class="is-flex is-justify-content-flex-end">
        <o-pagination
            :total="logs.length"
            v-model:current="currentPage"
            :range-before="1"
            :range-after="1"
            :per-page="pageSize"
            aria-next-label="Next page"
            aria-previous-label="Previous page"
            aria-page-label="Page"
            aria-current-label="Current page"
        >
        </o-pagination>
      </div>

    </template>

  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, PropType, Ref, ref, watch} from "vue";
import DashboardCard from "@/components/DashboardCard.vue";
import ContractResultLogEntry from "@/components/contract/ContractResultLogEntry.vue";
import {ContractLog} from "@/schemas/MirrorNodeSchemas";
import {AppStorage} from "@/AppStorage";
import SelectView from "@/components/SelectView.vue";

const DEFAULT_PAGE_SIZE = 3

export default defineComponent({

  name: "ContractResultLogs",

  components: {
    SelectView,
    ContractResultLogEntry,
    DashboardCard
  },

  props: {
    logs: Object as PropType<Array<ContractLog> | undefined>,
    blockNumber: {
      type: Number,
    },
    transactionHash: {
      type: String
    }
  },

  setup(props) {
    const sizeOptions: Array<number> = [3, 5, 10, 15, 20, 30]
    const actualSizeOptions: Ref<Array<number>> = ref([])

    const currentPage = ref(1)
    const pageSize = ref(AppStorage.getLogsTablePageSize() ?? DEFAULT_PAGE_SIZE)
    watch(pageSize, () => {
      AppStorage.setLogsTablePageSize(pageSize.value)
      currentPage.value = 1
    })

    onMounted(() => updatePageSize())
    watch(() => props.logs, () => updatePageSize())
    const updatePageSize = () => {
      let options: Array<number> = sizeOptions
      for (let i = 0; i < options.length - 1; i++) {
        if (options[i] > (props.logs?.length ?? 0)) {
          options = options.slice(0, i + 1)
          pageSize.value = Math.min(pageSize.value, options[i])
          break
        }
      }
      actualSizeOptions.value = options
    }

    const isPaginated = computed(() => props.logs?.length && props.logs?.length > pageSize.value)
    const logCursor = computed(() => (currentPage.value - 1) * pageSize.value)
    const nbLogDisplayed = computed(() => {
      return props.logs?.length ? Math.min(pageSize.value, props.logs?.length - logCursor.value) : 0
    })

    return {
      actualSizeOptions,
      currentPage,
      isPaginated,
      logCursor,
      pageSize,
      nbLogDisplayed
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>
