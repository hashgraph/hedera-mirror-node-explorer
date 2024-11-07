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

import {EntityID} from "@/utils/EntityID";
import axios from "axios";
import {ref, Ref} from "vue";
import {EthereumAddress} from "@/utils/EthereumAddress";
import {hip15checksum} from "@/schemas/HederaUtils";

declare global {
    interface Window {
        // adding custom properties
        configs: {
            DOCKER_LOCAL_MIRROR_NODE_MENU_NAME: string,
            DOCKER_LOCAL_MIRROR_NODE_URL: string,
        }
    }
}

export class NetworkEntry {

    public static readonly NETWORK_NAME_MAX_LENGTH = 15

    public readonly name: string
    public readonly displayName: string
    public readonly url: string
    public readonly ledgerID: string

    // When set to 'true', this variable will enable connecting a wallet
    public readonly enableWallet: boolean

    // When set to 'true', this variable will enable staking feature
    public readonly enableStaking: boolean

    // When set to 'true', this variable will enable properties related to account/contract expiry
    public readonly enableExpiry: boolean

    public readonly sourcifySetup: SourcifySetup | null

    constructor(
        name: string,
        displayName: string,
        url: string,
        ledgerID: string,
        enableWallet: boolean,
        enableStaking: boolean,
        enableExpiry: boolean,
        sourcifySetup: SourcifySetup | null
    ) {
        this.name = name
        this.displayName = displayName ?? name.toUpperCase()
        this.url = url
        this.ledgerID = ledgerID
        this.enableWallet = enableWallet
        this.enableStaking = enableStaking
        this.enableExpiry = enableExpiry
        this.sourcifySetup = sourcifySetup
    }

    static decode(encoding: Record<string, unknown>): NetworkEntry | null {
        let result: NetworkEntry | null

        const name = encoding["name"]
        const displayName = encoding["displayName"]
        const url = encoding["url"]
        const ledgerID = encoding["ledgerID"]
        const enableWallet = encoding["enableWallet"]
        const enableStaking = encoding["enableStaking"]
        const enableExpiry = encoding["enableExpiry"]
        const sourcifySetupEncoding = encoding["sourcifySetup"]

        if (typeof name == "string" &&
            (typeof displayName == "string" || typeof displayName == "undefined") &&
            typeof url == "string" &&
            typeof ledgerID == "string" &&
            typeof enableWallet == "boolean" &&
            typeof enableStaking == "boolean" &&
            typeof enableExpiry == "boolean" &&
            (typeof sourcifySetupEncoding == "object" || typeof sourcifySetupEncoding == "undefined")) {

            let tidyDisplayName = (displayName ?? name).toUpperCase()
            if (tidyDisplayName.length > this.NETWORK_NAME_MAX_LENGTH) {
                tidyDisplayName = tidyDisplayName.slice(0, this.NETWORK_NAME_MAX_LENGTH) + '…'
            }

            if (sourcifySetupEncoding !== undefined && sourcifySetupEncoding !== null) {
                const sourcifySetup = SourcifySetup.decode(sourcifySetupEncoding as Record<string, unknown>)
                if (sourcifySetup !== null) {
                    result = new NetworkEntry(
                        name,
                        tidyDisplayName,
                        url,
                        ledgerID,
                        enableWallet,
                        enableStaking,
                        enableExpiry,
                        sourcifySetup
                    )
                } else {
                    result = null
                }
            } else {
                result = new NetworkEntry(
                    name,
                    tidyDisplayName,
                    url,
                    ledgerID,
                    enableWallet,
                    enableStaking,
                    enableExpiry,
                    null
                )
            }
        } else {
            result = null
        }

        return result
    }
}

export class SourcifySetup {

    public readonly activate: boolean
    public readonly repoURL: string
    public readonly serverURL: string
    public readonly verifierURL: string
    public readonly chainID: number

    constructor(activate: boolean, repoURL: string, serverURL: string, verifierURL: string, chainID: number) {
        this.activate = activate
        this.repoURL = repoURL
        this.serverURL = serverURL
        this.verifierURL = verifierURL
        this.chainID = chainID
    }

    static decode(encoding: Record<string, unknown>): SourcifySetup | null {
        let result: SourcifySetup | null
        const activate = encoding["activate"]
        const repoURL = encoding["repoURL"]
        const serverURL = encoding["serverURL"]
        const verifierURL = encoding["verifierURL"]
        const chainID = encoding["chainID"]
        if (typeof activate == "boolean" &&
            typeof repoURL == "string" &&
            typeof serverURL == "string" &&
            typeof verifierURL == "string" &&
            typeof chainID == "number") {
            result = new SourcifySetup(activate, repoURL, serverURL, verifierURL, chainID)
        } else {
            result = null
        }
        return result
    }

    // https://docs.sourcify.dev/docs/api/repository/get-file-static/

    makeRequestURL(contractAddress: string): string {
        const normalizedAddress = EthereumAddress.normalizeEIP55(contractAddress)
        return this.serverURL + "files/any/" + this.chainID + "/" + normalizedAddress
    }

    makeContractSourceURL(contractAddress: string, full: boolean): string {
        const normalizedAddress = EthereumAddress.normalizeEIP55(contractAddress)
        const matchPrefix = full ? "full_match/" : "partial_match/"
        return this.repoURL + matchPrefix + this.chainID + "/" + normalizedAddress
    }

