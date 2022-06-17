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

          This scheduled maintenance affected: Hedera Mainnet (v0.22.4) | Network Uptime and Hedera Mainnet (v0.22.4) | Individual Nodes
          (Node 0 (account 0.0.3) | Hosted for LG | Seoul, South Korea,
          Node 1 (account 0.0.4) | Hosted by Swirlds | North Carolina, USA,
          Node 2 (account 0.0.5) | Hosted by FIS | Florida, USA,
          Node 3 (account 0.0.6) | Hosted by Wipro | Mumbai, India,
          Node 4 (account 0.0.7) | Hosted by Nomura | Tokyo, Japan,
          Node 5 (account 0.0.8) | Hosted by Google | Helsinki, Finland,
          Node 6 (account 0.0.9) | Hosted by Zain Group | Kuwait City, Kuwait,
          Node 7 (account 0.0.10) | Hosted by Magalu | São Paulo, Brazil,
          Node 8 (account 0.0.11) | Hosted for Boeing | Toronto, Canada,
          Node 9 (account 0.0.12) | Hosted by DLA Piper | London, UK,
          Node 10 (account 0.0.13) | Hosted by Tata Communications | California, USA,
          Node 11 (account 0.0.14) | Hosted by IBM | Washington, USA,
          Node 12 (account 0.0.15) | Hosted by Deutsche Telekom | Berlin, Germany,
          Node 13 (account 0.0.16) | Hosted by UCL | Amsterdam, Netherlands,
          Node 14 (account 0.0.17) | Hosted by Avery Dennison | Pennsylvania, USA,
          Node 15 (account 0.0.18) | Hosted for Dentons | Frankfurt, DE,
          Node 16 (account 0.0.19) | Hosted for Standard Bank | Warsaw, Poland,
          Node 17 (account 0.0.20) | Hosted for eftpos | Oregon, USA,
          Node 18 (account 0.0.21) | Hosted by EDF | Paris, France,
          Node 19 (account 0.0.22) | Hosted for Shinhan Bank | Seoul, South Korea,
          Node 20 (account 0.0.23) | Hosted for Chainlink Labs | Michigan, USA,
          Node 21 (account 0.0.24) | Hosted for LSE | Virginia, USA,
          Node 22 (account 0.0.25) | Hosted for IIT Madras | Georgia, USA,
          Node 23 (account 0.0.26) | Hosted for DBS | Pennsylvania, USA).

 */

import {getNetworkEntryFromCurrentRoute} from "@/router";
import {EntityID} from "@/utils/EntityID";

export class OperatorEntry {
    public readonly accountId: string
    public readonly network: string|null
    public readonly name: string
    public readonly location: string|null
    public readonly nodeId: number|null

    constructor(accountId: string, network: string|null, name: string, location: string|null, nodeId: number|null) {
        this.accountId = accountId
        this.network = network
        this.name = name
        this.location = location
        this.nodeId = nodeId
    }

    getDescription(): string {
        let result = this.name
        if (this.nodeId != null) {
            result = "Node " + this.nodeId + " - " + result
        }
        if (this.location != null) {
            result = result + " - " + this.location
        }
        return result
    }
}

export class OperatorRegistry {

    private readonly entries = new Map<string, OperatorEntry>()

    constructor() {
        this.addEntry("0.0.3", "LG", "Seoul, South Korea", 0)
        this.addEntry("0.0.4", "Swirlds", "North Carolina, USA", 1)
        this.addEntry("0.0.5", "FIS", "Florida, USA", 2)
        this.addEntry("0.0.6", "Wipro", "Mumbai, India", 3)
        this.addEntry("0.0.7", "Nomura", "Tokyo, Japan", 4)
        this.addEntry("0.0.8", "Google", "Helsinki, Finland", 5)
        this.addEntry("0.0.9", "Zain Group", "Kuwait City, Kuwait", 6)
        this.addEntry("0.0.10", "Magalu", "São Paulo, Brazil", 7)
        this.addEntry("0.0.11", "Boeing", "Toronto, Canada", 8)
        this.addEntry("0.0.12", "DLA Piper", "London, UK", 9)
        this.addEntry("0.0.13", "Tata Communications", "California, USA", 10)
        this.addEntry("0.0.14", "IBM", "Washington, USA", 11)
        this.addEntry("0.0.15", "Deutsche Telekom", "Berlin, Germany", 12)
        this.addEntry("0.0.16", "UCL", "Amsterdam, Netherlands", 13)
        this.addEntry("0.0.17", "Avery Dennison", "Pennsylvania, USA", 14)
        this.addEntry("0.0.18", "Dentons", "Frankfurt, DE", 15)
        this.addEntry("0.0.19", "Standard Bank", "Warsaw, Poland", 16)
        this.addEntry("0.0.20", "eftpos", "Oregon, USA", 17)
        this.addEntry("0.0.21", "EDF", "Paris, France", 18)
        this.addEntry("0.0.22", "Shinhan Bank", "Seoul, South Korea", 19)
        this.addEntry("0.0.23", "Chainlink Labs", "Michigan, USA", 20)
        this.addEntry("0.0.24", "LSE", "Virginia, USA", 21)
        this.addEntry("0.0.25", "IIT Madras", "Georgia, USA", 22)
        this.addEntry("0.0.26", "DBS", "Singapore, Republic of Singapore", 23)
        this.addEntry("0.0.27", "ServiceNow", "Ogden, Utah", 24)
        this.addEntry("0.0.28", "Ubisoft", "Singapore, Republic of Singapore", 25)

        this.addEntry("0.0.98", "Hedera fee collection account", null, null, null)
    }

    public lookup(accountId: string): OperatorEntry|null {
        const result = this.entries.get(accountId)
        const network = getNetworkEntryFromCurrentRoute().name
        return result && (result.network == network || result.network == null) ? result : null
    }

    public makeDescription(accountId: string): string | null {
        let result: string|null
        if (accountId && EntityID.isOperator(accountId)) {
            const registryEntry = operatorRegistry.lookup(accountId)
            result = registryEntry !== null ? registryEntry.getDescription() : "Node"
        } else {
            result = null
        }
        return result
    }

    private addEntry(accountId: string, name: string, location: string|null, nodeID: number|null, network: string|null = "mainnet") {
        this.entries.set(accountId, new OperatorEntry(accountId, network, name, location, nodeID))
    }
}

export const operatorRegistry = new OperatorRegistry()

