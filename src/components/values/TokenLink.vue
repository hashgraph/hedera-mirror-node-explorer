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

    <div v-if="tokenId">
        <template v-if="noAnchor">
            <span class="is-numeric">{{ tokenId }}</span>
        </template>
        <template v-else>
            <router-link :to="tokenRoute">
                <span class="is-numeric">{{ tokenId }}</span>
            </router-link>
        </template>
        <template v-if="showExtra">
      <span class="ml-2">
        <TokenExtra v-bind:token-id="tokenId" v-bind:show-name="true"/>
      </span>
        </template>
    </div>

    <span v-else-if="showNone && !initialLoading" class="has-text-grey">None</span>

    <span v-else/>


</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from "vue";
import TokenExtra from "@/components/values/TokenExtra.vue";
import {initialLoadingKey} from "@/AppKeys";
import {routeManager} from "@/router";

export default defineComponent({
    name: "TokenLink",
    components: {TokenExtra},
    props: {
        tokenId: String,
        showExtra: {
            type: Boolean,
            default: false
        },
        showNone: {
            type: Boolean,
            default: false
        },
        noAnchor: {
            type: Boolean,
            default: false
        }
    },
    setup(props) {
        const tokenRoute = computed(() => props.tokenId ? routeManager.makeRouteToToken(props.tokenId) : null)
        const initialLoading = inject(initialLoadingKey, ref(false))
        return {tokenRoute, initialLoading}
    }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