    makeCheckAllByAddressURL(): string {
        return this.serverURL + "check-all-by-addresses"
    }

    makeContractLookupURL(contractAddress: string): string {
        const normalizedAddress = EthereumAddress.normalizeEIP55(contractAddress)
        return this.verifierURL + "lookup/" + normalizedAddress
    }

    hexChainID(): string {
        return "0x" + this.chainID.toString(16)
    }
}

export class NetworkRegistry {

    public static readonly NETWORKS_CONFIG_URL = window.location.origin + '/networks-config.json'
    public static readonly MAX_NETWORK_NUMBER = 15

    public static readonly MAIN_NETWORK = 'mainnet'
    public static readonly TEST_NETWORK = 'testnet'
    public static readonly PREVIEW_NETWORK = 'previewnet'

    private static readonly DEFAULT_NETWORK = NetworkRegistry.MAIN_NETWORK
    private defaultEntry: NetworkEntry

    public readonly entries: Ref<Array<NetworkEntry>> = ref([
        {
            name: 'mainnet',
            displayName: 'MAINNET',
            url: "https://mainnet-public.mirrornode.hedera.com/",
            ledgerID: '00',
            enableWallet: true,
            enableStaking: true,
            enableExpiry: true,
            sourcifySetup: new SourcifySetup(true, "", "", "", 0x127)
        },
        {
            name: 'testnet',
            displayName: 'TESTNET',
            url: "https://testnet.mirrornode.hedera.com/",
            ledgerID: '01',
            enableWallet: true,
            enableStaking: true,
            enableExpiry: false,
            sourcifySetup: new SourcifySetup(true, "", "", "", 0x128)
        },
        {
            name: 'previewnet',
            displayName: 'PREVIEWNET',
            url: "https://previewnet.mirrornode.hedera.com/",
            ledgerID: '02',
            enableWallet: false,
            enableStaking: true,
            enableExpiry: false,
            sourcifySetup: new SourcifySetup(true, "", "", "", 0x129)
        }
    ])

    constructor() {
        this.defaultEntry = this.lookup(NetworkRegistry.DEFAULT_NETWORK) ?? this.entries.value[0]
    }

    public readCustomConfig(): void {
        axios.get<unknown>(NetworkRegistry.NETWORKS_CONFIG_URL)
            .then((response) => {

                const customEntries = NetworkRegistry.decode(response.data)
                if (customEntries !== null) {
                    this.entries.value = customEntries
                    this.defaultEntry = this.lookup(NetworkRegistry.DEFAULT_NETWORK) ?? this.entries.value[0]
                }

                // Take into account possible additional node defined in docker configuration
                const localNodeURL = window.configs?.DOCKER_LOCAL_MIRROR_NODE_URL
                const localNodeMenuName =
                    window.configs?.DOCKER_LOCAL_MIRROR_NODE_MENU_NAME && window.configs.DOCKER_LOCAL_MIRROR_NODE_MENU_NAME.length > 0
                        ? window.configs.DOCKER_LOCAL_MIRROR_NODE_MENU_NAME
                        : "DEVNET"

                if (localNodeURL) {
                    console.warn(
                        "FOR DEVELOPMENT PURPOSES ONLY:\n" +
                        `Defining an additional network with URL: ${localNodeURL} and name: ${localNodeMenuName} \n`)

                    this.entries.value.push(
                        new NetworkEntry('devnet', localNodeMenuName, localNodeURL, 'FF', false, true, false, null)
                    )
                }
            })
            .catch((reason) => console.warn(`Failed to get ${NetworkRegistry.NETWORKS_CONFIG_URL}: ${reason}`))
    }

    public getDefaultEntry(): NetworkEntry {
        return this.defaultEntry
    }

    public lookup(name: string): NetworkEntry | null {
        return this.entries.value.find(element => element.name === name) ?? null
    }

    public isValidChecksum(id: string, checksum: string, network: string): boolean {
        return this.computeChecksum(id, network) == checksum
    }

    public computeChecksum(id: string, network: string): string {
        const ledgerID = this.lookup(network)?.ledgerID
        return hip15checksum(ledgerID ?? 'FF', id)
    }

    public makeAddressWithChecksum(address: string, network: string): string | null {
        const entity = EntityID.normalize(address)
        return entity ? (entity + '-' + this.computeChecksum(entity, network)) : null
    }

    private static decode(config: unknown): Array<NetworkEntry> | null {
        let result: Array<NetworkEntry> | null

        if (Array.isArray(config)) {
            result = Array<NetworkEntry>()
            for (const i of config) {
                if (result.length >= this.MAX_NETWORK_NUMBER) {
                    console.warn(`Dropping networks beyond ${this.MAX_NETWORK_NUMBER} entries`)
                    result = null
                    break
                } else {
                    const newEntry = NetworkEntry.decode(i)
                    if (newEntry === null) {
                        console.warn("Invalid networks-config.json configuration file")
                        result = null
                        break
                    } else if (result.find(e => newEntry.name === e.name)) {
                        console.warn("Dropping network with duplicate name: " + newEntry.name)
                    } else {
                        result.push(newEntry)
                    }
                }
            }
        } else {
            result = null
        }

        return result
    }
}

export const networkRegistry = new NetworkRegistry()
