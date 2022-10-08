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

/*

    Node descriptions from: https://status.hedera.com

 */

import {getNetworkEntryFromCurrentRoute} from "@/router";

export class OperatorEntry {
    public readonly accountId: string
    public readonly network: string|null
    public readonly description: string
    public readonly nodeId: number|null

    constructor(accountId: string, network: string|null, description: string, nodeId: number|null) {
        this.accountId = accountId
        this.network = network
        this.description = description
        this.nodeId = nodeId
    }
}

export class OperatorRegistry {

    private readonly entries = new Map<string, OperatorEntry>()
    private readonly networkEntries = new Map<string, Map<string, OperatorEntry>>()

    constructor() {
        this.addEntry("0.0.3", "LG - Seoul, South Korea", 0)
        this.addEntry("0.0.4", "Swirlds - North Carolina, USA", 1)
        this.addEntry("0.0.5", "FIS - Florida, USA", 2)
        this.addEntry("0.0.6", "Wipro - Mumbai, India", 3)
        this.addEntry("0.0.7", "Nomura - Tokyo, Japan", 4)
        this.addEntry("0.0.8", "Google - Helsinki, Finland", 5)
        this.addEntry("0.0.9", "Zain Group - Kuwait City, Kuwait", 6)
        this.addEntry("0.0.10", "Magalu - São Paulo, Brazil", 7)
        this.addEntry("0.0.11", "Boeing - Washington, USA", 8)
        this.addEntry("0.0.12", "DLA Piper - London, UK", 9)
        this.addEntry("0.0.13", "Tata Communications - California, USA", 10)
        this.addEntry("0.0.14", "IBM - Washington, USA", 11)
        this.addEntry("0.0.15", "Deutsche Telekom - Berlin, Germany", 12)
        this.addEntry("0.0.16", "UCL - London, UK", 13)
        this.addEntry("0.0.17", "Avery Dennison - Pennsylvania, USA", 14)
        this.addEntry("0.0.18", "Dentons - Singapore", 15)
        this.addEntry("0.0.19", "Standard Bank - Johannesburg, South Africa", 16)
        this.addEntry("0.0.20", "eftpos - Sydney, Australia", 17)
        this.addEntry("0.0.21", "EDF - Paris, France", 18)
        this.addEntry("0.0.22", "Shinhan Bank - California, USA", 19)
        this.addEntry("0.0.23", "Chainlink Labs - Michigan, USA", 20)
        this.addEntry("0.0.24", "LSE - Virginia, USA", 21)
        this.addEntry("0.0.25", "IIT Madras - Georgia, USA", 22)
        this.addEntry("0.0.26", "DBS - Singapore, Republic of Singapore", 23)
        this.addEntry("0.0.27", "ServiceNow - Ogden, Utah", 24)
        this.addEntry("0.0.28", "Ubisoft - Singapore, Republic of Singapore", 25)

        this.addTestnetEntry("0.0.3", 0)
        this.addTestnetEntry("0.0.4", 1)
        this.addTestnetEntry("0.0.5", 2)
        this.addTestnetEntry("0.0.6", 3)
        this.addTestnetEntry("0.0.7", 4)
        this.addTestnetEntry("0.0.8", 5)
        this.addTestnetEntry("0.0.9", 6)

        this.addPreviewnetEntry("0.0.3", 0)
        this.addPreviewnetEntry("0.0.4", 1)
        this.addPreviewnetEntry("0.0.5", 2)
        this.addPreviewnetEntry("0.0.6", 3)
        this.addPreviewnetEntry("0.0.7", 4)
        this.addPreviewnetEntry("0.0.8", 5)
        this.addPreviewnetEntry("0.0.9", 6)

        this.addEntry("0.0.98", "Hedera fee collection account", null, null)
    }

    public lookup(accountId: string): OperatorEntry|null {
        const network = getNetworkEntryFromCurrentRoute().name
        return this.entries.get(accountId) ?? this.networkEntries.get(network)?.get(accountId) ?? null
    }

    public makeDescription(accountId: string): string | null {
        const registryEntry = operatorRegistry.lookup(accountId)
        return registryEntry !== null ? registryEntry.description : null
    }

    private addEntry(accountId: string, description: string, nodeID: number|null, network: string|null = "mainnet") {
        let targetEntries: Map<string, OperatorEntry>
        if (network != null) {
            const networkEntries = this.networkEntries.get(network);
            if (networkEntries) {
                targetEntries = networkEntries
            } else {
                targetEntries = new Map<string, OperatorEntry>()
                this.networkEntries.set(network, targetEntries)
            }
        } else {
            targetEntries = this.entries
        }
        targetEntries.set(accountId, new OperatorEntry(accountId, network, description, nodeID))
    }

    private addTestnetEntry(accountId: string, nodeID: number|null) {
        this.addEntry(accountId, "Node " + nodeID + " - testnet", nodeID, "testnet")
    }

    private addPreviewnetEntry(accountId: string, nodeID: number|null) {
        this.addEntry(accountId, "Node " + nodeID + " - previewnet", nodeID, "previewnet")
    }

}

export const operatorRegistry = new OperatorRegistry()

