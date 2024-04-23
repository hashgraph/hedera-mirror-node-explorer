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

  <div v-if="noAnchor || accountRoute === null">
    <AccountIOL
        :account-id="accountId"
        :show-extra="showExtra"
        :show-none="showNone"
        :null-label="nullLabel"
    />
  </div>

  <div v-else>
    <router-link :to="accountRoute">
      <AccountIOL class="h-is-hoverable"
                  :account-id="accountId"
                  :show-extra="showExtra"
                  :show-none="showNone"
                  :null-label="nullLabel"
      />
    </router-link>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onBeforeUnmount, onMounted, PropType, ref, watch} from "vue";
import {routeManager} from "@/router";
import {NetworkCache} from "@/utils/cache/NetworkCache";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {RouteLocationRaw} from "vue-router";
import AccountIOL from "@/components/values/AccountIOL.vue";

export default defineComponent({
  name: "AccountLink",
  components: {AccountIOL},

  props: {
    accountId: String as PropType<string | null>,
    showExtra: Boolean,
    noAnchor: {
      type: Boolean,
      default: false
    },
    showNone: Boolean,
    nullLabel: String,
  },

  setup(props) {

    const networkLookup = NetworkCache.instance.makeLookup()
    onMounted(() => networkLookup.mount())
    onBeforeUnmount(() => networkLookup.unmount())

    const accountRoute = ref<RouteLocationRaw | null>(null)

    const selectRoute = async (accountId: string) => {
      let result: RouteLocationRaw | null
      try {
        if (await ContractByIdCache.instance.lookup(accountId) !== null) {
          result = routeManager.makeRouteToContract(accountId)
        } else {
          result = routeManager.makeRouteToAccount(accountId)
        }
      } catch {
        result = null
      }
      return Promise.resolve(result)
    }

    onMounted(() => {
      if (props.accountId) {
        selectRoute(props.accountId).then((route) => accountRoute.value = route)
      } else {
        accountRoute.value = null
      }
    })
    watch(() => props.accountId, (newValue) => {
      if (newValue) {
        selectRoute(newValue).then((route) => accountRoute.value = route)
      } else {
        accountRoute.value = null
      }
    })

    return {accountRoute}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

