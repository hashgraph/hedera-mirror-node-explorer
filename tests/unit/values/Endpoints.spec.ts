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
import Endpoints from "@/components/values/Endpoints.vue";
import {SAMPLE_NETWORK_NODES} from "../Mocks";
import {ServiceEndPoint} from "@/schemas/HederaSchemas";

describe("Endpoint.vue", () => {

    it("should output 'None' when the props is undefined", async () => {
        const wrapper = mount(Endpoints, {
            global: {
                plugins: [router]
            },
            props: {
            }
        });
        await flushPromises()
        expect(wrapper.text()).toBe("None")
    })

    it("should output 'None' when the array of endpoints is empty", async () => {
        const wrapper = mount(Endpoints, {
            global: {
                plugins: [router]
            },
            props: {
                endpoints: []
            }
        });
        await flushPromises()
        expect(wrapper.text()).toBe("None")
    })

    it("should not output an endpoint where the address is undefined", async () => {
        const wrapper = mount(Endpoints, {
            global: {
                plugins: [router]
            },
            props: {
                endpoints: SAMPLE_NETWORK_NODES.nodes[1].service_endpoints as Array<ServiceEndPoint>
            }
        });
        await flushPromises()
        expect(wrapper.text()).toBe("3.133.213.146:50211")
    })

    it("should output an endpoint address alone when port is undefined", async () => {
        const wrapper = mount(Endpoints, {
            global: {
                plugins: [router]
            },
            props: {
                endpoints: SAMPLE_NETWORK_NODES.nodes[2].service_endpoints as Array<ServiceEndPoint>
            }
        });
        await flushPromises()
        expect(wrapper.text()).toBe(
            "3.133.213.146:50211" +
            "3.133.213.147")
    })

    it("should ouput \<address\>:\<port\> for all 5 endpoints", async () => {
        const wrapper = mount(Endpoints, {
            global: {
                plugins: [router]
            },
            props: {
                endpoints: SAMPLE_NETWORK_NODES.nodes[0].service_endpoints as Array<ServiceEndPoint>
            }
        });
        await flushPromises()
        expect(wrapper.text()).toBe(
            "3.211.248.172:50211" +
            "3.211.248.172:50212" +
            "35.231.208.148:0" +
            "35.231.208.148:50211" +
            "35.231.208.148:50212")
    })

})

