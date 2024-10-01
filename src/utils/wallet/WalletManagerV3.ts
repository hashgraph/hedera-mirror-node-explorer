// noinspection DuplicatedCode

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


import {SessionTypes} from "@walletconnect/types";
import {computed, ref, shallowRef, watch} from "vue";
import {AccountBalanceTransactions, ContractResultDetails} from "@/schemas/HederaSchemas";
import {ExplorerSignClient} from "@/utils/wallet/ExplorerSignClient";
import {EntityID} from "@/utils/EntityID";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {EthereumAddress} from "@/utils/EthereumAddress";
import {WalletAdaptor, WalletAdaptorError} from "@/utils/wallet/WalletAdaptor";
import {WalletAdapter_Hedera} from "@/utils/wallet/WalletAdaptor_Hedera";
import {WalletAdapter_Ethereum} from "@/utils/wallet/WalletAdaptor_Ethereum";
import {routeManager} from "@/router";
import {AppStorage} from "@/AppStorage";


export enum WalletConnectStatus {
    disabled,
    initializing,
    disconnected,
    connected,
    connecting,
    switching
}


export class WalletManagerV3 {

    public readonly accountId = ref<string|null>(null)
    private readonly signClient = shallowRef<ExplorerSignClient|null>(null)
    private readonly session = shallowRef<SessionTypes.Struct|null>(null)
    private readonly hederaAccountIds = ref<string[]>([])
    private readonly eip155AccountIds = ref<string[]>([])
    private readonly initializing = ref(false)
    private readonly connecting = ref(false)
    private readonly switching = ref(false)

    //
    // Public
    //

    public constructor() {
        watch(routeManager.currentNetwork, this.currentNetworkDidChange, { immediate: true })
        watch(this.session, this.sessionDidChange, { immediate: true })
        watch(this.accountIds, this.accountIdsDidChange, { immediate: true })
        this.initialize().catch()
    }

    public readonly status = computed<WalletConnectStatus>(() => {
        let result: WalletConnectStatus

        const projectId = this.fetchProjectId()
        if (projectId === null) {
            result = WalletConnectStatus.disabled
        } else if (this.initializing.value) {
            result = WalletConnectStatus.initializing
        } else if (this.connecting.value) {
            result = WalletConnectStatus.connecting
        } else if (this.switching.value) {
            result = WalletConnectStatus.switching
        } else if (this.signClient.value === null) {
            // signClient initialization failed
            result = WalletConnectStatus.disconnected
        } else {
            result = this.session.value !== null ? WalletConnectStatus.connected : WalletConnectStatus.disconnected
        }

        return result
    })

    public readonly walletName = computed(() => {
        let result: string|null
        if (this.session.value != null) {
            result = this.session.value.peer.metadata.name
        } else {
            result = null
        }
        return result
    })

    public readonly walletIconURL = computed<string|null>(() => {
        let result: string|null
        if (this.session.value != null) {
            const icons = this.session.value.peer.metadata.icons
            if (icons.length > 0) {
                result = icons[0]
            } else {
                const walletName = this.session.value.peer.metadata.name
                result = WalletManagerV3.FALLBACK_ICONS.get(walletName) ?? null
            }
        } else {
            result = null
        }
        return result
    })

    public readonly isHederaWallet = computed<boolean>(() => {
        let result: boolean
        if (this.session.value != null && this.accountId.value !== null) {
            result = this.hederaAccountIds.value.indexOf(this.accountId.value) != -1
        } else {
            result = false
        }
        return result
    })

    public readonly isEthereumWallet = computed<boolean>(() => {
        let result: boolean
        if (this.session.value != null && this.accountId.value !== null) {
            result = this.eip155AccountIds.value.indexOf(this.accountId.value) != -1
        } else {
            result = false
        }
        return result
    })

    public readonly accountIds = computed<string[]>(() => {
        const allAccountIds = new Set<string>()
        this.hederaAccountIds.value.forEach((accountId) => allAccountIds.add(accountId))
        this.eip155AccountIds.value.forEach((accountId) => allAccountIds.add(accountId))
        const result = Array.from(allAccountIds)
        result.sort(EntityID.compareAccountID)
        return result
    })

