/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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

import {createRouter, createWebHistory, RouteLocationNormalized, Router, RouteRecordRaw} from 'vue-router'
import MainDashboard from "@/pages/MainDashboard.vue";
import Transactions from "@/pages/Transactions.vue";
import TransactionDetails from "@/pages/TransactionDetails.vue";
import Accounts from "@/pages/Accounts.vue";
import AccountDetails from "@/pages/AccountDetails.vue";
import Tokens from "@/pages/Tokens.vue";
import TokenDetails from "@/pages/TokenDetails.vue";
import TokensByName from "@/pages/TokensByName.vue";
import TokensByPopularity from "@/pages/TokensByPopularity.vue";
import NftDetails from "@/pages/NftDetails.vue";
import Contracts from "@/pages/Contracts.vue";
import ContractDetails from "@/pages/ContractDetails.vue";
import Topics from "@/pages/Topics.vue";
import TopicDetails from "@/pages/TopicDetails.vue";
import SearchHelp from "@/pages/SearchHelp.vue";
import PageNotFound from "@/pages/PageNotFound.vue";
import {AxiosMonitor} from "@/utils/AxiosMonitor";
import TransactionsById from "@/pages/TransactionsById.vue";
import MobileMenu from "@/pages/MobileMenu.vue";
import MobileSearch from "@/pages/MobileSearch.vue";
import Nodes from "@/pages/Nodes.vue";
import NodeDetails from "@/pages/NodeDetails.vue";
import {NetworkEntry, networkRegistry} from "@/schemas/NetworkRegistry";
import {AppStorage} from "@/AppStorage";
import Staking from "@/pages/Staking.vue";
import {RouteManager} from "@/utils/RouteManager";
import {WalletManager} from "@/utils/wallet/WalletManager";
import BlockDetails from "@/pages/BlockDetails.vue";
import Blocks from "@/pages/Blocks.vue";
import AccountsWithKey from "@/pages/AccountsWithKey.vue";
import AdminKeyDetails from "@/pages/AdminKeyDetails.vue";
import AddressDetails from "@/pages/AddressDetails.vue";
import RoutingSpec from "@/pages/RoutingSpec.vue";
import {gtagPageView} from "@/gtag";

