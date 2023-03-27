/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

import {NavigationFailure, RouteLocationNormalizedLoaded, RouteLocationRaw, Router} from "vue-router";
import {Transaction} from "@/schemas/HederaSchemas";
import {NetworkRegistry, networkRegistry} from "@/schemas/NetworkRegistry";
import {computed, ref, watch, WatchStopHandle} from "vue";
import router, {routeManager} from "@/router";
import {TokenInfoCollector} from "@/utils/collector/TokenInfoCollector";
import {NodeRegistry} from "@/components/node/NodeRegistry";
import {AppStorage} from "@/AppStorage";
import {nameServiceSetNetwork} from '@/utils/NameService';
import axios from "axios";
import {CacheUtils} from "@/utils/cache/CacheUtils";

export class RouteManager {

    private readonly router: Router

    //
    // Public
    //

    public constructor(router: Router) {
        this.router = router
        watch(this.currentNetwork, () => {
            nameServiceSetNetwork(this.currentNetworkEntry.value.name)
            AppStorage.setLastNetwork(this.currentNetworkEntry.value)
            axios.defaults.baseURL = this.currentNetworkEntry.value.url
            this.updateSelectedNetworkSilently()
            this.switchThemes()
            RouteManager.resetSingletons()
        }, { immediate: true})
    }

    public readonly currentRoute = computed(() => this.router?.currentRoute.value?.name)

    public readonly currentNetwork = computed(() => {
        return this.currentNetworkEntry.value.name
    })

    public readonly currentNetworkEntry = computed(() => {

        let networkName: string|null
        const networkParam = this.router?.currentRoute.value?.params?.network
        if (Array.isArray(networkParam)) {
            networkName = networkParam.length >= 1 ? networkParam[0] : null
        } else {
            networkName = networkParam
        }
        const networkEntry = networkName != null ? networkRegistry.lookup(networkName) : null

        return networkEntry != null ? networkEntry : networkRegistry.getDefaultEntry()
    })

    public selectedNetwork = ref(routeManager?.currentNetwork.value)

    public selectedNetworkWatchHandle: WatchStopHandle|undefined

    public updateSelectedNetworkSilently(): void {
        if (this.selectedNetworkWatchHandle) {
            this.selectedNetworkWatchHandle()
        }
        this.selectedNetwork.value = this.currentNetwork.value
        this.selectedNetworkWatchHandle = watch(this.selectedNetwork, (selection) => {
            router.push({
                name: "MainDashboard",
                params: { network: selection }
            })
        })
    }

    public readonly previousRoute = computed(() => (this.router?.currentRoute.value?.query.from as string))

    public readonly isDashboardRoute = computed(() => this.testDashboardRoute())
    public readonly isTransactionRoute = computed(() => this.testTransactionRoute())
    public readonly isTokenRoute = computed(() => this.testTokenRoute())
    public readonly isTopicRoute = computed(() => this.testTopicRoute())
    public readonly isContractRoute = computed(() => this.testContractRoute())
    public readonly isAccountRoute = computed(() => this.testAccountRoute())
    public readonly isNodeRoute = computed(() => this.testNodeRoute())
    public readonly isStakingRoute = computed(() => this.testStakingRoute())
    public readonly isBlocksRoute = computed(() => this.testBlocksRoute())

    public testDashboardRoute(route: string|null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'MainDashboard'
    }

    public testTransactionRoute(route: string|null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Transactions' || r === 'TransactionsById' || r === 'TransactionDetails'
    }

    public testTokenRoute(route: string|null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Tokens' || r === 'TokenDetails'
    }

    public testTopicRoute(route: string|null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Topics' || r === 'TopicDetails'
    }

    public testContractRoute(route: string|null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Contracts' || r === 'ContractDetails'
    }

    public testAccountRoute(route: string|null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Accounts'
            || r === 'AccountDetails'
            || r === 'AccountBalances'
            || r === 'AccountsWithKey'
            || r === 'AdminKeyDetails'
    }

    public testNodeRoute(route: string|null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Nodes' || r === 'NodeDetails'
    }

    public testStakingRoute(route: string|null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Staking'
    }

    public testBlocksRoute(route: string|null = null): boolean {
        const r = route ?? this.currentRoute.value
        return r === 'Blocks' || r === 'BlockDetails'
    }

    //
    // Transaction
    //

