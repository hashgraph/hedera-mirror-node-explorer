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

import {NavigationFailure, RouteLocationNormalizedLoaded, RouteLocationRaw, Router} from "vue-router";
import {Transaction} from "@/schemas/HederaSchemas";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import {computed} from "vue";

export class RouteManager {

    private readonly router: Router

    //
    // Public
    //

    public constructor(router: Router) {
        this.router = router
    }

    public readonly currentNetwork = computed(() => {
        return this.currentNetworkEntry.value.name
    })

    public readonly currentNetworkEntry = computed(() => {

        let networkName: string|null
        const networkParam = this.router.currentRoute.value.params.network
        if (Array.isArray(networkParam)) {
            networkName = networkParam.length >= 1 ? networkParam[0] : null
        } else {
            networkName = networkParam
        }
        const networkEntry = networkName != null ? networkRegistry.lookup(networkName) : null

        return networkEntry != null ? networkEntry : networkRegistry.getDefaultEntry()
    })

    //
    // Transaction
    //

    public routeToTransaction(t: Transaction): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.makeRouteToTransaction(t))
    }

    public routeToTransactionId(transactionId: string|undefined, consensusTimestamp: string|undefined): Promise<NavigationFailure | void | undefined> {
        const route = {name: 'TransactionDetails', params: {transactionId: transactionId}, query: {t: consensusTimestamp}}
        return this.router.push(route)
    }

    public makeRouteToTransaction(t: Transaction): RouteLocationRaw {
        return {
            name: 'TransactionDetails',
            params: { transactionId: t.transaction_id },
            query: { t: t.consensus_timestamp }
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
    //is

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

    public makeRouteToMobileMenu(name: unknown): RouteLocationRaw {
        return {name: 'MobileMenu', query: {from: name as string}}
    }

    public routeToMainDashboard(): Promise<NavigationFailure | void | undefined> {
        return this.router.push(this.mainDashboardRoute)
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
