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

import {Contract, ContractsResponse, TransactionResponse} from "@/schemas/HederaSchemas";
import {EntityCache} from "@/utils/cache/base/EntityCache";
import axios, {AxiosError, AxiosResponse} from "axios";
import {routeManager} from "@/router";
import {SourcifyCache} from "@/utils/cache/SourcifyCache";

export class VerifiedContractsBuffer {

    private static MAX_ITERATIONS = 10
    private static ITERATION_LIMIT = 25
    private candidates: Contract[] = []
    private verifiedAddresses: string[] = []
    private readonly accountId: string

    public static MAX_CANDIDATES = VerifiedContractsBuffer.ITERATION_LIMIT * VerifiedContractsBuffer.MAX_ITERATIONS
    public contracts: Contract[] = []
    public overflow = false

    public constructor(accountId: string) {
        this.accountId = accountId
    }

    public async update(): Promise<void> {

        this.contracts = []
        const sourcifySetup = routeManager.currentNetworkEntry.value.sourcifySetup!

        if (sourcifySetup !== null && sourcifySetup.activate) {
            const isRefresh = this.candidates.length > 0
            let loadedContracts: Contract[] = []
            let nextURL: string | null = "api/v1/transactions"
            let iteration = 0

            while (nextURL !== null && iteration < VerifiedContractsBuffer.MAX_ITERATIONS) {
                const params = {
                    limit: VerifiedContractsBuffer.ITERATION_LIMIT,
                    order: 'desc',
                    'account.id': this.accountId,
                    transactiontype: 'CONTRACTCREATEINSTANCE',
                    result: 'success',
                    'timestamp': isRefresh ? `gt:${this.candidates[0].created_timestamp}` : undefined
                }
                const response: AxiosResponse<TransactionResponse> =
                    await axios.get<TransactionResponse>(nextURL, {params: iteration === 0 ? params : undefined})
                const loadedTransactions = response.data.transactions ?? []

                if (loadedTransactions.length > 0) {
                    let requestURL = "api/v1/contracts?"
                    for (let i = 0; i < loadedTransactions.length; i++) {
                        if (i > 0) {
                            requestURL += '&'
                        }
                        if (loadedTransactions[i].entity_id != null) {
                            requestURL += 'contract.id=' + loadedTransactions[i].entity_id
                        }
                    }
                    const response: AxiosResponse<ContractsResponse> = await axios.get<ContractsResponse>(requestURL)
                    loadedContracts = loadedContracts.concat(response.data.contracts ?? [])
                }

                nextURL = response.data.links?.next ?? null
                iteration += 1
            }

            if (loadedContracts.length > 0) {
                this.candidates = loadedContracts.concat(this.candidates)
                this.overflow = (this.candidates.length >= VerifiedContractsBuffer.MAX_CANDIDATES)
                this.candidates = this.candidates.slice(0, VerifiedContractsBuffer.MAX_CANDIDATES)

                // Only check the verification status of the newly loaded contracts
                // to avoid unduly loading Sourcify server at each refresh
                const addressesToCheck: string[] = []
                for (const c of loadedContracts ?? []) {
                    addressesToCheck.push(c.evm_address)
                }

                const newlyVerifiedAddresses = await SourcifyCache.checkAllContracts(addressesToCheck)
                this.verifiedAddresses = this.verifiedAddresses.concat(newlyVerifiedAddresses)
            }

            for (const c of this.candidates) {
                if (c.contract_id != null && this.verifiedAddresses.includes(c.evm_address)) {
                    this.contracts.push(c)
                    const record = await SourcifyCache.instance.lookup(c.contract_id)
                    if (record === null) {
                        SourcifyCache.instance.forget(c.contract_id)
                    }
                }
            }
        }
        return Promise.resolve()
    }
}

export class VerifiedContractsByAccountCache extends EntityCache<string, VerifiedContractsBuffer | null> {

    public static readonly instance = new VerifiedContractsByAccountCache()

    protected async load(key: string): Promise<VerifiedContractsBuffer | null> {
        const buffer = new VerifiedContractsBuffer(key)
        await buffer.update().catch(this.errorHandler)
        return Promise.resolve(buffer)
    }

    private readonly errorHandler = (reason: unknown): void => {
        console.log("reason=" + reason)
        if (axios.isAxiosError(reason)) {
            const axiosError = reason as AxiosError
            console.log("url=" + axiosError.config?.url)
        }
    }
}
