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

import {flushPromises, mount} from "@vue/test-utils"
import router from "@/router";
import Endpoint from "@/components/values/Endpoint.vue";

describe("Endpoint.vue", () => {

    it("should output empty string", async () => {
        const wrapper = mount(Endpoint, {
            global: {
                plugins: [router]
            },
            props: {
            }
        });
        await flushPromises()
        expect(wrapper.text()).toBe("")
    })

    it("should output \<address\> alone", async () => {
        const wrapper = mount(Endpoint, {
            global: {
                plugins: [router]
            },
            props: {
                address: "127.0.0.1",
            }
        });
        await flushPromises()
        expect(wrapper.text()).toBe("127.0.0.1")
    })

    it("should ouput \<address\>:\<port\>", async () => {
        const wrapper = mount(Endpoint, {
            global: {
                plugins: [router]
            },
            props: {
                address: "127.0.0.1",
                port: 8080
            }
        });
        await flushPromises()
        expect(wrapper.text()).toBe("127.0.0.1:8080")
    })

})