    public async connect(): Promise<void> {
        if (this.signClient.value !== null) {
            this.connecting.value = true
            try {
                await this.disconnect()
            } catch {
                // Carefully ignored
            }
            try {
                this.session.value = await this.signClient.value.connect(routeManager.currentNetwork.value)
            } catch(reason) {
                if (!ExplorerSignClient.isUserRejectError(reason)) {
                    throw this.makeConnectError(reason)
                }
            } finally {
                this.connecting.value = false
            }
        }
    }

    public async disconnect(): Promise<void> {
        if (this.signClient.value !== null && this.session.value != null) {
            await this.signClient.value.disconnect(this.session.value)
            this.session.value = null
        }
    }

    //
    // Public (transactions)
    //

    public async associateToken(tokenId: string): Promise<string> {
        if (this.adaptor.value !== null) {
            return this.adaptor.value.associateToken(tokenId)
        } else {
            throw "bug"
        }
    }

    public async dissociateToken(tokenId: string): Promise<string> {
        if (this.adaptor.value !== null) {
            return this.adaptor.value.dissociateToken(tokenId)
        } else {
            throw "bug"
        }
    }

    public async callContract(contractId: string, functionData: string): Promise<ContractResultDetails | string> {
        if (this.adaptor.value !== null) {
            return this.adaptor.value.callContract(contractId, functionData)
        } else {
            throw "bug"
        }
    }

    //
    // Public (hedera transactions)
    //

    public async rejectTokens(tokenIds: string[]): Promise<string> {
        if (this.adaptor.value instanceof WalletAdapter_Hedera) {
            return this.adaptor.value.rejectTokens(tokenIds)
        } else {
            throw "bug"
        }
    }

    public async changeStaking(stakedNodeId: number | null, stakedAccountId: string | null, declineReward: boolean | null): Promise<string> {
        if (this.adaptor.value instanceof WalletAdapter_Hedera) {
            return this.adaptor.value.changeStaking(stakedNodeId, stakedAccountId, declineReward)
        } else {
            throw "bug"
        }
    }

    public async approveHbarAllowance(spender: string, amount: number): Promise<string> {
        if (this.adaptor.value instanceof WalletAdapter_Hedera) {
            return this.adaptor.value.approveHbarAllowance(spender, amount)
        } else {
            throw "bug"
        }
    }

    public async approveTokenAllowance(token: string, spender: string, amount: number): Promise<string> {
        if (this.adaptor.value instanceof WalletAdapter_Hedera) {
            return this.adaptor.value.approveTokenAllowance(token, spender, amount)
        } else {
            throw "bug"
        }
    }

    public async approveNFTAllowance(token: string, spender: string, serialNumbers: number[]): Promise<string> {
        if (this.adaptor.value instanceof WalletAdapter_Hedera) {
            return this.adaptor.value.approveNFTAllowance(token, spender, serialNumbers)
        } else {
            throw "bug"
        }
    }

    public async deleteNftAllowance(token: string, serialNumber: number): Promise<string> {
        if (this.adaptor.value instanceof WalletAdapter_Hedera) {
            return this.adaptor.value.deleteNftAllowance(token, serialNumber)
        } else {
            throw "bug"
        }
    }

    public async deleteNftAllSerialsAllowance(token: string, spender: string): Promise<string> {
        if (this.adaptor.value instanceof WalletAdapter_Hedera) {
            return this.adaptor.value.deleteNftAllSerialsAllowance(token, spender)
        } else {
            throw "bug"
        }
    }

    //
    // Private
    //

    private async initialize(): Promise<void> {

        const projectId = this.fetchProjectId()
        if (projectId !== null && this.signClient.value === null) {
            this.initializing.value = true
            try {
                this.signClient.value = await ExplorerSignClient.init(projectId)
                this.session.value = this.signClient.value.getLastSession(routeManager.currentNetwork.value)
            } catch {
                this.signClient.value = null
                this.session.value = null
            } finally {
                this.initializing.value = false
            }
        }
        // else leaves this.dAppConnector unchanged
    }

