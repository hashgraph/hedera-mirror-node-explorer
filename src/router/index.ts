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

import {createRouter, createWebHashHistory, RouteRecordRaw} from 'vue-router'
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
import AccountBalances from "@/pages/AccountBalances.vue";
import axios from "axios";
import {AxiosMonitor} from "@/utils/AxiosMonitor";
import TransactionsById from "@/pages/TransactionsById.vue";
import MobileMenu from "@/pages/MobileMenu.vue";

const TESTNET_URL = "https://testnet.mirrornode.hedera.com/";
const MAINNET_URL = "https://mainnet-public.mirrornode.hedera.com/";

const LAST_USED_NETWORK_KEY = 'network'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/' + (localStorage.getItem(LAST_USED_NETWORK_KEY) ?? 'testnet') + '/dashboard'
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
    path: "/:catchAll(.*)",
    redirect: '/'
  },
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from) => {
  const fromNetwork = localStorage.getItem(LAST_USED_NETWORK_KEY)
  const toNetwork = to.params.network

  let result

  if (toNetwork == 'testnet' || toNetwork == 'mainnet') {
    localStorage.setItem(LAST_USED_NETWORK_KEY, toNetwork);
    axios.defaults.baseURL = (toNetwork == 'testnet') ? TESTNET_URL : MAINNET_URL

    if (fromNetwork && (fromNetwork != toNetwork) && (from.name == to.name)) {
      result = {
        name: 'MainDashboard',
        params: {
          network: toNetwork
        }
      }
    } else {
      result = true
    }
  } else {
    // console.log("Unknown network: <" + toNetwork + ">")
    result = '/'
  }

  return result
})

router.beforeEach((to) => {
  switch (to.name as string) {
    case "MainDashboard":
      document.title = "Hedera Explorer | Dashboard";
      break;
    case "TransactionDetails":
      document.title = "Hedera Explorer | Transaction " + to.params.transactionId;
      break;
    case "TokenDetails":
      document.title = "Hedera Explorer | Token " + to.params.tokenId;
      break;
    case "TopicDetails":
      document.title = "Hedera Explorer | Topic " + to.params.topicId;
      break;
    case "ContractDetails":
      document.title = "Hedera Explorer | Contract " + to.params.contractId;
      break;
    case "AccountDetails":
      document.title = "Hedera Explorer | Account " + to.params.accountId;
      break;
    case "AccountBalances":
      document.title = "Hedera Explorer | Balances for Account " + to.params.accountId;
      break;
    case "NoSearchResult":
      document.title = "Hedera Explorer | Search Results";
      break;
    default:
      document.title = "Hedera Explorer | " + (to.name as string);
  }
});

router.beforeEach(() => {
  AxiosMonitor.instance.clearErrorResponses()
})

export default router
