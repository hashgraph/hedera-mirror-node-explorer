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

import {mount} from "@vue/test-utils"
import router from "@/router";
import EntityLink from "@/components/values/EntityLink.vue";

describe("EntityLink.vue", () => {

    test("AccountLink; no extra", async () => {
        const testEntityId = "0.0.4"
        const testRouteName = "AccountDetails"
        const testShowExtra = false
        const expectedEntityPath = "/account/" + testEntityId

        await testBody(testEntityId, testRouteName, testShowExtra, expectedEntityPath)
    });

    test("AccountLink; extra", async () => {
        const testEntityId = "0.0.4"
        const testRouteName = "AccountDetails"
        const testShowExtra = true
        const expectedEntityPath = "/account/" + testEntityId

        await testBody(testEntityId, testRouteName, testShowExtra, expectedEntityPath)
    });

    test("TokenLink", async () => {
        const testEntityId = "0.0.42"
        const testRouteName = "TokenDetails"
        const testShowExtra = false
        const expectedEntityPath = "/token/" + testEntityId

        await testBody(testEntityId, testRouteName, testShowExtra, expectedEntityPath)
    });

    test("ContractLink", async () => {
        const testEntityId = "0.0.42"
        const testRouteName = "ContractDetails"
        const testShowExtra = false
        const expectedEntityPath = "/contract/" + testEntityId

        await testBody(testEntityId, testRouteName, testShowExtra, expectedEntityPath)
    });

    test("TopicLink", async () => {
        const testEntityId = "0.0.42"
        const testRouteName = "TopicDetails"
        const testShowExtra = false
        const expectedEntityPath = "/topic/" + testEntityId

        await testBody(testEntityId, testRouteName, testShowExtra, expectedEntityPath)
    });

    test("Invalid route", async () => {
        const testEntityId = ""
        const testRouteName = "InvalidRoute"
        const testShowExtra = false
        const expectedEntityPath = ""

        await testBody(testEntityId, testRouteName, testShowExtra, expectedEntityPath)
    });

});

const testBody = async (testEntityId: string, testRouteName: string, testShowExtra: boolean, expectedPath: string ) => {

    await router.push("/") // To avoid "missing required param 'network'" error

    const wrapper = mount(EntityLink, {
        global: {
            plugins: [router]
        },
        props: {
            entityId: testEntityId,
            routeName: testRouteName,
            showExtra: testShowExtra
        },
    });

    expect(wrapper.text()).toMatch(RegExp("^" + testEntityId))
    if (testEntityId) {
        expect(wrapper.findComponent("a").attributes("href")).toMatch(RegExp(expectedPath + "$"))
    }
    expect(wrapper.find(".h-is-extra-text").exists()).toBe(testShowExtra)
}