    private fetchProjectId(): string|null {
        return import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID ?? null
    }

    private readonly currentNetworkDidChange = () => {
        if (this.signClient.value !== null) {
            this.session.value = this.signClient.value.getLastSession(routeManager.currentNetwork.value)
        }
    }

    private readonly sessionDidChange = async () => {
        if (this.session.value !== null) {
            this.switching.value = true
            try {
                this.hederaAccountIds.value = await WalletManagerV3.fetchHederaAccountIds(this.session.value, routeManager.currentNetwork.value)
            } catch {
                this.hederaAccountIds.value = []
            }
            try {
                this.eip155AccountIds.value = await WalletManagerV3.fetchEip155AccountIds(this.session.value, routeManager.currentNetwork.value)
            } catch {
                this.eip155AccountIds.value = []
            }
            this.switching.value = false
        } else {
            this.hederaAccountIds.value = []
            this.eip155AccountIds.value = []
        }
    }

    private static async fetchHederaAccountIds(session: SessionTypes.Struct, network: string): Promise<string[]> {
        const result: string[] = []
        const candidates = ExplorerSignClient.findHederaAccounts(session, network)
        for (const c of candidates) {
            const accountInfo = await WalletManagerV3.lookupAccount(c)
            if (accountInfo !== null && accountInfo.account !== null) {
                result.push(accountInfo.account)
            }
        }
        return Promise.resolve(result)
    }

    public static async fetchEip155AccountIds(session: SessionTypes.Struct, network: string): Promise<string[]> {
        const result: string[] = []
        const candidates = ExplorerSignClient.findEIP155Accounts(session, network)
        for (const c of candidates) {
            const accountInfo = await WalletManagerV3.lookupAccount(c)
            if (accountInfo !== null && accountInfo.account !== null) {
                result.push(accountInfo.account)
            }
        }
        return result
    }

    private readonly accountIdsDidChange = () => {
        if (this.accountIds.value.length > 0) {
            const candidate1 = AppStorage.getWalletAccountId(routeManager.currentNetwork.value)
            const candidate2 = this.accountIds.value[0]
            if (candidate1 !== null && this.accountIds.value.indexOf(candidate1) !== -1) {
                this.accountId.value = candidate1
            } else {
                this.accountId.value = candidate2
            }
        } else {
            this.accountId.value = null
        }
    }

    private readonly adaptor = computed<WalletAdaptor|null>(() => {
        let result: WalletAdaptor|null
        if (this.accountId.value !== null && this.session.value !== null && this.signClient.value !== null) {
            if (this.isHederaWallet.value) {
                result = new WalletAdapter_Hedera(
                    this.accountId.value, this.session.value, this.signClient.value, routeManager.currentNetwork.value)
            } else if (this.isEthereumWallet.value) {
                result = new WalletAdapter_Ethereum(
                    this.accountId.value, this.session.value, this.signClient.value, routeManager.currentNetwork.value)
            } else {
                result = null
            }
        } else {
            result = null
        }
        return result
    })
    private static async lookupAccount(idOrEvmAddress: string): Promise<AccountBalanceTransactions | null> {
        let result: AccountBalanceTransactions | null
        const accountId = EntityID.parse(idOrEvmAddress)
        if (accountId !== null) {
            result = await AccountByIdCache.instance.lookup(accountId.toString())
        } else {
            const accountAddress = EthereumAddress.parse(idOrEvmAddress)
            if (accountAddress !== null) {
                result = await AccountByAddressCache.instance.lookup(accountAddress.toString())
            } else {
                result = null
            }
        }
        return Promise.resolve(result)
    }

    // Some wallets do not provide icon information => we try to fix
    private static readonly FALLBACK_ICONS = new Map<string,string>([
        ["MetaMask Wallet", "data:image/png;base64,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"]
    ])

    private makeConnectError(reason: unknown): WalletAdaptorError {
        const extra = reason instanceof Error ? reason.message : JSON.stringify(reason)
        const message = "Connection to " + this.walletName.value + " failed"
        return new WalletAdaptorError(message, extra)
    }

}