const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/' + AppStorage.getLastNetwork().name + '/dashboard'
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
        path: '/:network',
        redirect: {name: 'MainDashboard'}
    },
    {
        path: '/:network/dashboard',
        name: 'MainDashboard',
        component: MainDashboard,
        props: true
    },
    {
        path: '/:network/spec',
        name: 'RoutingSpec',
        component: RoutingSpec,
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
        path: '/:network/transaction/:transactionLoc',
        name: 'TransactionDetails',
        component: TransactionDetails,
        props: true
    },
    {
        path: '/:network/accounts',
        name: 'Accounts',
        component: Accounts,
        props: true
    },
    {
        path: '/:network/accountsWithKey/:pubKey',
        name: 'AccountsWithKey',
        component: AccountsWithKey,
        props: true
    },
    {
        path: '/:network/account/:accountId',
        name: 'AccountDetails',
        component: AccountDetails,
        props: true
    },
    {
        path: '/:network/adminKey/:accountId',
        name: 'AdminKeyDetails',
        component: AdminKeyDetails,
        props: true
    },
    {
        // EIP 3091 Support
        path: '/:network/address/:accountAddress',
        name: 'AddressDetails',
        component: AddressDetails,
        props: true
    },
    {
        path: '/:network/tokens',
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
        path: '/:network/token/:tokenId/:serialNumber',
        name: 'NftDetails',
        component: NftDetails,
        props: true
    },
    {
        path: '/:network/tokensByName/:name',
        name: 'TokensByName',
        component: TokensByName,
        props: true
    },
    {
        path: '/:network/tokensByPopularity/:name',
        name: 'TokensByPopularity',
        component: TokensByPopularity,
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
        path: '/:network/nodes',
        name: 'Nodes',
        component: Nodes,
        props: true
    },
    {
        path: '/:network/node/:nodeId',
        name: 'NodeDetails',
        component: NodeDetails,
        props: true
    },
    {
        path: '/:network/staking',
        name: 'Staking',
        component: Staking,
        props: true
    },
    {
        path: '/:network/blocks',
        name: 'Blocks',
        component: Blocks,
        props: true
    },
    {
        path: '/:network/block/:blockHon',
        name: 'BlockDetails',
        component: BlockDetails,
        props: true
    },
    {
        // EIP 3091 Support
        path: '/:network/tx/:transactionLoc',
        name: 'TransactionDetails3091',
        component: TransactionDetails,
        props: true
    },
    {
        path: '/:network/search-help',
        name: 'SearchHelp',
        component: SearchHelp,
        props: true
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

export function makeRouter(): Router {
    return createRouter({
        history: createWebHistory(),
        routes
    })
}

const router = makeRouter()

router.beforeEach((to) => {
    let result: boolean | string

    if (getNetworkEntryFromRoute(to) === null // Unknown network
        || (to.name === 'Staking' && import.meta.env.VITE_APP_ENABLE_STAKING !== 'true') // Staking page not enabled
    ) {
        result = "/page-not-found"
    } else {
        result = true
    }
    return result
})

router.beforeEach((to) => {
    const envTitleSuffix = import.meta.env.VITE_APP_DOCUMENT_TITLE_SUFFIX
    const titleSuffix = envTitleSuffix ? " | " + envTitleSuffix : ""

    switch (to.name as string) {
        case "MainDashboard":
            document.title = "Hedera Dashboard" + titleSuffix
            break;
        case "TransactionDetails":
            document.title = "Hedera Transaction " + (to.query.tid ?? to.params.transactionLoc) + titleSuffix
            break;
        case "TransactionDetails3091":
            document.title = "Hedera Transaction " + to.params.transactionLoc + titleSuffix
            break;
        case "TokenDetails":
            document.title = "Hedera Token " + to.params.tokenId + titleSuffix
            break;
        case "TopicDetails":
            document.title = "Hedera Topic " + to.params.topicId + titleSuffix
            break;
        case "ContractDetails":
            document.title = "Hedera Contract " + to.params.contractId + titleSuffix
            break;
        case "AccountDetails":
            document.title = "Hedera Account " + to.params.accountId + titleSuffix
            break;
        case "AdminKeyDetails":
            document.title = "Hedera Admin Key for Account " + to.params.accountId + titleSuffix
            break;
        case "NodeDetails":
            document.title = "Hedera Node " + to.params.nodeId + titleSuffix
            break;
        case "BlockDetails":
            document.title = "Hedera Block " + to.params.blockHon + titleSuffix
            break;
        case "SearchHelp":
            document.title = "Search Results" + titleSuffix
            break;
        case "PageNotFound":
            document.title = "Page Not Found" + titleSuffix
            break;
        default:
            document.title = "Hedera " + (to.name as string) + titleSuffix
    }

    addMetaTags()
});

router.beforeEach(() => {
    AxiosMonitor.instance.clearErrorResponses()
})

router.afterEach((to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  if (to.path !== from.path) {
    gtagPageView(to.path)
  }
})

export default router

export function addMetaTags(): void {

    const title = document.title
    const description =
        import.meta.env.VITE_APP_META_DESCRIPTION ?? "Hedera Mirror Node Explorer is a ledger explorer for the Hedera network"
    const url = import.meta.env.VITE_APP_META_URL

    createOrUpdateTagName('description', description)
    createOrUpdateTagProperty('og:title', title)
    if (url) {
        createOrUpdateTagProperty('og:url', url)
    }
}

export function createOrUpdateTagName(name: string, content: string): void {
    const header = document.getElementsByTagName('head')[0]
    for (const tag of document.getElementsByTagName('meta')) {
        if (tag.getAttribute('name') === name) {
            header.removeChild(tag)
        }
    }
    const newTag = document.createElement('meta')
    newTag.name = name
    newTag.setAttribute('content', content)
    header.appendChild(newTag)
}

export function createOrUpdateTagProperty(property: string, content: string): void {
    const header = document.getElementsByTagName('head')[0]
    for (const tag of document.getElementsByTagName('meta')) {
        if (tag.getAttribute('property') === property) {
            header.removeChild(tag)
        }
    }
    const newTag = document.createElement('meta')
    newTag.setAttribute('property', property)
    newTag.setAttribute('content', content)
    header.appendChild(newTag)
}

export function getNetworkEntryFromRoute(r: RouteLocationNormalized): NetworkEntry | null {

    let networkName: string | null
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

export const routeManager = new RouteManager(router)
export const walletManager = new WalletManager(routeManager)
