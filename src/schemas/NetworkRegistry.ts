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

import {EntityID} from "@/utils/EntityID";
import axios from "axios";
import {ref, Ref} from "vue";
import {EthereumAddress} from "@/utils/EthereumAddress";

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
    public readonly sourcifySetup: SourcifySetup|null

    constructor(name: string, displayName: string, url: string, ledgerID: string, sourcifySetup: SourcifySetup|null) {
        this.name = name
        this.displayName = displayName ?? name.toUpperCase()
        this.url = url
        this.ledgerID = ledgerID
        this.sourcifySetup = sourcifySetup
    }

    static decode(encoding: Record<string, unknown>): NetworkEntry|null {
        let result: NetworkEntry|null

        const name = encoding["name"]
        const displayName = encoding["displayName"]
        const url = encoding["url"]
        const ledgerID = encoding["ledgerID"]
        const sourcifySetupEncoding = encoding["sourcifySetup"]

        if (typeof name == "string" &&
            (typeof displayName == "string" || typeof displayName == "undefined") &&
            typeof url == "string" &&
            typeof ledgerID == "string" &&
            typeof sourcifySetupEncoding == "object") {

            let tidyDisplayName = (displayName ?? name).toUpperCase()
            if (tidyDisplayName.length > this.NETWORK_NAME_MAX_LENGTH) {
                tidyDisplayName = tidyDisplayName.slice(0, this.NETWORK_NAME_MAX_LENGTH) + '…'
            }

            if (sourcifySetupEncoding !== null) {
                const sourcifySetup = SourcifySetup.decode(sourcifySetupEncoding as Record<string, unknown>)
                if (sourcifySetup !== null) {
                    result = new NetworkEntry(name, tidyDisplayName.toUpperCase(), url, ledgerID, sourcifySetup)
                } else {
                    result = null
                }
            } else {
                result = new NetworkEntry(name, tidyDisplayName, url, ledgerID, null)
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

    public readonly entries: Ref<Array<NetworkEntry>> = ref ([
        {
            name: 'mainnet',
            displayName: 'MAINNET',
            url: "https://mainnet-public.mirrornode.hedera.com/",
            ledgerID: '00',
            sourcifySetup: new SourcifySetup(
                true,
                "http://localhost:10000/contracts/",
                "http://localhost:5002/",
                "http://localhost:3000/#/",
                0x127
            )
        },
        {
            name: 'testnet',
            displayName: 'TESTNET',
            url: "https://testnet.mirrornode.hedera.com/",
            ledgerID: '01',
            sourcifySetup: new SourcifySetup(
                true,
                "http://localhost:10000/contracts/",
                "http://localhost:5002/",
                "http://localhost:3000/#/",
                0x128
            )
        },
        {
            name: 'previewnet',
            displayName: 'PREVIEWNET',
            url: "https://previewnet.mirrornode.hedera.com/",
            ledgerID: '02',
            sourcifySetup: new SourcifySetup(
                true,
                "http://localhost:10000/contracts/",
                "http://localhost:5002/",
                "http://localhost:3000/#/",
                0x129
            )
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
                        new NetworkEntry('devnet', localNodeMenuName, localNodeURL, 'FF', null)
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
        return NetworkRegistry.checksum(ledgerID ?? 'FF', id)
    }

    public stripChecksum(address: string): string {
        const dash = address.indexOf('-')
        return dash != -1 ? address.substring(0, dash) : address
    }

    public extractChecksum(address: string): string | null {
        const dash = address.indexOf('-')
        return dash != -1 ? address.substring(dash + 1) : null
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

    //
    // From https://github.com/hashgraph/hedera-improvement-proposal/blob/master/assets/hip-15/HIP-15-javascript.html
    //
    // Given a ledger ID and an address like "0.0.123", return a checksum like "vfmkw" . The address must be in no-checksum
    // format, with no extra characters (so not "0.0.00123" or "==0.0.123==" or "0.0.123-vfmkw"). The algorithm is defined
    // by the HIP-15 standard to be:
    //
    // a = a valid no-checksum address string, such as 0.0.123
    // d = int array for the digits of a (using 10 to represent "."), so 0.0.123 is [0,10,0,10,1,2,3]
    // h = unsigned byte array containing the ledger ID followed by 6 zero bytes
    // p3 = 26 * 26 * 26
    // p5 = 26 * 26 * 26 * 26 * 26
    // sd0 = (d[0] + d[2] + d[4] + d[6] + ...) mod 11
    // sd1 = (d[1] + d[3] + d[5] + d[7] + ...) mod 11
    // sd = (...((((d[0] * 31) + d[1]) * 31) + d[2]) * 31 + ... ) * 31 + d[d.length-1]) mod p3
    // sh = (...(((h[0] * 31) + h[1]) * 31) + h[2]) * 31 + ... ) * 31 + h[h.length-1]) mod p5
    // c = (((d.length mod 5) * 11 + sd0) * 11 + sd1) * p3 + sd + sh ) mod p5
    // cp = (c * 1000003) mod p5
    // checksum = cp, written as 5 digits in base 26, using a-z
    //
    //in ports to other languages, answer can be a string, digits an int32[] and the rest int32 (or uint32[] and uint32)

    private static checksum(ledgerId: string, addr: string) {
        let answer = "";
        const d = [];      //digits with 10 for ".", so if addr == "0.0.123" then d == [0, 10, 0, 10, 1, 2, 3] *** FIX ***
        let sd0 = 0;      //sum of even positions (mod 11)
        let sd1 = 0;      //sum of odd positions (mod 11)
        let sd = 0;       //weighted sum of all positions (mod p3)
        let sh = 0;      //hash of the ledger ID
        let cp: number;       //the checksum, as a single number
        const p3 = 26 * 26 * 26;           //3 digits in base 26
        const p5 = 26 * 26 * 26 * 26 * 26; //5 digits in base 26
        const ascii_a = "a".charCodeAt(0);  //97  *** FIX ***
        const m = 1_000_003; //min prime greater than a million. Used for the final permutation.
        const w = 31; //sum s of digit values weights them by powers of w. Should be coprime to p5.

        let id = ledgerId + "000000000000";
        const h = []; // *** FIX ***
        if (id.length % 2 == 1) id = "0" + id;
        for (let i=0; i<id.length; i+=2) {  // *** FIX ***
            h.push(parseInt(id.substr(i,2),16));
        }
        for (let i = 0; i < addr.length; i++) {
            d.push(addr[i]=="." ? 10 : parseInt(addr[i],10));
        }
        for (let i=0; i<d.length; i++) {
            sd = (w * sd + d[i]) % p3;
            if (i % 2 == 0) {
                sd0 = (sd0 + d[i]) % 11;
            } else {
                sd1 = (sd1 + d[i]) % 11;
            }
        }
        for (let i=0; i<h.length; i++) {
            sh = (w * sh + h[i]) % p5;
        }
        const c = ((((addr.length % 5) * 11 + sd0) * 11 + sd1) * p3 + sd + sh) % p5;  //the checksum, before the final permutation
        cp = (c * m) % p5;

        for (let i=0; i<5; i++) {
            answer = String.fromCharCode(ascii_a + (cp % 26)) + answer;
            cp /= 26;
        }

        return answer;
    }
}

export const networkRegistry = new NetworkRegistry()
