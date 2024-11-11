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

import {
    createRouter,
    createWebHistory,
    NavigationFailure,
    RouteLocationNormalized,
    RouteLocationNormalizedLoaded,
    RouteLocationRaw,
    Router,
    RouteRecordRaw
} from "vue-router";
import {App, computed, ref, watch, WatchStopHandle} from "vue";
import {AppStorage} from "@/AppStorage";
import PageNotFound from "@/pages/PageNotFound.vue";
import MainDashboard from "@/pages/MainDashboard.vue";
import RoutingSpec from "@/pages/RoutingSpec.vue";
import Transactions from "@/pages/Transactions.vue";
import TransactionsById from "@/pages/TransactionsById.vue";
import TransactionDetails from "@/pages/TransactionDetails.vue";
import Accounts from "@/pages/Accounts.vue";
import AccountsWithKey from "@/pages/AccountsWithKey.vue";
import AccountDetails from "@/pages/AccountDetails.vue";
import AdminKeyDetails from "@/pages/AdminKeyDetails.vue";
import AddressDetails from "@/pages/AddressDetails.vue";
import Tokens from "@/pages/Tokens.vue";
import TokenDetails from "@/pages/TokenDetails.vue";
import NftDetails from "@/pages/NftDetails.vue";
import TokensByName from "@/pages/TokensByName.vue";
import TokensByPopularity from "@/pages/TokensByPopularity.vue";
import TokensByAccount from "@/pages/TokensByAccount.vue";
import Contracts from "@/pages/Contracts.vue";
import ContractDetails from "@/pages/ContractDetails.vue";
import Topics from "@/pages/Topics.vue";
import TopicDetails from "@/pages/TopicDetails.vue";
import Nodes from "@/pages/Nodes.vue";
import NodeDetails from "@/pages/NodeDetails.vue";
import Staking from "@/pages/Staking.vue";
import Blocks from "@/pages/Blocks.vue";
import BlockDetails from "@/pages/BlockDetails.vue";
import SearchHelp from "@/pages/SearchHelp.vue";
import MobileMenu from "@/pages/MobileMenu.vue";
import MobileSearch from "@/pages/MobileSearch.vue";
import axios from "axios";
import {Transaction} from "@/schemas/HederaSchemas";
import {CacheUtils} from "@/utils/cache/CacheUtils";
import {CoreConfig} from "@/config/CoreConfig";
import {NetworkConfig, NetworkEntry} from "@/config/NetworkConfig";

export class RouteManager {

    public readonly router: Router
    private coreConfig = CoreConfig.FALLBACK
    private networkConfig = NetworkConfig.FALLBACK

    //
    // Public
    //

    public constructor() {

        this.router = createRouter({
            history: createWebHistory(),
            routes: [] // Will be set by this.configure()
        })

        this.router.beforeEach(this.checkNetwork)
        this.router.beforeEach(this.setupTitleAndHeaders)

        watch(this.currentNetwork, () => {
            AppStorage.setLastNetwork(this.currentNetwork.value)
            axios.defaults.baseURL = this.currentNetworkEntry.value.url
            this.updateSelectedNetworkSilently()
            this.switchThemes()
        } /*  {immediate: true} causes a infinite loop (?) */)
        watch(this.currentNetwork, () => {
            CacheUtils.clearAll()
        })

        this.configure(CoreConfig.FALLBACK, NetworkConfig.FALLBACK)
    }

    public readonly currentRoute = computed(() => this.router.currentRoute.value?.name)

    public readonly currentNetwork = computed(() => this.currentNetworkEntry.value.name)

    public readonly enableWallet = computed(() => {
        return this.currentNetworkEntry.value.enableWallet
    })

    public readonly enableStaking = computed(() => {
        return this.currentNetworkEntry.value.enableStaking
    })

    public readonly enableExpiry = computed(() => {
        return this.currentNetworkEntry.value.enableExpiry
    })

    public readonly enableMarket = computed(() => {
        return this.currentNetworkEntry.value.enableMarket
    })

    public readonly nbNetworks = computed(() => {
        return this.networkConfig.entries.length
    })

