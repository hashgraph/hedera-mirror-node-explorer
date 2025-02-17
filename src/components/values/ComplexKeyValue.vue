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
  <div v-if="key">
    <div v-if=" !details && maxLevel >= MAX_INLINE_LEVEL && adminKeyRoute">
      <span>{{ 'Complex Key (' + (maxLevel + 1) + ' levels)' }}</span>
      <router-link v-if="adminKeyRoute" :to="adminKeyRoute">
        <span class="ml-2 has-text-grey">
          See details
        </span>
      </router-link>
    </div>
    <div v-else :style="containerStyle(details ? 30 : 20)">
      <template v-for="line in lines" :key="line.seqNb">
        <div :style="lineStyle(line)">
          <template v-if="line.innerKeyBytes() !== null">
            <div v-if="details" :class="lineClass(line)">
              <span class="h-is-extra-text">{{ line.innerKeyType() }}</span>
              <span class="h-is-monospace has-text-grey">{{ ':&#8239;' + line.innerKeyBytes() }}</span>
            </div>
            <div v-else>
              <HexaDumpValue :byte-string="line.innerKeyBytes()"/>
              <div class="h-is-extra-text">{{ line.innerKeyType() }}</div>
            </div>
          </template>
          <template v-else-if="line.contractId() !== null">
            Contract:
            <ContractLink :contract-id="line.contractId()"/>
          </template>
          <template v-else-if="line.delegatableContractId() !== null">
            Delegatable Contract:
            <ContractLink :contract-id="line.delegatableContractId()"/>
          </template>
          <template v-else>
            <div v-if="details && line.level" :class="lineClass(line)">{{ lineText(line) }}</div>
            <div v-else>{{ lineText(line) }}</div>
          </template>
        </div>
      </template>
    </div>
  </div>
  <div v-else-if="showNone && !initialLoading">
    <div class="has-text-grey">None</div>
  </div>
  <div v-else/>

</template>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, PropType, ref} from "vue";
import {ComplexKeyLine} from "@/utils/ComplexKeyLine";
import {hexToByte} from "@/utils/B64Utils";
import * as hashgraph from "@hashgraph/proto";
import HexaDumpValue from "@/components/values/HexaDumpValue.vue";
import ContractLink from "@/components/values/link/ContractLink.vue";
import {initialLoadingKey} from "@/AppKeys";
import {routeManager} from "@/router";

const MAX_INLINE_LEVEL = 1

const lineClasses: Array<string> = [
  "has-plus",
  "has-bullet",
  "has-dash",
  "has-circle",
]

const props = defineProps({
  keyBytes: {
    type: String as PropType<string | null>,
    default: null
  },
  accountId: {
    type: String as PropType<string | null>,
    default: null
  },
  details: {
    type: Boolean,
    default: false
  },
  showNone: {
    type: Boolean,
    default: false
  },
})

const key = computed(() => {
  let result: hashgraph.proto.Key | null
  if (props.keyBytes) {
    const keyByteArray = hexToByte(props.keyBytes)
    try {
      result = keyByteArray !== null ? hashgraph.proto.Key.decode(keyByteArray) : null
    } catch (reason) {
      console.warn("Failed to decode key:" + reason)
      result = null
    }
  } else {
    result = null
  }
  return result
})

const lines = computed(() => {
  return key.value !== null ? ComplexKeyLine.flattenComplexKey(key.value) : []
})

const maxLevel = computed(() => {
  let result = 0
  for (const line of lines.value) {
    result = Math.max(result, line.level)
  }
  return result
})

const containerStyle = (offset: number): Record<string, string> => {
  const n = maxLevel.value + 1
  return {
    display: "grid",
    gridTemplateColumns: "repeat(" + n + ", " + offset + "px) auto repeat(" + n + ", " + offset + "px)",
    rowGap: "0.50rem"
  }
}

const lineClass = (line: ComplexKeyLine) => {
  return lineClasses[line.level % lineClasses.length]
}

const lineStyle = (line: ComplexKeyLine): Record<string, string> => {
  const n = maxLevel.value + 1
  const start = line.level + 1
  const end = start + n + 1
  return {
    'grid-column-start': start.toString(),
    'grid-column-end': end.toString(),
  }
}

const lineText = (line: ComplexKeyLine): string => {
  let result: string
  if (line.key.thresholdKey) {
    const childCount = line.key.thresholdKey.keys?.keys?.length ?? 0
    result = "THRESHOLD (" + line.key.thresholdKey.threshold + " of " + childCount + ")"
  } else if (line.key.keyList) {
    const childCount = line.key.keyList.keys?.length ?? 0
    result = "LIST (all of " + childCount + ')'
  } else {
    result = line.key.key ?? "?"
  }
  return result
}

const adminKeyRoute = computed(() => {
  return props.accountId ? routeManager.makeRouteToAdminKey(props.accountId) : null
})

const initialLoading = inject(initialLoadingKey, ref(false))

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.has-bullet:before {
  content: "\2022\202F";
  font-weight: lighter;
  color: grey;
}

.has-dash:before {
  content: "\2043\202F";
  font-weight: lighter;
  color: grey;
}

.has-plus:before {
  content: "\002B\202F";
  font-weight: lighter;
  color: grey;
}

.has-circle:before {
  content: "\25E6\202F";
  font-weight: lighter;
  color: grey;
}

</style>