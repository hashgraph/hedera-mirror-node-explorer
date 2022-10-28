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
  <div :style="containerStyle()">
    <template v-for="line in lines" :key="line.seqNb">
      <div :style="lineStyle(line)">
        <template v-if="line.innerKeyBytes() !== null">
          <HexaValue :byte-string="line.innerKeyBytes()"/>
          <div class="h-is-extra-text h-is-text-size-3">{{ line.innerKeyType() }}</div>
        </template>
        <template v-else>
          <div>{{ lineText(line) }}</div>
        </template>
      </div>
    </template>
  </div>
</template>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent} from "vue";
import {ComplexKeyLine} from "@/utils/ComplexKeyLine";
import {hexToByte} from "@/utils/B64Utils";
import hashgraph from "@hashgraph/proto/lib/proto";
import HexaValue from "@/components/values/HexaValue.vue";

export default defineComponent({
  name: "ComplexKeyValue",
  components: {HexaValue},
  props: {
    keyBytes: String,
    showNone: {
      type: Boolean,
      default: false
    },
  },
  setup(props) {

    const key = computed(() => {
      let result: hashgraph.proto.Key|null
      if (props.keyBytes) {
        const keyByteArray = hexToByte(props.keyBytes)
        try {
          result = keyByteArray !== null ? hashgraph.proto.Key.decode(keyByteArray) : null
        } catch(reason) {
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

    const containerStyle = (): Record<string, string> => {
      const n = maxLevel.value + 1
      const offset = 20
      return {
        display: "grid",
        gridTemplateColumns: "repeat(" + n + ", " + offset + "px) auto repeat(" + n + ", " + offset + "px)",
        rowGap: "0.50rem"
      }
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
        result = line.key.key + "(" + line.key.thresholdKey.threshold + " of " + childCount + ")"
      } else if (line.key.keyList) {
        const childCount = line.key.keyList.keys?.length ?? 0
        result = line.key.key + "(" + childCount + ")"
      } else {
        result = line.key.key ?? "?"
      }
      return result
    }

    return {
      lines,
      containerStyle,
      lineStyle,
      lineText
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
