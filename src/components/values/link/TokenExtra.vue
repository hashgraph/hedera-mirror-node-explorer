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
  <template v-if="tokenId != null">
    <template v-if="useAnchor && tokenRoute">
      <router-link :to="tokenRoute">
        <span class="h-is-text-size-4 h-is-extra-text should-wrap" style="word-break: break-all">{{ extra }}</span>
      </router-link>
    </template>
    <template v-else>
      <span class="h-is-text-size-4 h-is-extra-text should-wrap" style="word-break: break-all">{{ extra }}</span>
    </template>
  </template>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, ref, watch} from "vue";
import {TokenInfo} from "@/schemas/HederaSchemas";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {makeTokenSymbol} from "@/schemas/HederaUtils";
import {routeManager} from "@/router";

export default defineComponent({
  name: "TokenExtra",

  props: {
    tokenId: String,
    showName: {
      type: Boolean,
      default: false
    },
    useAnchor: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {
    const extra = ref("")

    const updateExtra = () => {
      if (props.tokenId) {
        TokenInfoCache.instance.lookup(props.tokenId).then((r: TokenInfo | null) => {
          if (props.showName) {
            extra.value = r?.name ?? ""
          } else {
            extra.value = makeTokenSymbol(r, 40)
          }
        }, (reason: unknown) => {
          console.warn("TokenInfoCollector did fail to fetch " + props.tokenId + " with reason: " + reason)
        })
      }
    }

    watch(() => props.tokenId, () => {
      updateExtra()
    })

    onMounted(() => {
      updateExtra()
    })

    const tokenRoute = computed(() => props.tokenId ? routeManager.makeRouteToToken(props.tokenId) : null)

    return {extra, tokenRoute}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

