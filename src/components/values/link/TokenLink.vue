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

    <template v-if="tokenRoute === null">
      <TokenIOL :token-id="tokenId"/>
    </template>

    <template v-else>
      <router-link :to="tokenRoute">
        <span class="h-is-hoverable">
          <TokenIOL :token-id="tokenId"/>
        </span>
      </router-link>
    </template>

    <template v-if="showExtra">
      <span class="ml-2">
        <TokenExtra
            :token-id="tokenId ?? undefined"
            :show-name="true"
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

export default defineComponent({
  name: "TokenLink",
  components: {TokenIOL, TokenExtra},
  props: {
    tokenId: String,
    showExtra: Boolean,
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
