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
import {IPFS_METADATA, IPFS_METADATA_CONTENT, IPFS_METADATA_CONTENT_URL,} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "../../../src/utils/HMSF";
import router from "../../../src/router";
import MetadataSection from "../../../src/components/token/MetadataSection.vue";
import {ref} from "vue";
import {TokenMetadataAnalyzer} from "../../../src/components/token/TokenMetadataAnalyzer";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("MetadataSection.vue", () => {

    it("Should display metadata attributes", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        // Mock axios
        const mock = new MockAdapter(axios)
        mock.onGet(IPFS_METADATA_CONTENT_URL).reply(200, IPFS_METADATA_CONTENT)

        const metadata = ref(IPFS_METADATA)
        const analyzer = new TokenMetadataAnalyzer(metadata)
        analyzer.mount()

        const wrapper = mount(MetadataSection, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                metadataAnalyzer: analyzer,
                collapsed: false
            },
        });
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.get("#typeValue").text()).toBe(IPFS_METADATA_CONTENT.type)
        expect(wrapper.get("#imageValue").text()).toBe(IPFS_METADATA_CONTENT.image)
        expect(wrapper.get("#formatValue").text()).toBe(IPFS_METADATA_CONTENT.format)

        // attributes
        for (const attr of IPFS_METADATA_CONTENT.attributes) {
            const nameId = '#' + attr.trait_type + 'Name'
            const valueId = '#' + attr.trait_type + 'Value'
            expect(wrapper.get(nameId).text()).toBe(attr.trait_type)
            expect(wrapper.get(valueId).text()).toBe(attr.value)
        }

        mock.restore()
        wrapper.unmount()
        analyzer.unmount()
        await flushPromises()
    });
});
