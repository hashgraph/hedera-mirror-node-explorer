// noinspection DuplicatedCode

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

import {describe, it, expect} from "vitest";
import {mount} from "@vue/test-utils";
import SolidityCode from "@/components/SolidityCode.vue";

describe("SolidityCode.vue", () => {

    it("basic", () => {

        const solidityText = "function getStrategyInstanceCount() view returns (uint256 count)"
        const wrapper = mount(SolidityCode, {
            slots: {
                "default": solidityText
            },
        })

        expect(wrapper.html()).toBe("<pre class=\"language-solidity\"><code><span class=\"token keyword\">function</span> <span class=\"token function\">getStrategyInstanceCount</span><span class=\"token punctuation\">(</span><span class=\"token punctuation\">)</span> <span class=\"token keyword\">view</span> <span class=\"token keyword\">returns</span> <span class=\"token punctuation\">(</span><span class=\"token builtin\">uint256</span> count<span class=\"token punctuation\">)</span></code></pre>")
        expect(wrapper.text()).toBe(solidityText)
        wrapper.unmount()
    })


})
