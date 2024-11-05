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

import {describe, expect, it} from 'vitest'
import {flushPromises} from "@vue/test-utils"
import axios from "axios";
import MockAdapter from "axios-mock-adapter";
import {HMSF} from "@/utils/HMSF";
import {networkRegistry, NetworkRegistry} from "../../../src/schemas/NetworkRegistry";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("NetworkRegistry.ts", () => {

    it("Should read configuration from networks-config.json", async () => {

        const config = [
            {
                "name": "mainnet",
                "displayName": "MAINNET",
                "url": "https://mainnet-public.mirrornode.hedera.com/",
                "ledgerID": "00",
                "walletSupported": true,
                "sourcifySetup": {
                    "activate": true,
                    "repoURL": "http://localhost:10000/contracts/",
                    "serverURL": "http://localhost:5002/",
                    "verifierURL": "http://localhost:3000/#/",
                    "chainID": 295
                }
            }
        ]

        const mock = new MockAdapter(axios);
        const configUrl = NetworkRegistry.NETWORKS_CONFIG_URL
        mock.onGet(configUrl).reply(200, config)

        networkRegistry.readCustomConfig()
        await flushPromises()
        expect(networkRegistry.entries.value.length).toBe(config.length)
        const defaultEntry = networkRegistry.getDefaultEntry()
        expect(defaultEntry.name).toBe(config[0].name)
        expect(defaultEntry.displayName).toBe(config[0].displayName)
        expect(defaultEntry.url).toBe(config[0].url)
        expect(defaultEntry.ledgerID).toBe(config[0].ledgerID)
        expect(defaultEntry.sourcifySetup.activate).toBe(config[0].sourcifySetup.activate)
        expect(defaultEntry.sourcifySetup.repoURL).toBe(config[0].sourcifySetup.repoURL)
        expect(defaultEntry.sourcifySetup.serverURL).toBe(config[0].sourcifySetup.serverURL)
        expect(defaultEntry.sourcifySetup.verifierURL).toBe(config[0].sourcifySetup.verifierURL)
        expect(defaultEntry.sourcifySetup.chainID).toBe(config[0].sourcifySetup.chainID)

        mock.restore()
    });

    it("Should truncate and capitalize network displayName", async () => {

        const config = [
            {
                "name": "customnet",
                "displayName": "A WayTooLongNetworkDisplayName",
                "url": "",
                "ledgerID": "FF",
                "walletSupported": true,
            }
        ]

        const mock = new MockAdapter(axios);
        const configUrl = NetworkRegistry.NETWORKS_CONFIG_URL
        mock.onGet(configUrl).reply(200, config)

        networkRegistry.readCustomConfig()
        await flushPromises()
        expect(networkRegistry.entries.value.length).toBe(config.length)
        const defaultEntry = networkRegistry.getDefaultEntry()
        expect(defaultEntry.name).toBe(config[0].name)
        expect(defaultEntry.displayName).toBe("A WAYTOOLONGNET…")

        mock.restore()
    });

    it("Should deactivate SC verif when activate = false in networks-config.json", async () => {

        const config = [
            {
                "name": "mainnet",
                "displayName": "MAINNET",
                "url": "https://mainnet-public.mirrornode.hedera.com/",
                "ledgerID": "00",
                "walletSupported": true,
                "sourcifySetup": {
                    "activate": false,
                    "repoURL": "http://localhost:10000/contracts/",
                    "serverURL": "http://localhost:5002/",
                    "verifierURL": "http://localhost:3000/#/",
                    "chainID": 295
                }
            }
        ]
        const mock = new MockAdapter(axios);
        const configUrl = NetworkRegistry.NETWORKS_CONFIG_URL
        mock.onGet(configUrl).reply(200, config)

        networkRegistry.readCustomConfig()
        await flushPromises()
        expect(networkRegistry.entries.value.length).toBe(config.length)
        const defaultEntry = networkRegistry.getDefaultEntry()
        expect(defaultEntry.name).toBe(config[0].name)
        expect(defaultEntry.sourcifySetup.activate).toBe(false)

        mock.restore()
    });

    it("Should deactivate SC verif when sourcifySetup null in networks-config.json", async () => {

        const config = [
            {
                "name": "mainnet",
                "displayName": "MAINNET",
                "url": "https://mainnet-public.mirrornode.hedera.com/",
                "ledgerID": "00",
                "walletSupported": true,
                "sourcifySetup": null
            }
        ]
        const mock = new MockAdapter(axios);
        const configUrl = NetworkRegistry.NETWORKS_CONFIG_URL
        mock.onGet(configUrl).reply(200, config)

        networkRegistry.readCustomConfig()
        await flushPromises()
        expect(networkRegistry.entries.value.length).toBe(config.length)
        const defaultEntry = networkRegistry.getDefaultEntry()
        expect(defaultEntry.name).toBe(config[0].name)
        expect(defaultEntry.sourcifySetup).toBe(null)

        mock.restore()
    });

    it("Should deactivate SC verif when sourcifySetup undefined in networks-config.json", async () => {

        const config = [
            {
                "name": "mainnet",
                "displayName": "MAINNET",
                "url": "https://mainnet-public.mirrornode.hedera.com/",
                "ledgerID": "00",
                "walletSupported": true,
            }
        ]
        const mock = new MockAdapter(axios);
        const configUrl = NetworkRegistry.NETWORKS_CONFIG_URL
        mock.onGet(configUrl).reply(200, config)

        networkRegistry.readCustomConfig()
        await flushPromises()
        expect(networkRegistry.entries.value.length).toBe(config.length)
        const defaultEntry = networkRegistry.getDefaultEntry()
        expect(defaultEntry.name).toBe(config[0].name)
        expect(defaultEntry.sourcifySetup).toBe(null)

        mock.restore()
    });

});







