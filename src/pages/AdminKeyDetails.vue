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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Admin Key for Account </span>
        <span class="h-is-secondary-text">{{ normalizedAccountId ?? "" }}</span>
        <span v-if="accountChecksum" class="has-text-grey" style="font-size: 28px">-{{ accountChecksum }}</span>
      </template>

      <template v-slot:content>
        <div v-if="key !== null">
          <div :style="containerStyle()" class="h-is-property-text">
            <template v-for="line in lines" :key="line.seqNb">
              <div :style="lineStyle(line)">
                <template v-if="line.innerKeyBytes() !== null">
                  <div :class="lineClass(line)">
                    <span class="h-is-extra-text">{{ line.innerKeyType() }}</span>
                    <span class="is-family-monospace has-text-grey">{{ ':&#8239;' + line.innerKeyBytes() }}</span>
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
                  <div :class="lineClass(line)">
                    {{ lineText(line) }}
                  </div>
                </template>
              </div>
            </template>
          </div>
        </div>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {PathParam} from "@/utils/PathParam";
import {AccountLoader} from "@/components/account/AccountLoader";
import hashgraph from "@hashgraph/proto/lib/proto";
import {hexToByte} from "@/utils/B64Utils";
import {ComplexKeyLine} from "@/utils/ComplexKeyLine";
import ContractLink from "@/components/values/ContractLink.vue";

const lineClasses: Array<string> = [
  "has-bullet",
  "has-dash",
  "has-circle",
  "has-plus",
]

export default defineComponent({

  name: 'AdminKeyDetails',

  components: {
    ContractLink,
    Footer,
    DashboardCard,
  },

  props: {
    accountId: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    //
    // account
    //

    const accountLocator = computed(() => PathParam.parseAccountIdOrAliasOrEvmAddress(props.accountId))
    const accountLoader = new AccountLoader(accountLocator)
    onMounted(() => accountLoader.requestLoad())

    const key = computed(() => {
      let result: hashgraph.proto.Key | null
      if (accountLoader.key.value?.key) {
        const keyByteArray = hexToByte(accountLoader.key.value?.key)
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

    const containerStyle = (): Record<string, string> => {
      const n = maxLevel.value + 1
      const offset = 30
      return {
        display: "grid",
        gridTemplateColumns: "repeat(" + n + ", " + offset + "px) auto repeat(" + n + ", " + offset + "px)",
        rowGap: "0.50rem"
      }
    }

    const lineClass = (line: ComplexKeyLine) => {
      const index = line.level % lineClasses.length
      return lineClasses[index]
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

    return {
      isSmallScreen,
      isTouchDevice,
      account: accountLoader.entity,
      normalizedAccountId: accountLoader.accountId,
      accountChecksum: accountLoader.accountChecksum,
      key,
      lines,
      containerStyle,
      lineClass,
      lineStyle,
      lineText,
    }
  }
});

</script>

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