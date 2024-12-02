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
import router from "../../../src/router";
import Oruga from "@oruga-ui/oruga-next";
import {HMSF} from "../../../src/utils/HMSF";
import HCSContentSection from "../../../src/components/topic/HCSContentSection.vue";
import {HCSAsset} from "../../../src/utils/cache/HCSAsset";
import {HCSTopicMemo} from "../../../src/utils/HCSTopicMemo";

/*
    Bookmarks
        https://jestjs.io/docs/api
        https://test-utils.vuejs.org/api/

 */

HMSF.forceUTC = true

describe("HCSContentSection.vue", () => {

    it("Should display HCS-1 Content section with JSON asset", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const topicMemo = HCSTopicMemo.parse(
            "1bd7b83994aba52afaf59c3a33f2fc1062bee855faa854480dee6514bb98b845:zstd:base64"
        )

        const topicMessage = {
            "chunk_info": {
                "initial_transaction_id": {
                    "account_id": "0.0.4368166",
                    "nonce": 0,
                    "scheduled": false,
                    "transaction_valid_start": "1710651204.524472492"
                }, "number": 1, "total": 1
            },
            "consensus_timestamp": "1710651215.535497003",
            "message": "eyJvIjowLCJjIjoiZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxLTFV2L1FCZ3hRVUFvc3NwTElDcDZUTXdBM01DaENJRFdVTS9hdktldHVaOXU1RlEyODJCVjlGcWhGZUdRTCtSdEgyL0E1MDZnM01CalMvS2dFQUNBeHgwOENYdmJZV283eEcrWDB6Wmw2UlE1ZWp0QUE5SDVqd2MyWVJFcHZpZXpvNU1vYmN2R0RBSDM3TVZGMjlOSmFXM3B2RVpJZGhzK0o2eEtqNjhuYUErTWtKNlRzaWtHSnlXa2ZZWkR2dktqVDJTZHNlM1F3ZWRVcUFraXdLVDhIMUhpMDdwN2RmREVJK25hTW52K1lyb013SUVBRE1USU1WZzBGM3ZEMFFXekE9PSJ9",
            "payer_account_id": "0.0.4368166",
            "running_hash": "Lidj0R4ZZkguqigovmKat9FTkKNQwcqeNUj0ZfvH6DaaHD/b+VoyL8hHhbB2tAwK",
            "running_hash_version": 3,
            "sequence_number": 1,
            "topic_id": "0.0.5016827"
        }

        const jsonContent = {
            "type": "image/webp",
                "format": "HIP412@2.0.0",
                "attributes": [
                {
                    "trait_type": "Who got dibs?",
                    "value": "You do"
                }
            ],
                "files": [],
                "name": "DIBS",
                "creator": "(⌐■_■)",
                "description": "Got dibs?",
                "image": "hcs://1/0.0.5016824"
        }
        const hcs1Asset = await HCSAsset.reassemble([topicMessage])

        const wrapper = mount(HCSContentSection, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                topicMemo: topicMemo,
                hcs1Asset: hcs1Asset
            },
        });
        await flushPromises()
        // console.log(wrapper.html())

        const card = wrapper.findComponent(HCSContentSection)
        expect(card.exists()).toBe(true)

        expect(card.text()).toMatch(RegExp("^HCS-1 Content"))
        expect(card.get('#hash').text()).toMatch('Hash' + '1bd7b83994aba52afaf59c3a33f2fc1062bee855faa854480dee6514bb98b845')
        expect(card.get('#compression').text()).toMatch('Compression' + 'zstd')
        expect(card.get('#encoding').text()).toMatch('Encoding' + 'base64')
        expect(card.get('#mime-type').text()).toMatch('MIME Type' + 'application/json')
        expect(card.get('#previewName').text()).toMatch('Preview')
        const preview = JSON.stringify(JSON.parse(card.get('#previewValue').text()))
        expect(preview).toBe(JSON.stringify(jsonContent))

        wrapper.unmount()
        await flushPromises()
    });

});