    public readonly currentNetworkEntry = computed(() => {
        let networkName: string | null
        const networkParam = this.router.currentRoute.value?.params?.network
        if (Array.isArray(networkParam)) {
            networkName = networkParam.length >= 1 ? networkParam[0] : null
        } else {
            networkName = networkParam
        }
        const networkEntry = networkName != null ? this.networkConfig.lookup(networkName) : null

        return networkEntry != null ? networkEntry : this.networkConfig.entries[0]
    })

    public configure(coreConfig: CoreConfig, networkConfig: NetworkConfig) {

        this.coreConfig = coreConfig
        this.networkConfig = networkConfig

        //
        // Rebuilds route array
        //

        this.router.clearRoutes()

        const defaultNetwork = AppStorage.getLastNetwork() ?? networkConfig.entries[0].name
        this.router.addRoute({
            path: '/',
            redirect: '/' + defaultNetwork + '/dashboard'
        })
        this.router.addRoute({
            path: '/page-not-found',
            redirect: '/' + defaultNetwork + '/page-not-found'
        })
        for (const r of routes) {
            this.router.addRoute(r)
        }

    }

    //
    // Public (selectedNetwork)
    //

    public selectedNetwork = ref(this.networkConfig.entries[0].name)

    public selectedNetworkWatchHandle: WatchStopHandle | undefined

    public updateSelectedNetworkSilently(): void {
        if (this.selectedNetworkWatchHandle) {
            this.selectedNetworkWatchHandle()
        }
        this.selectedNetwork.value = this.currentNetwork.value
        this.selectedNetworkWatchHandle = watch(this.selectedNetwork, (selection) => {
            this.router.push({
                name: "MainDashboard",
                params: {network: selection}
            }).catch()
        })
    }

    //
    // To be moved to MobileMenu.vue
    //

    public readonly previousRoute = computed(() => (this.router.currentRoute.value?.query.from as string))



    //
    // Public (routeToXXX)
    //

    public readonly isDashboardRoute = computed(() => this.testDashboardRoute())
    public readonly isTransactionRoute = computed(() => this.testTransactionRoute())
    public readonly isTokenRoute = computed(() => this.testTokenRoute())
    public readonly isTopicRoute = computed(() => this.testTopicRoute())
    public readonly isContractRoute = computed(() => this.testContractRoute())
    public readonly isAccountRoute = computed(() => this.testAccountRoute())
    public readonly isNodeRoute = computed(() => this.testNodeRoute())
    public readonly isStakingRoute = computed(() => this.testStakingRoute())
    public readonly isBlocksRoute = computed(() => this.testBlocksRoute())

    public testDashboardRoute(route: string | null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'MainDashboard'
    }

    public testTransactionRoute(route: string | null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Transactions' || r === 'TransactionsById' || r === 'TransactionDetails'
    }

    public testTokenRoute(route: string | null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Tokens' || r === 'TokenDetails'
    }

    public testTopicRoute(route: string | null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Topics' || r === 'TopicDetails'
    }

    public testContractRoute(route: string | null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Contracts' || r === 'ContractDetails'
    }

    public testAccountRoute(route: string | null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Accounts'
            || r === 'AccountDetails'
            || r === 'AccountsWithKey'
            || r === 'AdminKeyDetails'
            || r === 'TokensByAccount'
    }

    public testNodeRoute(route: string | null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Nodes' || r === 'NodeDetails'
    }

    public testStakingRoute(route: string | null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Staking'
    }

    public testBlocksRoute(route: string | null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Blocks' || r === 'BlockDetails'
    }

    //
    // Transaction
    //

