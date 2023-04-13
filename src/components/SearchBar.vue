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

  <div v-if="!isMediumScreen">
    <form data-cy="searchBar" class="control" action="" v-on:submit.prevent="performSearch">
      <input
          class="input has-background-white has-text-black"
          style="border-radius: 10px; height: 50px"
          type="text"
          v-model="searchedId"
          v-bind:disabled="searchInputDisabled"
          ref="search-input"
      />
    </form>
  </div>

  <div v-else>
    <form data-cy="searchBar" class="control has-icons-right" action="" v-on:submit.prevent="performSearch">
      <input
             class="input has-text-white h-is-navbar-item"
             type="text"
             placeholder="Search accounts, transactions, tokens, contracts and topics"
             v-model="searchedId"
             v-bind:disabled="searchInputDisabled"
             ref="search-input"
      />
      <span class="icon is-small is-right">
          <i v-bind:class="searchButtonIconStyle"/>
        </span>
    </form>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onMounted, ref, watch} from "vue";
import {SearchRequest} from "@/utils/SearchRequest";
import {routeManager} from "@/router";


const STYLE_SEARCH_ICON = "fa fa-search"
const STYLE_BUSY_ICON = "fa fa-spinner fa-spin"


export default defineComponent({
  name: "SearchBar",
  setup() {
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    // 1)
    const searchedId = ref("")

    // 2)
    const searchInputDisabled = ref(false)

    // 3)
    const searchButtonDisabled = ref(false)

    // 4)
    const searchButtonIconStyle = ref(STYLE_SEARCH_ICON)

    // 5)
    const updateSearchBarEnabled = () => {
      searchButtonDisabled.value = searchedId.value.length == 0
    }
    const searchDidEnd = (success: boolean) => {
      if (success) {
        searchedId.value = ""
      } else {
        // Keep search input untouched and put focus on it
        // Too bad : it does not work :(
        // const searchInput = this.$refs["search-input"] as HTMLInputElement
        // this.$nextTick(function () {
        //   searchInput.focus()
        // })
      }
      searchInputDisabled.value = false
      searchButtonIconStyle.value = STYLE_SEARCH_ICON
      updateSearchBarEnabled()
    }

    const performSearch = (): void  => {
      searchInputDisabled.value = true
      searchButtonIconStyle.value = STYLE_BUSY_ICON

      const searchedValue = searchedId.value.trim()
      if (searchedValue != "") {
        const r = new SearchRequest(searchedValue)
        r.run().then(() => {
          try {
            if (r.contract != null) {
              if (r.contract.contract_id) {
                routeManager.routeToContract(r.contract.contract_id)
              }
              searchDidEnd(true)
            } else if (r.account != null) {
              if (r.account.account) {
                routeManager.routeToAccount(r.account.account)
              }
              searchDidEnd(true)
            } else if (r.accountsWithKey.length >= 1) {
              if (r.accountsWithKey.length >= 2) {
                routeManager.routeToAccountsWithKey(r.searchedId)
              } else {
                const accountId = r.accountsWithKey[0].account
                if (accountId) {
                  routeManager.routeToAccount(accountId)
                }
              }
              searchDidEnd(true)
            } else if (r.transactions.length >= 1) {
              const transaction = r.transactions[0]
              if (r.transactions.length == 1) {
                routeManager.routeToTransaction(transaction)
              } else {
                routeManager.routeToTransactionsById(transaction.transaction_id ?? "")
              }
              searchDidEnd(true)
            } else if (r.tokenInfo != null) {
              if (r.tokenInfo.token_id) {
                routeManager.routeToToken(r.tokenInfo.token_id)
              }
              searchDidEnd(true)
            } else if (r.block != null) {
              if (r.block.number) {
                routeManager.routeToBlock(r.block.number)
              }
              searchDidEnd(true)
            } else if (r.topicMessages.length >= 1) {
              const topicId = r.topicMessages[0].topic_id
              if (topicId) {
                routeManager.routeToTopic(topicId)
              }
              searchDidEnd(true)
            }else if (r.ethereumAddress != null) {
              routeManager.routeToAccount(r.ethereumAddress)
              searchDidEnd(true)
            } else {
              routeManager.routeToNoSearchResult(searchedId.value, r.getErrorCount())
              searchDidEnd(false)
            }
          } catch {
            console.trace("Failed to route")
            searchDidEnd(false)
          }
        })
      } else {
        searchDidEnd(false)
      }
    }

    watch(searchedId, () => {
      updateSearchBarEnabled()
    })

    onMounted(() => {
      document.title = 'Hedera Dashboard'
    })

    return {
      isMediumScreen,
      isTouchDevice,
      searchedId,
      searchInputDisabled,
      searchButtonDisabled,
      searchButtonIconStyle,
      performSearch
    }
  }
})
</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

input::placeholder {
  color: grey;
}

</style>