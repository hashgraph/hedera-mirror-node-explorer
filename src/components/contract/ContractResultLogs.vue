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
          <o-select v-model="nbLogLines" class="h-is-text-size-1">
            <option v-for="n in Math.min(MAX_LOG_LINES, Math.ceil(logs?.length / 2))" :key="n" :value="n">
              {{ (n === Math.ceil(logs?.length / 2)) ? 'Show all' : 'Show ' + n + (n === 1 ? ' line' :' lines') }}
            </option>
          </o-select>
        </o-field>
        <button id="prev-block-button" :disabled="logCursor===0"
                class="button is-white is-small ml-4" @click="logCursor -= 1">&lt; PREVIOUS
        </button>
        <button id="next-block-button" :disabled="logCursor >= logs.length - 2 * nbLogLines"
                class="button is-white is-small ml-4" @click="logCursor += 1">NEXT &gt;
        </button>
      </div>
    </template>

    <template v-slot:leftContent>

      <template v-for="l in nbLogLines" :key="l">
        <ContractResultLogEntry :log="logs[logCursor + l - 1]"/>
        <hr v-if="l < nbLogLines" class="h-card-separator" style="height: 1px; background: grey"/>
      </template>

    </template>

    <template v-slot:rightContent>

      <template v-for="l in nbLogLines" :key="l">
        <ContractResultLogEntry v-if="logCursor + nbLogLines + l - 1 < logs.length"
                           :log="logs[logCursor + nbLogLines + l - 1]"/>
        <hr v-if="logCursor + nbLogLines + l - 1 < logs.length - 1 && l < nbLogLines"
            class="h-card-separator" style="height: 1px; background: grey"/>
      </template>

    </template>

  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onMounted, PropType, ref, watch} from "vue";
import DashboardCard from "@/components/DashboardCard.vue";
import ContractResultLogEntry from "@/components/contract/ContractResultLogEntry.vue";
import {ContractResultLog} from "@/schemas/HederaSchemas";

const NB_LOG_LINES = 2
const MAX_LOG_LINES = 10

export default defineComponent({
  name: "ContractResultLogs",
  components: {ContractResultLogEntry, DashboardCard},
  props: {
    logs: Object as PropType<Array<ContractResultLog> | undefined>
  },
  setup(props) {
    const logCursor = ref(0)
    const nbLogLines = ref(NB_LOG_LINES)
    watch(nbLogLines, () => logCursor.value = 0)

    onMounted(() => updateNbLogLines())
    watch(() => props.logs, () => updateNbLogLines())
    const updateNbLogLines = () => {
      const nbLinesForAll = Math.ceil((props.logs?.length ?? 0) / 2)
      nbLogLines.value = Math.min(nbLogLines.value, nbLinesForAll)
    }

    return {
      NB_LOG_LINES,
      MAX_LOG_LINES,
      logCursor,
      nbLogLines,
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