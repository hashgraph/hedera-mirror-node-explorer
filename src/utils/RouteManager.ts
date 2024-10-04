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

import {NavigationFailure, RouteLocationNormalizedLoaded, RouteLocationRaw, Router} from "vue-router";
import {Transaction} from "@/schemas/HederaSchemas";
import {NetworkRegistry, networkRegistry} from "@/schemas/NetworkRegistry";
import {computed, ref, watch, WatchStopHandle} from "vue";
import router from "@/router";
import {AppStorage} from "@/AppStorage";
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
            AppStorage.setLastNetwork(this.currentNetworkEntry.value)
            axios.defaults.baseURL = this.currentNetworkEntry.value.url
            this.updateSelectedNetworkSilently()
            this.switchThemes()
        }, {immediate: true})
        watch(this.currentNetwork, () => {
            RouteManager.resetSingletons()
        })
    }

    public readonly currentRoute = computed(() => this.router.currentRoute.value?.name)

    public readonly currentNetwork = computed(() => {
        return this.currentNetworkEntry.value.name
    })

    public readonly currentNetworkEntry = computed(() => {

        let networkName: string | null
        const networkParam = this.router.currentRoute.value?.params?.network
        if (Array.isArray(networkParam)) {
            networkName = networkParam.length >= 1 ? networkParam[0] : null
        } else {
            networkName = networkParam
        }
        const networkEntry = networkName != null ? networkRegistry.lookup(networkName) : null

        return networkEntry != null ? networkEntry : networkRegistry.getDefaultEntry()
    })

    public currentVerifierUrl = computed(
        () => this.currentNetworkEntry.value.sourcifySetup?.verifierURL)

    public selectedNetwork = ref(networkRegistry.getDefaultEntry().name)

    public selectedNetworkWatchHandle: WatchStopHandle | undefined

    public updateSelectedNetworkSilently(): void {
        if (this.selectedNetworkWatchHandle) {
            this.selectedNetworkWatchHandle()
        }
        this.selectedNetwork.value = this.currentNetwork.value
        this.selectedNetworkWatchHandle = watch(this.selectedNetwork, (selection) => {
            router.push({
                name: "MainDashboard",
                params: {network: selection}
            })
        })
    }

    public readonly previousRoute = computed(() => (this.router.currentRoute.value?.query.from as string))

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

    public routeToCollection(accountId: string, tokenId: string, event: MouseEvent): Promise<NavigationFailure | void | undefined> {
        let result: Promise<NavigationFailure | void | undefined>
        if (event.ctrlKey || event.metaKey || event.button === 1) {
            const routeData = this.router.resolve(this.makeRouteToCollection(accountId, tokenId))
            window.open(routeData.href, '_blank')
            result = Promise.resolve()
        } else {
            result = this.router.push(this.makeRouteToCollection(accountId, tokenId))
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
        CacheUtils.clearAll()
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
