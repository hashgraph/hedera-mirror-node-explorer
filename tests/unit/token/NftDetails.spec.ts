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
import {flushPromises, mount} from "@vue/test-utils"
import axios from "axios";
import {IPFS_METADATA_CONTENT, IPFS_METADATA_CONTENT_URL, SAMPLE_NFTS, SAMPLE_NONFUNGIBLE,} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "../../../src/utils/HMSF";
import router from "../../../src/router";
import NftDetails from "../../../src/pages/NftDetails.vue";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe.skip("NftDetails.vue", () => {

    it("Should display details of NFT", async () => {
        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const nft = SAMPLE_NFTS.nfts[0]
        const nftId = nft.token_id
        const serial = nft.serial_number

        const matcher1 = "/api/v1/tokens/" + nftId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE);
        const matcher2 = "/api/v1/tokens/" + nftId + "/nfts/" + serial
        mock.onGet(matcher2).reply(200, nft);
        const matcher3 = "api/v1/tokens/" + nftId + "/nfts/" + serial + "/transactions"
        mock.onGet(matcher3).reply(200, [])
        const matcher4 = "api/v1/contracts/" + nftId + "/results"
        mock.onGet(matcher4).reply(200, [])

        const wrapper = mount(NftDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: nftId,
                serialNumber: serial.toString()
            },
        });
        await flushPromises()
        // console.log(wrapper.html())

        // expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(true)
        expect(wrapper.vm.transactionTableController.mounted.value).toBe(true)

        expect(wrapper.text()).toMatch(RegExp(SAMPLE_NONFUNGIBLE.name + 'Non Fungible Token'))

        const media = wrapper.get('#media-placeholder')
        expect(media.text()).toBe('Non Fungible TokenThe NFT metadata does not provide any image')

        expect(wrapper.find("#descriptionValue").exists()).toBe(false)
        expect(wrapper.get("#tokenIdValue").text()).toBe(`${SAMPLE_NONFUNGIBLE.name}(${SAMPLE_NONFUNGIBLE.token_id})`)
        expect(wrapper.get("#serialNumberValue").text()).toBe(nft.serial_number.toString())
        expect(wrapper.get("#accountIdValue").text()).toBe(nft.account_id)
        expect(wrapper.find("#creatorValue").exists()).toBe(false)
        expect(wrapper.get("#createdTimestampValue").text()).toBe('12:48:18.1407 PMMay 15, 2024, UTC')
        expect(wrapper.get("#modifiedTimeStampValue").text()).toBe('12:50:09.5045 PMMay 15, 2024, UTC')
        expect(wrapper.get("#spenderIdValue").text()).toBe('None')
        expect(wrapper.get("#delegatingSpenderValue").text()).toBe('None')

        expect(wrapper.findComponent('MetadataSection').exists()).toBe(false)

        const selectors = wrapper.findAll("select")
        expect(selectors.length).toBe(2)
        const selector = selectors[1]
        expect(selector.text()).toBe(
            'TYPES: ALLCRYPTO APPROVE ALLOWANCECRYPTO DELETE ALLOWANCECRYPTO TRANSFERTOKEN AIRDROPTOKEN BURN' +
            'TOKEN CANCEL AIRDROPTOKEN CLAIM AIRDROPTOKEN DELETETOKEN MINTTOKEN REJECTTOKEN WIPE')

        const txTable = wrapper.get('#recentTransactionsTable')
        expect(txTable.text()).toContain('IDTypeContentTime')

        expect(wrapper.findComponent('ContractResultsSection').exists()).toBe(false)

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect(wrapper.vm.transactionTableController.mounted.value).toBe(false)
    });

    it("Should display NFT with image and metadata", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const mock = new MockAdapter(axios);

        const nft = SAMPLE_NFTS.nfts[2]
        const nftId = nft.token_id
        const serial = nft.serial_number

        const matcher1 = "/api/v1/tokens/" + nftId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE);
        const matcher2 = "/api/v1/tokens/" + nftId + "/nfts/" + serial
        mock.onGet(matcher2).reply(200, nft);
        const matcher3 = "api/v1/tokens/" + nftId + "/nfts/" + serial + "/transactions"
        mock.onGet(matcher3).reply(200, [])
        const matcher4 = "api/v1/contracts/" + nftId + "/results"
        mock.onGet(matcher4).reply(200, [])
        mock.onGet(IPFS_METADATA_CONTENT_URL).reply(200, IPFS_METADATA_CONTENT)

        const wrapper = mount(NftDetails, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                tokenId: nftId,
                serialNumber: serial.toString()
            },
        });
        await flushPromises()
        // console.log(wrapper.html())

        // expect((wrapper.vm as any).tokenBalanceTableController.mounted.value).toBe(true)
        expect(wrapper.vm.transactionTableController.mounted.value).toBe(true)

        expect(wrapper.text()).toMatch(RegExp(IPFS_METADATA_CONTENT.name + 'Non Fungible Token'))

        const media = wrapper.get('#image-content')
        expect(media.find('img').exists()).toBe(true)

        expect(wrapper.find("#descriptionValue").text()).toBe(IPFS_METADATA_CONTENT.description)
        expect(wrapper.get("#tokenIdValue").text()).toBe(`${SAMPLE_NONFUNGIBLE.name}(${SAMPLE_NONFUNGIBLE.token_id})`)
        expect(wrapper.get("#serialNumberValue").text()).toBe(nft.serial_number.toString())
        expect(wrapper.get("#accountIdValue").text()).toBe(nft.account_id)
        expect(wrapper.find("#creatorValue").text()).toBe(IPFS_METADATA_CONTENT.creator)

        expect(wrapper.find('#metadata-section').exists()).toBe(true)
        const metadata = wrapper.get('#metadata-section')
        expect(metadata.text()).toBe('Metadata Details')

        mock.restore()
        wrapper.unmount()
        await flushPromises()

        expect(wrapper.vm.transactionTableController.mounted.value).toBe(false)
    });
});
