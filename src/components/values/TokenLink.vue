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

  <div v-if="tokenId">
    <template v-if="noAnchor">
      <span class="is-numeric">{{ tokenId }}</span>
    </template>
    <template v-else>
      <router-link :to="{name: 'TokenDetails', params: {tokenId: tokenId}}">
        <span class="is-numeric">{{ tokenId }}</span>
      </router-link>
    </template>
    <template v-if="showExtra">
      <span class="ml-2">
        <TokenExtra v-bind:token-id="tokenId" v-bind:show-name="true"/>
      </span>
    </template>
  </div>

  <span v-else>?</span>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent} from "vue";
import TokenExtra from "@/components/values/TokenExtra.vue";

export default defineComponent({
  name: "TokenLink",
  components: { TokenExtra },
  props: {
    tokenId: String,
    showExtra: {
      type: Boolean,
      default: false
    },
    noAnchor: {
      type: Boolean,
      default: false
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
