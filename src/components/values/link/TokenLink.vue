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

  <div class="is-inline-block">

    <EntityLink :route="!noAnchor ? tokenRoute : null">
      <TokenIOL :token-id="tokenId"/>
    </EntityLink>

    <template v-if="showExtra">
      <span class="ml-2">
        <TokenExtra
            :token-id="tokenId ?? undefined"
            :use-anchor="!noAnchor"
        />
      </span>
    </template>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent} from "vue";
import TokenExtra from "@/components/values/link/TokenExtra.vue";
import {routeManager} from "@/router";
import TokenIOL from "@/components/values/link/TokenIOL.vue";
import EntityLink from "@/components/values/link/EntityLink.vue";

export default defineComponent({
  name: "TokenLink",
  components: {EntityLink, TokenIOL, TokenExtra},
  props: {
    tokenId: String,
    showExtra: Boolean,
    noAnchor: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const tokenRoute = computed(() => props.tokenId ? routeManager.makeRouteToToken(props.tokenId) : null)
    return {tokenRoute}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
