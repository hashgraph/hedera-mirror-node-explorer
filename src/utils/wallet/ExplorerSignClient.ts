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


import {ProposalTypes, SessionTypes, SignClientTypes} from "@walletconnect/types";
import SignClient from "@walletconnect/sign-client";
import {getSdkError} from '@walletconnect/utils'
import {networkRegistry} from "@/schemas/NetworkRegistry";

export class ExplorerSignClient {

    private readonly signClient: SignClient
    private readonly projectId: string

    private static readonly PRODUCT_NAME = import.meta.env.VITE_APP_PRODUCT_NAME ?? "Hedera Mirror Node Explorer"

    private static readonly METADATA: SignClientTypes.Metadata = {
        name: ExplorerSignClient.PRODUCT_NAME,
        description: "A ledger explorer for the Hedera network",
        url: "https://localhost:5173",
        icons: [],
    }

    //
    // Public
    //

    public static async init(projectId: string): Promise<ExplorerSignClient> {
        const signClient = await SignClient.init({
            logger: 'error',
            projectId: projectId,
            // optional parameters
            relayUrl: "wss://relay.walletconnect.com",
            metadata: ExplorerSignClient.METADATA
        })
        return Promise.resolve(new ExplorerSignClient(signClient, projectId))
    }

    public getLastSession(network: string): SessionTypes.Struct|null {
        let result: SessionTypes.Struct|null = null

        const sessions = this.signClient.session.getAll()
        const hederaPrefix = ExplorerSignClient.makeCaChainForHedera(network) + ":"
        const eip155Prefix = ExplorerSignClient.makeCaChainForEIP155(network) + ":"
        for (const session of sessions.reverse()) {
            for (const ns of Object.values(session.namespaces)) {
                for (const a of ns.accounts) {
                    if (a.startsWith(hederaPrefix) || a.startsWith(eip155Prefix)) {
                        result = session
                        break
                    }
                }
            }
        }

        return result
    }

    public getAllSessions(): SessionTypes.Struct[] {
        return this.signClient.session.getAll()
    }

    public async connect(network: string) : Promise<SessionTypes.Struct> {
        let result: SessionTypes.Struct

        const params = {
            optionalNamespaces: ExplorerSignClient.makeNamespaces([network])
        }
        const { uri, approval } = await this.signClient.connect(params)
        const {WalletConnectModal} = await import("@walletconnect/modal")
        const connectModal = new WalletConnectModal({ projectId: this.projectId })
        try {
            await connectModal.openModal({uri})
            result = await approval()
        } finally {
            connectModal.closeModal()
        }

        if (this.signClient.session.getAll().indexOf(result) != -1) {
            console.log("OK")
        } else {
            console.log("KO")
        }
        return Promise.resolve(result)
    }

    public async disconnect(session: SessionTypes.Struct): Promise<void> {
        await this.signClient.disconnect({
            topic: session.topic,
            reason: getSdkError('USER_DISCONNECTED'),
        })
    }

    public async signAndExecute_hedera(session: SessionTypes.Struct, network: string, accountId: string, transactionBase64: string): Promise<unknown> {
        // https://hips.hedera.com/hip/hip-820
        const caChainId = ExplorerSignClient.makeCaChainForHedera(network)
        const requestParams = {
            topic: session.topic,
            request: {
                method: "hedera_signAndExecuteTransaction",
                params: {
                    signerAccountId: caChainId + ":" + accountId,
                    transactionList: transactionBase64,
                },
            },
            chainId: caChainId
        }

        const result = await this.signClient.request(requestParams)

        return Promise.resolve(result)
    }

    public async signAndExecute_eip155(session: SessionTypes.Struct, network: string, params: unknown): Promise<string> {
        const caChainId = ExplorerSignClient.makeCaChainForEIP155(network)
        const requestParams = {
            topic: session.topic,
            request: {
                method: "eth_sendTransaction",
                params: [params]
            },
            chainId: caChainId
        }

        return this.signClient.request(requestParams)

        // Breaks with error: { code: 1, message: "Invalid Id" } … regression in Metamask ?
        // https://github.com/MetaMask/metamask-mobile/issues/10074
    }

    //
    // Public (static tools)
    //

    public static findHederaAccounts(session: SessionTypes.Struct, network: string): string[] {
        const result: string[] = []
        const prefix = this.makeCaChainForHedera(network) + ":"
        for (const ns of Object.values(session.namespaces)) {
            for (const a of ns.accounts) {
                if (a.startsWith(prefix)) {
                    result.push(a.slice(prefix.length))
                }
            }
        }
        return result
    }

    public static findEIP155Accounts(session: SessionTypes.Struct, network: string): string[] {
        const result: string[] = []
        const prefix = this.makeCaChainForEIP155(network) + ":"
        for (const ns of Object.values(session.namespaces)) {
            for (const a of ns.accounts) {
                if (a.startsWith(prefix)) {
                    result.push(a.slice(prefix.length))
                }
            }
        }
        return result
    }

    public static isUserRejectError(reason: unknown): boolean {
        return typeof reason == "object"
            && reason !== null
            && "message" in reason
            && typeof reason.message == "string"
            && reason.message.toLowerCase().indexOf("reject") != -1
    }

    //
    // Private
    //

    private constructor(signClient: SignClient, projectId: string) {
        this.signClient = signClient
        this.projectId = projectId

        this.signClient.on('session_event', (event) => {
            console.log(event)
        })

        this.signClient.on('session_update', (event) => {
            console.log(event)
        })

        this.signClient.on('session_delete', (pairing) => {
            console.log(pairing)
        })

        this.signClient.core.pairing.events.on('pairing_delete', (pairing) => {
            // Session was deleted
            console.log(pairing)
        })

    }

    private static makeCaChainForEIP155(network: string): string {
        const r = networkRegistry.lookup(network) ?? networkRegistry.getDefaultEntry()
        return "eip155:" + r.sourcifySetup?.chainID
    }

    private static makeCaChainForHedera(network: string): string {
        return "hedera:" + network
    }


    private static makeNamespaces(networks: [string]): ProposalTypes.OptionalNamespaces {
        const hederaChains: string[] = []
        const eip155Chains: string[] = []
        for (const network of networks) {
            hederaChains.push(this.makeCaChainForHedera(network))
            eip155Chains.push(this.makeCaChainForEIP155(network))
        }
        return {
            hedera: {
                chains:hederaChains,
                methods: [
                    // "hedera_getNodeAddresses",
                    // "hedera_executeTransaction",
                    // "hedera_signMessage",
                    // "hedera_signAndExecuteQuery",
                    "hedera_signAndExecuteTransaction",
                    // "hedera_signTransaction"
                ],
                events: [
                    'chainChanged',
                    'accountsChanged'
                ]
            },
            eip155: {
                chains: eip155Chains,
                methods: [
                    'eth_sendRawTransaction',
                ],
                events: [
                    'chainChanged',
                    'accountsChanged'
                ]
            },
        }
    }
}
