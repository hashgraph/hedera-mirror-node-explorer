/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {createRouter, createWebHashHistory, RouteLocationNormalized, RouteRecordRaw} from 'vue-router'
import MainDashboard from "@/pages/MainDashboard.vue";
import Transactions from "@/pages/Transactions.vue";
import TransactionDetails from "@/pages/TransactionDetails.vue";
import Accounts from "@/pages/Accounts.vue";
import AccountDetails from "@/pages/AccountDetails.vue";
import Tokens from "@/pages/Tokens.vue";
import TokenDetails from "@/pages/TokenDetails.vue";
import Contracts from "@/pages/Contracts.vue";
import ContractDetails from "@/pages/ContractDetails.vue";
import Topics from "@/pages/Topics.vue";
import TopicDetails from "@/pages/TopicDetails.vue";
import NoSearchResult from "@/pages/NoSearchResult.vue";
import PageNotFound from "@/pages/PageNotFound.vue";
import AccountBalances from "@/pages/AccountBalances.vue";
import {AxiosMonitor} from "@/utils/AxiosMonitor";
import TransactionsById from "@/pages/TransactionsById.vue";
import MobileMenu from "@/pages/MobileMenu.vue";
import MobileSearch from "@/pages/MobileSearch.vue";
import {NetworkEntry, networkRegistry} from "@/schemas/NetworkRegistry";
import {AppStorage} from "@/AppStorage";
import axios from "axios";

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/' + AppStorage.getLastNetwork().name  + '/dashboard'
  },
  {
    path: '/page-not-found',
    redirect: '/' + AppStorage.getLastNetwork().name + '/page-not-found'
  },
  {
    path: '/:network/page-not-found',
    name: 'PageNotFound',
    component: PageNotFound
  },
  {
    path: '/:network/dashboard',
    name: 'MainDashboard',
    component: MainDashboard,
    props: true
  },
  {
    path: '/:network/transactions',
    name: 'Transactions',
    component: Transactions,
    props: true
  },
  {
    path: '/:network/transactionsById/:transactionId',
    name: 'TransactionsById',
    component: TransactionsById,
    props: true
  },
  {
    path: '/:network/transaction/:transactionId',
    name: 'TransactionDetails',
    component: TransactionDetails,
    props: route => ({
      network: route.params.network as string|undefined,
      transactionId: route.params.transactionId as string|undefined,
      consensusTimestamp: route.query.t as string|undefined
    })
  },
  {
    path: '/:network/accounts',
    name: 'Accounts',
    component: Accounts,
    props: true
  },
  {
    path: '/:network/account/:accountId',
    name: 'AccountDetails',
    component: AccountDetails,
    props: true
  },
  {
    path: '/:network/accountbalances/:accountId',
    name: 'AccountBalances',
    component: AccountBalances,
    props: true
  },
  {
    path: '/:network/tokens/:accountId?',
    name: 'Tokens',
    component: Tokens,
    props: true
  },
  {
    path: '/:network/token/:tokenId',
    name: 'TokenDetails',
    component: TokenDetails,
    props: true
  },
  {
    path: '/:network/contracts',
    name: 'Contracts',
    component: Contracts,
    props: true
  },
  {
    path: '/:network/contract/:contractId',
    name: 'ContractDetails',
    component: ContractDetails,
    props: true
  },
  {
    path: '/:network/topics',
    name: 'Topics',
    component: Topics,
    props: true
  },
  {
    path: '/:network/topic/:topicId',
    name: 'TopicDetails',
    component: TopicDetails,
    props: true
  },
  {
    path: '/:network/search-result/:searchedId',
    name: 'NoSearchResult',
    component: NoSearchResult,
    props:  route => ({
      network: route.params.network as string|undefined,
      searchedId: route.params.searchedId as string|undefined,
      errorCount: Number(route.query.errorCount) as number|undefined
    })
  },
  {
    path: '/:network/mobile-menu',
    name: 'MobileMenu',
    component: MobileMenu,
    props: true
  },
  {
    path: '/:network/mobile-search',
    name: 'MobileSearch',
    component: MobileSearch,
    props: true
  },
  {
    path: "/:catchAll(.*)",
    redirect: '/page-not-found'
  },
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from) => {
  let result: boolean | string

  const toEntry = getNetworkEntryFromRoute(to)
  const fromEntry = getNetworkEntryFromRoute(from)
  if (toEntry !== null) {
    // Network is valid
    AppStorage.setLastNetwork(toEntry)
    axios.defaults.baseURL = toEntry.url
    if (fromEntry != null && fromEntry != toEntry) {
      // Network is changing => updates AppStorage and axios
      if (to.name != "MainDashboard" && to.name != "PageNotFound") {
        // We re-route on MainDashboard
        result = "/" + toEntry.name + "/dashboard"
      }
      else {
        result = true
      }
    } else (
        result = true
    )
  } else {
    // Network is invalid => page not found
    result = '/page-not-found'
  }
  return result
})

router.beforeEach((to) => {
  const titlePrefix = process.env.VUE_APP_DOCUMENT_TITLE_PREFIX ?? "Hedera"

  switch (to.name as string) {
    case "MainDashboard":
      document.title = titlePrefix + " | Dashboard";
      break;
    case "TransactionDetails":
      document.title = titlePrefix + " | Transaction " + to.params.transactionId;
      break;
    case "TokenDetails":
      document.title = titlePrefix + " | Token " + to.params.tokenId;
      break;
    case "TopicDetails":
      document.title = titlePrefix + " | Topic " + to.params.topicId;
      break;
    case "ContractDetails":
      document.title = titlePrefix + " | Contract " + to.params.contractId;
      break;
    case "AccountDetails":
      document.title = titlePrefix + " | Account " + to.params.accountId;
      break;
    case "AccountBalances":
      document.title = titlePrefix + " | Balances for Account " + to.params.accountId;
      break;
    case "NoSearchResult":
      document.title = titlePrefix + " | Search Results";
      break;
    case "PageNotFound":
      document.title = titlePrefix + " | Page Not Found";
      break;
    default:
      document.title = titlePrefix + " | " + (to.name as string);
  }
});

router.beforeEach(() => {
  AxiosMonitor.instance.clearErrorResponses()
})

export default router

export function getNetworkEntryFromRoute(r: RouteLocationNormalized): NetworkEntry | null {

  let networkName: string|null
  const networkParam = r.params.network
  if (Array.isArray(networkParam)) {
    networkName = networkParam.length >= 1 ? networkParam[0] : null
  } else {
    networkName = networkParam
  }

  return networkName !== null ? networkRegistry.lookup(networkName) : null
}

export function getNetworkEntryFromCurrentRoute(): NetworkEntry {
  return getNetworkEntryFromRoute(router.currentRoute.value) ?? networkRegistry.getDefaultEntry()
}
