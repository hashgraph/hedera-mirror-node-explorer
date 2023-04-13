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
  <div/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onMounted} from 'vue';
import axios from "axios";
import router, {routeManager} from "@/router";
import {PathParam} from "@/utils/PathParam";
import {AccountBalanceTransactions, ContractResponse} from "@/schemas/HederaSchemas";
import {RouteLocationRaw} from "vue-router";

export default defineComponent({

  name: 'AddressDetails',

  components: {},

  props: {
    accountAddress: String,
    network: String
  },

  setup(props) {


    const getContractId = async (evmAddress: string): Promise<string|null> => {
      let result: string|null
      try {
        const response = await axios.get<ContractResponse>("api/v1/contracts/" + evmAddress)
        result = response.data.contract_id ?? null
      } catch {
        result = null
      }
      return Promise.resolve(result)
    }

    const getAccountId = async (evmAddress: string): Promise<string|null> => {
      let result: string|null
      try {
        const response = await axios.get<AccountBalanceTransactions>("api/v1/accounts/" + evmAddress)
        result = response.data.account ?? null
      } catch {
        result = null
      }
      return Promise.resolve(result)
    }

    const selectRoute = async () => {
      let result: RouteLocationRaw

      const evmAddress = PathParam.parseEvmAddress(props.accountAddress)
      if (evmAddress !== null) {

        const contractId = await getContractId(evmAddress)
        if (contractId !== null) {
          result = routeManager.makeRouteToContract(contractId)
        } else {
          const accountId = await getAccountId(evmAddress)
          if (accountId !== null) {
            result = routeManager.makeRouteToAccount(accountId)
          } else {
            result = routeManager.makeRouteToAccount(evmAddress)
          }
        }

      } else {
        result = routeManager.makeRouteToPageNotFound()
      }

      return Promise.resolve(result)
    }

    onMounted(() => {
      selectRoute().then((route: RouteLocationRaw) => router.replace(route))
    })
  }
})

</script>

<style/>