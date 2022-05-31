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
  <template v-if="tokenId != null">
    <template v-if="useAnchor">
      <router-link :to="{name: 'TokenDetails', params: {tokenId: tokenId}}">
        <span class="h-is-smaller h-is-extra-text should-wrap">{{ extra }}</span>
      </router-link>
    </template>
    <template v-else>
      <span class="h-is-smaller h-is-extra-text should-wrap">{{ extra }}</span>
    </template>
  </template>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, ref} from "vue";
import {AxiosResponse} from "axios";
import {TokenInfo} from "@/schemas/HederaSchemas";
import {TokenInfoCollector} from "@/utils/TokenInfoCollector";
import {makeTokenSymbol} from "@/schemas/HederaUtils";

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
      defaults: false
    }
  },

  setup(props) {
    const extra = ref("")
    const response = ref<AxiosResponse<TokenInfo>|null>(null)

    if (props.tokenId) {
      TokenInfoCollector.instance.fetch(props.tokenId).then((r: AxiosResponse<TokenInfo>) => {
        response.value = r
        if (props.showName) {
          extra.value = r.data.name ?? ""
        } else {
          // extra.value = makeExtra(r)
          extra.value = makeTokenSymbol(r.data, 40)
        }
      }, (reason: unknown) => {
        console.warn("TokenInfoCollector did fail to fetch " + props.tokenId + " with reason: " + reason)
        response.value = null
      })
    }

    return { extra }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