    public routeToTransaction(t: Transaction, event: MouseEvent): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            const routeData = this.router.resolve(this.makeRouteToTransaction(t.consensus_timestamp));
            window.open(routeData.href, '_blank');
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToTransaction(t.consensus_timestamp))
        }
        return result
    }

    public routeToTransactionByTs(consensusTimestamp: string | undefined, event: MouseEvent): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            const routeData = this.router.resolve(this.makeRouteToTransaction(consensusTimestamp));
            window.open(routeData.href, '_blank');
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToTransaction(consensusTimestamp))
        }
        return result
    }

    public makeRouteToTransactionObj(transaction: Transaction): RouteLocationRaw {
        return this.makeRouteToTransaction(transaction.consensus_timestamp)
    }

    public makeRouteToTransaction(transactionLoc: string | undefined): RouteLocationRaw {
        return {
            name: 'TransactionDetails',
            params: {transactionLoc: transactionLoc, network: this.currentNetwork.value}
        }
    }

    //
    // TransactionsById
    //

    public routeToTransactionsById(transactionId: string): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToTransactionsById(transactionId))
    }

    public makeRouteToTransactionsById(transactionId: string): RouteLocationRaw {
        return {name: 'TransactionsById', params: {transactionId: transactionId, network: this.currentNetwork.value}}
    }

    //
    // Account
    //

    public makeRouteToAccount(accountId: string): RouteLocationRaw {
        return {
            name: 'AccountDetails',
            params: {accountId: accountId, network: this.currentNetwork.value}
        }
    }

    public routeToAccount(accountId: string, event: MouseEvent): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            const routeData = this.router.resolve(this.makeRouteToAccount(accountId));
            window.open(routeData.href, '_blank');
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToAccount(accountId))
        }
        return result
    }

    //
    // Accounts with key
    //

    public makeRouteToAccountsWithKey(pubKey: string): RouteLocationRaw {
        return {
            name: 'AccountsWithKey', params: {pubKey: pubKey, network: this.currentNetwork.value}
        }
    }

    public routeToAccountsWithKey(pubKey: string): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToAccountsWithKey(pubKey))
    }

    //
    // Admin Key
    //

    public makeRouteToAdminKey(accountId: string): RouteLocationRaw {
        return {
            name: 'AdminKeyDetails', params: {accountId: accountId, network: this.currentNetwork.value}
        }
    }

    //
    // Token
    //

    public makeRouteToToken(tokenId: string): RouteLocationRaw {
        return {name: 'TokenDetails', params: {tokenId: tokenId, network: this.currentNetwork.value}}
    }

    public routeToToken(tokenId: string, event: MouseEvent): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            const routeData = this.router.resolve(this.makeRouteToToken(tokenId));
            window.open(routeData.href, '_blank');
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToToken(tokenId))
        }
        return result
    }

    public makeRouteToSerial(tokenId: string, serialNumber: number): RouteLocationRaw {
        return {
            name: 'NftDetails',
            params: {tokenId: tokenId, serialNumber: serialNumber, network: this.currentNetwork.value}
        }
    }

    public makeRouteToCollection(accountId: string, tokenId: string): RouteLocationRaw {
        return {
            name: 'AccountCollection',
            params: {accountId: accountId, tokenId: tokenId, network: this.currentNetwork.value}
        }
    }

    public routeToSerial(tokenId: string, serialNumber: number, event: MouseEvent): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            const routeData = this.router.resolve(this.makeRouteToSerial(tokenId, serialNumber))
            window.open(routeData.href, '_blank')
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToSerial(tokenId, serialNumber))
        }
        return result
    }

    public makeRouteToTokensByName(name: string): RouteLocationRaw {
        return {
            name: 'TokensByName',
            params: {name: name, network: this.currentNetwork.value}
        }
    }

    public makeRouteToTokensByPopularity(name: string): RouteLocationRaw {
        return {
            name: 'TokensByPopularity',
            params: {name: name, network: this.currentNetwork.value}
        }
    }

    public makeRouteToTokensByAccount(accountId: string): RouteLocationRaw {
        return {
            name: 'TokensByAccount',
            params: {accountId: accountId, network: this.currentNetwork.value}
        }
    }

    //
    // Contract
    //

    public makeRouteToContract(contractId: string): RouteLocationRaw {
        return {name: 'ContractDetails', params: {contractId: contractId, network: this.currentNetwork.value}}
    }

    public routeToContract(contractId: string, event: MouseEvent): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            const routeData = this.router.resolve(this.makeRouteToContract(contractId));
            window.open(routeData.href, '_blank');
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToContract(contractId))
        }
        return result
    }

    //
    // Topic
    //

    public makeRouteToTopic(topicId: string): RouteLocationRaw {
        return {name: 'TopicDetails', params: {topicId: topicId, network: this.currentNetwork.value}}
    }

    public routeToTopic(topicId: string, event: MouseEvent): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            const routeData = this.router.resolve(this.makeRouteToTopic(topicId));
            window.open(routeData.href, '_blank');
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToTopic(topicId))
        }
        return result
    }

    //
    // Block
    //

    public makeRouteToBlock(blockHon: string | number): RouteLocationRaw {
        return {name: 'BlockDetails', params: {blockHon: blockHon, network: this.currentNetwork.value}}
    }

    public routeToBlock(blockHon: string | number, event: MouseEvent | null = null): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event && (event.ctrlKey || event.metaKey || event.button === 1)) {
            const routeData = this.router.resolve(this.makeRouteToBlock(blockHon));
            window.open(routeData.href, '_blank');
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToBlock(blockHon))
        }
        return result
    }

    //
    // Node
    //

    public makeRouteToNode(nodeId: number): RouteLocationRaw {
        return {name: 'NodeDetails', params: {nodeId: nodeId, network: this.currentNetwork.value}}
    }

    public routeToNode(nodeId: number, event: MouseEvent): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            const routeData = this.router.resolve(this.makeRouteToNode(nodeId));
            window.open(routeData.href, '_blank');
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToNode(nodeId))
        }
        return result
    }

    //
    // SearchHelp
    //

    public makeRouteToSearchHelp(): RouteLocationRaw {
        return {
            name: 'SearchHelp'
        }
    }

    //
    // Main Pages
    //

    public makeRouteToMainDashboard(): RouteLocationRaw {
        return {name: 'MainDashboard', params: {network: this.currentNetwork.value}}
    }

    public routeToMainDashboard(): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToMainDashboard())
    }

    public makeRouteToTransactions(): RouteLocationRaw {
        return {name: 'Transactions', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToTokens(): RouteLocationRaw {
        return {name: 'Tokens', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToTopics(): RouteLocationRaw {
        return {name: 'Topics', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToContracts(): RouteLocationRaw {
        return {name: 'Contracts', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToAccounts(): RouteLocationRaw {
        return {name: 'Accounts', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToNodes(): RouteLocationRaw {
        return {name: 'Nodes', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToStaking(): RouteLocationRaw {
        return {name: 'Staking', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToBlocks(): RouteLocationRaw {
        return {name: 'Blocks', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToMobileSearch(): RouteLocationRaw {
        return {name: 'MobileSearch', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToPageNotFound(): RouteLocationRaw {
        return {name: 'PageNotFound', params: {network: this.currentNetwork.value}}
    }

    public makeRouteToMobileMenu(name: unknown): RouteLocationRaw {
        return {
            name: 'MobileMenu',
            params: {network: this.currentNetwork.value},
            query: {from: name as string}
        }
    }



    //
    // App plugin
    //

    public install(app: App): void {
        this.router.install(app)
    }


    //
    // Private
    //

    private readonly checkNetwork = (to: RouteLocationNormalized): boolean|string => {
        let result: boolean | string

        if (this.getNetworkEntryFromRoute(to) === null) { // Unknown network)
            result = "/page-not-found"
        } else {
            result = true
        }
        return result
    }

    private readonly setupTitleAndHeaders = (to: RouteLocationNormalized):  void => {
        const envTitlePrefix = this.coreConfig.documentTitlePrefix
        const titlePrefix = envTitlePrefix !== null ? envTitlePrefix + " " : ""

        switch (to.name as string) {
            case "MainDashboard":
                document.title = titlePrefix + "Dashboard"
                break;
            case "TransactionDetails":
                document.title = titlePrefix + "Transaction " + (to.query.tid ?? to.params.transactionLoc)
                break;
            case "TransactionDetails3091":
                document.title = titlePrefix + "Transaction " + to.params.transactionLoc
                break;
            case "TokenDetails":
                document.title = titlePrefix + "Token " + to.params.tokenId
                break;
            case "TopicDetails":
                document.title = titlePrefix + "Topic " + to.params.topicId
                break;
            case "ContractDetails":
                document.title = titlePrefix + "Contract " + to.params.contractId
                break;
            case "AccountDetails":
                document.title = titlePrefix + "Account " + to.params.accountId
                break;
            case "AdminKeyDetails":
                document.title = titlePrefix + "Admin Key for Account " + to.params.accountId
                break;
            case "NodeDetails":
                document.title = titlePrefix + "Node " + to.params.nodeId
                break;
            case "BlockDetails":
                document.title = titlePrefix + "Block " + to.params.blockHon
                break;
            case "SearchHelp":
                document.title = "Search Results"
                break;
            case "PageNotFound":
                document.title = "Page Not Found"
                break;
            default:
                document.title = titlePrefix + (to.name as string)
        }

        this.addMetaTags()
    }

    private getNetworkEntryFromRoute(r: RouteLocationNormalized): NetworkEntry | null {

        let networkName: string | null
        const networkParam = r.params.network
        if (Array.isArray(networkParam)) {
            networkName = networkParam.length >= 1 ? networkParam[0] : null
        } else {
            networkName = networkParam
        }

        return networkName !== null ? this.networkConfig.lookup(networkName) : null
    }

    //
    // Private (addMetaTags)
    //

    private addMetaTags(): void {

        const title = document.title
        const description = this.coreConfig.metaDescription ?? "Hedera Mirror Node Explorer is a ledger explorer for the Hedera network"
        const url = this.coreConfig.metaURL

        this.createOrUpdateTagName('description', description)
        this.createOrUpdateTagProperty('og:title', title)
        if (url) {
            this.createOrUpdateTagProperty('og:url', url)
        }
    }

    private createOrUpdateTagName(name: string, content: string): void {
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

    private createOrUpdateTagProperty(property: string, content: string): void {
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

    //
    // Private (switchThemes)
    //

    private switchThemes() {
        if (this.currentNetworkEntry.value.name == NetworkConfig.TEST_NETWORK) {
            document.documentElement.style.setProperty('--h-theme-background-color', 'var(--h-testnet-background-color)')
            document.documentElement.style.setProperty('--h-theme-highlight-color', 'var(--h-testnet-highlight-color)')
            document.documentElement.style.setProperty('--h-theme-pagination-background-color', 'var(--h-testnet-pagination-background-color)')
            document.documentElement.style.setProperty('--h-theme-box-shadow-color', 'var(--h-testnet-box-shadow-color)')
            document.documentElement.style.setProperty('--h-theme-dropdown-arrow', 'var(--h-testnet-dropdown-arrow)')
        } else if (this.currentNetworkEntry.value.name == NetworkConfig.PREVIEW_NETWORK) {
            document.documentElement.style.setProperty('--h-theme-background-color', 'var(--h-previewnet-background-color)')
            document.documentElement.style.setProperty('--h-theme-highlight-color', 'var(--h-previewnet-highlight-color)')
            document.documentElement.style.setProperty('--h-theme-pagination-background-color', 'var(--h-previewnet-pagination-background-color)')
            document.documentElement.style.setProperty('--h-theme-box-shadow-color', 'var(--h-previewnet-box-shadow-color)')
            document.documentElement.style.setProperty('--h-theme-dropdown-arrow', 'var(--h-previewnet-dropdown-arrow)')
        } else {
            document.documentElement.style.setProperty('--h-theme-background-color', 'var(--h-mainnet-background-color)')
            document.documentElement.style.setProperty('--h-theme-highlight-color', 'var(--h-mainnet-highlight-color)')
            document.documentElement.style.setProperty('--h-theme-pagination-background-color', 'var(--h-mainnet-pagination-background-color)')
            document.documentElement.style.setProperty('--h-theme-box-shadow-color', 'var(--h-mainnet-box-shadow-color)')
            document.documentElement.style.setProperty('--h-theme-dropdown-arrow', 'var(--h-mainnet-dropdown-arrow)')
        }
    }

}

export function fetchStringQueryParam(paramName: string, route: RouteLocationNormalizedLoaded): string | null {
    let result: string | null
    const v = route.query[paramName]
    if (typeof v == "string") {
        result = v
    } else {
        result = null
    }
    return result
}

export function fetchNumberQueryParam(paramName: string, route: RouteLocationNormalizedLoaded): number | null {
    let result: number | null
    const v = route.query[paramName]
    if (typeof v == "string") {
        const i = parseInt(v)
        result = isNaN(i) || i < 1 ? null : i
    } else {
        result = null
    }
    return result
}





//
// Route table
// ===========
//


const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: '/' + AppStorage.getLastNetwork() + '/dashboard'
    },
    {
        path: '/page-not-found',
        redirect: '/' + AppStorage.getLastNetwork() + '/page-not-found'
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
        path: '/:network/tokensByAccount/:accountId',
        name: 'TokensByAccount',
        component: TokensByAccount,
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


