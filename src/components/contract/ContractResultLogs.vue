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
      <div class="is-flex is-justify-content-flex-end is-align-items-baseline">
        <o-field>
          <o-select v-model="pageSize" class="h-is-text-size-1">
            <option v-for="n in Math.min(MAX_PAGE_SIZE, logs?.length)" :key="n" :value="n">
              {{ (n === logs?.length) ? 'Show all' : 'Show ' + n + (n === 1 ? ' line' :' lines') }}
            </option>
          </o-select>
        </o-field>
        <button id="prev-block-button" :disabled="logCursor===0"
                class="button is-white is-small ml-4" @click="logCursor -= pageSize">&lt; PREVIOUS
        </button>
        <button id="next-block-button" :disabled="logCursor >= logs.length - pageSize"
                class="button is-white is-small ml-4" @click="logCursor += pageSize">NEXT &gt;
        </button>
      </div>
    </template>

    <template v-slot:content>
      <template v-for="l in nbLogDisplayed" :key="l">
        <hr v-if="l !== 1" class="h-card-separator" style="height: 1px; background: grey"/>
        <ContractResultLogEntry :log="logs[logCursor + l - 1]"/>
      </template>
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
    const logCursor = ref(0)
    const pageSize = ref(DEFAULT_PAGE_SIZE)
    watch(pageSize, () => logCursor.value = 0)

    onMounted(() => updatePageSize())
    watch(() => props.logs, () => updatePageSize())
    const updatePageSize = () => {
      pageSize.value = Math.min(pageSize.value, props.logs?.length ?? 0)
    }

    const nbLogDisplayed = computed(() => {
      return props.logs?.length ? Math.min(pageSize.value, props.logs?.length - logCursor.value) : 0
    })

    return {
      MAX_PAGE_SIZE,
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

.columns button{
  vertical-align: initial;
}
.button.is-small {
  font-size: 0.65rem;
}

</style>