<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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

  <DashboardCard v-if="logs?.length" class="h-card">
    <template v-slot:title>
      <span class="h-is-secondary-title">Logs</span>
    </template>

    <template v-slot:control v-if="logs.length > 2">
      <o-field>
        <o-select v-model="pageSize" class="h-is-text-size-1">
          <option v-for="n in Math.min(MAX_PAGE_SIZE, logs?.length)" :key="n" :value="n">
            {{ (n === logs?.length) ? 'Show all items' : 'Show ' + n + (n === 1 ? ' item' :' items') }}
          </option>
        </o-select>
      </o-field>
    </template>

    <template v-slot:content>
      <template v-for="l in nbLogDisplayed" :key="l">
        <ContractResultLogEntry :log="logs[logCursor + l - 1]"/>
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

import {computed, defineComponent, onMounted, PropType, ref, watch} from "vue";
import DashboardCard from "@/components/DashboardCard.vue";
import ContractResultLogEntry from "@/components/contract/ContractResultLogEntry.vue";
import {ContractResultLog} from "@/schemas/HederaSchemas";

const DEFAULT_PAGE_SIZE = 2
const MAX_PAGE_SIZE = 5

export default defineComponent({
  name: "ContractResultLogs",
  components: {ContractResultLogEntry, DashboardCard},
  props: {
    logs: Object as PropType<Array<ContractResultLog> | undefined>
  },
  setup(props) {
    const currentPage = ref(1)

    const pageSize = ref(DEFAULT_PAGE_SIZE)
    watch(pageSize, () => currentPage.value = 1)

    onMounted(() => updatePageSize())
    watch(() => props.logs, () => updatePageSize())
    const updatePageSize = () => {
      pageSize.value = Math.min(pageSize.value, props.logs?.length ?? 0)
    }

    const isPaginated = computed(() => props.logs?.length && props.logs?.length > pageSize.value)
    const logCursor = computed(() => (currentPage.value - 1) * pageSize.value)
    const nbLogDisplayed = computed(() => {
      return props.logs?.length ? Math.min(pageSize.value, props.logs?.length - logCursor.value) : 0
    })

    return {
      MAX_PAGE_SIZE,
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