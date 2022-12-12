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

import {EntityID} from "@/utils/EntityID";

export class NetworkEntry {

    public readonly name: string
    public readonly displayName: string
    public readonly url: string
    public readonly ledgerID: string

    constructor(name: string, displayName: string, url: string, ledgerID: string) {
        this.name = name
        this.displayName = displayName
        this.url = url
        this.ledgerID = ledgerID
    }
}

export class NetworkRegistry {

    public static readonly MAIN_NETWORK = 'mainnet'
    public static readonly TEST_NETWORK = 'testnet'
    public static readonly PREVIEW_NETWORK = 'previewnet'

    private static readonly DEFAULT_NETWORK = NetworkRegistry.MAIN_NETWORK
    private readonly defaultEntry: NetworkEntry

    private readonly entries: NetworkEntry[] = [
        {
            name: 'mainnet',
            displayName: 'MAINNET',
            url: "https://mainnet-public.mirrornode.hedera.com/",
            ledgerID: '00'
        },
        {
            name: 'testnet',
            displayName: 'TESTNET',
            url: "https://testnet.mirrornode.hedera.com/",
            ledgerID: '01'
        },
        {
            name: 'previewnet',
            displayName: 'PREVIEWNET',
            url: "https://previewnet.mirrornode.hedera.com/",
            ledgerID: '02'
        }
    ]

    constructor() {
        this.defaultEntry = this.lookup(NetworkRegistry.DEFAULT_NETWORK) ?? this.entries[0]

        if (process.env.VUE_APP_LOCAL_MIRROR_NODE_URL) {
            this.entries.push(new NetworkEntry(
                'devnet',
                process.env.VUE_APP_LOCAL_MIRROR_NODE_MENU_NAME ?? "DEVNET",
                process.env.VUE_APP_LOCAL_MIRROR_NODE_URL,
                'FF'
            ))
        }
    }

    public getEntries(): Array<NetworkEntry> {
        return this.entries
    }

    public getDefaultEntry(): NetworkEntry {
        return this.defaultEntry
    }

    public lookup(name: string): NetworkEntry | null {
        return this.entries.find(element => element.name === name) ?? null
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