    public routeToTransaction(t: Transaction): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToTransaction(t.consensus_timestamp, t.transaction_id))
    }

    public routeToTransactionId(transactionId: string|undefined,
                                consensusTimestamp: string|undefined): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToTransaction(consensusTimestamp, transactionId))
    }

    public makeRouteToTransactionObj(transaction: Transaction): RouteLocationRaw {
        return this.makeRouteToTransaction(transaction.consensus_timestamp, transaction.transaction_id)
    }

    public makeRouteToTransaction(transactionLoc: string|undefined, transactionId: string|undefined): RouteLocationRaw {
        return {
            name: 'TransactionDetails',
            params: { transactionLoc: transactionLoc },
            query: { tid: transactionId }
        }
    }

    //
    // TransactionsById
    //

    public routeToTransactionsById(transactionId: string): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToTransactionsById(transactionId))
    }

    public makeRouteToTransactionsById(transactionId: string): RouteLocationRaw {
        return {name: 'TransactionsById', params: { transactionId: transactionId}}
    }

    //
    // Account
    //

    public makeRouteToAccount(accountId: string): RouteLocationRaw {
        return {
            name: 'AccountDetails', params: {accountId: accountId}
        }
    }

    public routeToAccount(accountId: string): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToAccount(accountId))
    }

    //
    // Accounts with key
    //

    public makeRouteToAccountsWithKey(pubKey: string): RouteLocationRaw {
        return {
            name: 'AccountsWithKey', params: {pubKey: pubKey}
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
            name: 'AdminKeyDetails', params: {accountId: accountId}
        }
    }

    //
    // Token
    //

    public makeRouteToToken(tokenId: string): RouteLocationRaw {
        return { name: 'TokenDetails', params: { tokenId: tokenId}}
    }

    public routeToToken(tokenId: string): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToToken(tokenId))
    }

    //
    // Contract
    //

    public makeRouteToContract(contractId: string): RouteLocationRaw {
        return {name: 'ContractDetails', params: { contractId: contractId}}
    }

    public routeToContract(contractId: string): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToContract(contractId))
    }

    //
    // Topic
    //

    public makeRouteToTopic(topicId: string): RouteLocationRaw {
        return {name: 'TopicDetails', params: {topicId: topicId}}
    }

    public routeToTopic(topicId: string): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToTopic(topicId))
    }

    //
    // Block
    //

    public makeRouteToBlock(blockHon: string|number): RouteLocationRaw {
        return {name: 'BlockDetails', params: {blockHon: blockHon}}
    }

    public routeToBlock(blockHon: string|number): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToBlock(blockHon))
    }

    //
    // Node
    //

    public makeRouteToNode(nodeId: number): RouteLocationRaw {
        return {name: 'NodeDetails', params: {nodeId: nodeId}}
    }

    public routeToNode(nodeId: number): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToNode(nodeId))
    }

    //
    // NoSearchResult
    //

    public makeRouteToNoSearchResult(searchedId: string, errorCount: number): RouteLocationRaw {
        return {name: 'NoSearchResult', params: { searchedId: searchedId}, query: { errorCount: errorCount}}
    }

    public routeToNoSearchResult(searchedId: string, errorCount: number): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToNoSearchResult(searchedId, errorCount))
    }

    //
    // Pages
    //

    public readonly mainDashboardRoute: RouteLocationRaw = {name: 'MainDashboard'}
    public readonly transactionsRoute:  RouteLocationRaw = {name: 'Transactions'}
    public readonly tokensRoute:        RouteLocationRaw = {name: 'Tokens'}
    public readonly topicsRoute:        RouteLocationRaw = {name: 'Topics'}
    public readonly contractsRoute:     RouteLocationRaw = {name: 'Contracts'}
    public readonly accountsRoute:      RouteLocationRaw = {name: 'Accounts'}
    public readonly nodesRoute:         RouteLocationRaw = {name: 'Nodes'}
    public readonly stakingRoute:       RouteLocationRaw = {name: 'Staking'}
    public readonly blocksRoute:        RouteLocationRaw = {name: 'Blocks'}
    public readonly mobileSearchRoute:  RouteLocationRaw = {name: 'MobileSearch'}
    public readonly pageNotFoundRoute:  RouteLocationRaw = {name: 'PageNotFound'}

    public makeRouteToMobileMenu(name: unknown): RouteLocationRaw {
        return {name: 'MobileMenu', query: {from: name as string}}
    }

    public routeToMainDashboard(): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.mainDashboardRoute)
    }

    //
    // Private
    //

    private switchThemes() {
        if (this.currentNetworkEntry.value.name == NetworkRegistry.TEST_NETWORK) {
            document.documentElement.style.setProperty('--h-theme-background-color', 'var(--h-testnet-background-color)')
            document.documentElement.style.setProperty('--h-theme-highlight-color', 'var(--h-testnet-highlight-color)')
            document.documentElement.style.setProperty('--h-theme-pagination-background-color', 'var(--h-testnet-pagination-background-color)')
            document.documentElement.style.setProperty('--h-theme-box-shadow-color', 'var(--h-testnet-box-shadow-color)')
            document.documentElement.style.setProperty('--h-theme-dropdown-arrow', 'var(--h-testnet-dropdown-arrow)')
        } else if (this.currentNetworkEntry.value.name == NetworkRegistry.PREVIEW_NETWORK) {
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

    private static resetSingletons() {
        TokenInfoCollector.instance.clear()
        NodeRegistry?.instance.reload()
        CacheUtils.clearAll()
    }
}

export function fetchStringQueryParam(paramName: string, route: RouteLocationNormalizedLoaded): string|null {
    let result: string|null
    const v = route.query[paramName]
    if (typeof v == "string") {
        result = v
    } else {
        result = null
    }
    return result
}

export function fetchNumberQueryParam(paramName: string, route: RouteLocationNormalizedLoaded): number|null {
    let result: number|null
    const v = route.query[paramName]
    if (typeof v == "string") {
        const i = parseInt(v)
        result = isNaN(i) || i < 1 ? null : i
    } else {
        result = null
    }
    return result
}
