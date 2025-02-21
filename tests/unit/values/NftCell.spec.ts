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


/*
    Bookmarks
        https://test-utils.vuejs.org/api/

 */

import {describe, expect, test} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils";
import {
    IPFS_IMAGE_URL,
    IPFS_METADATA_CONTENT,
    IPFS_METADATA_CONTENT_URL,
    SAMPLE_NFTS,
    SAMPLE_NONFUNGIBLE
} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import NftCell, {NftCellItem} from "../../../src/components/token/NftCell.vue";
import router from "../../../src/router";

describe("NftCell.vue", () => {

    test("no props", async () => {

        const wrapper = mount(NftCell, {
            global: {
                plugins: [router]
            },
            props: {},
        });
        await flushPromises()

        expect(wrapper.text()).toBe("")

        wrapper.unmount()
        await flushPromises()
    });

    test("tokenId and no serial #", async () => {

        const mock = new MockAdapter(axios);

        const nft = SAMPLE_NFTS.nfts[2]
        const nftId = nft.token_id

        const matcher1 = "/api/v1/tokens/" + nftId
        mock.onGet(matcher1).reply(200, SAMPLE_NONFUNGIBLE);
        const matcher4 = "api/v1/contracts/" + nftId + "/results"
        mock.onGet(matcher4).reply(200, [])
        mock.onGet(IPFS_METADATA_CONTENT_URL).reply(200, IPFS_METADATA_CONTENT)

        const wrapper = mount(NftCell, {
            global: {
                plugins: [router]
            },
            props: {
                tokenId: nftId
            },
        });
        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toBe("")

        wrapper.unmount()
        await flushPromises()
        mock.restore()
    });

    test("tokenId, serial # and default prop", async () => {

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

        const wrapper = mount(NftCell, {
            global: {
                plugins: [router]
            },
            props: {
                tokenId: nft.token_id,
                serialNumber: serial
            },
        });
        await flushPromises()
        // console.log(wrapper.html())

        expect(wrapper.text()).toBe(IPFS_METADATA_CONTENT.name)

        wrapper.unmount()
        await flushPromises()
        mock.restore()
    });

    test.skip("tokenId, serial # and various props", async () => {

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

        const wrapper = mount(NftCell, {
            global: {
                plugins: [router]
            },
            props: {
                tokenId: nft.token_id,
                serialNumber: serial,
                property: NftCellItem.description
            },
        });
        await flushPromises()
        expect(wrapper.text()).toBe(IPFS_METADATA_CONTENT.description)

        await wrapper.setProps({
            property: NftCellItem.creator
        })
        await flushPromises()
        expect(wrapper.text()).toBe('@Buckyoto + @JuicyUnlimited for @KarateC…')

        await wrapper.setProps({
            property: NftCellItem.image
        })
        await flushPromises()
        const figure = wrapper.find('figure')
        expect(figure.exists()).toBe(true)
        expect(figure.get('img').attributes('src')).toBe(IPFS_IMAGE_URL)

        wrapper.unmount()
        await flushPromises()
        mock.restore()
    });
});
