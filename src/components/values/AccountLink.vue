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

  <div v-if="accountId === null">{{ nullLabel }}</div>

  <div v-else-if="accountId">
    <template v-if="noAnchor">
      <span class="is-numeric">{{ accountId }}</span>
    </template>
    <template v-else-if="accountRoute">
      <router-link :to="accountRoute">
        <span class="is-numeric">{{ accountId }}</span>
      </router-link>
    </template>
    <template v-else>
      <span class="is-numeric">{{ accountId }}</span>
    </template>
    <template v-if="showExtra && extra.length > 0">
      <span class="ml-2 h-is-smaller h-is-extra-text is-numeric">{{ extra }}</span>
    </template>
  </div>

  <span v-else-if="showNone && !initialLoading" class="has-text-grey">None</span>

  <span v-else/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, PropType, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import {routeManager} from "@/router";
import {NodeRegistry} from "@/components/node/NodeRegistry";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {RouteLocationRaw} from "vue-router";

export default defineComponent({
  name: "AccountLink",

  props: {
    accountId: String as PropType<string|null>,
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
    },
    nullLabel: {
      type: String,
      default: "O"
    }
  },

  setup(props) {
    const extra = computed(() => {
      return NodeRegistry.getDescription(ref(null), ref(props.accountId??null)) ?? ""
    })

    const accountRoute = ref<RouteLocationRaw | null>(null)

    const initialLoading = inject(initialLoadingKey, ref(false))

    const selectRoute = async () => {
      let result: RouteLocationRaw | null
      if (props.accountId) {
        try {
          if (await ContractByIdCache.instance.lookup(props.accountId) !== null) {
            result = routeManager.makeRouteToContract(props.accountId)
          } else {
            result = routeManager.makeRouteToAccount(props.accountId)
          }
        }
        catch {
          result = null
        }
      } else {
        result = null
      }
      return Promise.resolve(result)
    }

    onMounted(() => {
      selectRoute().then((route) => accountRoute.value = route)
    })

    return {extra, accountRoute, initialLoading}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

