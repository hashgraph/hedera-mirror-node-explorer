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

import {describe, expect, test} from 'vitest'
import {flushPromises, mount} from "@vue/test-utils";
import TopicMessageCell, {TopicMessageCellItem} from "@/components/topic/TopicMessageCell.vue";
import router from "@/router";
import Oruga from "@oruga-ui/oruga-next";
import {SAMPLE_TOPIC_MESSAGES} from "../Mocks";
import MockAdapter from "axios-mock-adapter";
import axios from "axios";

describe("TopicMessageCell.vue", () => {

    test("default props", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        const wrapper = mount(TopicMessageCell, {
            global: {
                plugins: [router, Oruga]
            },
            props: {},
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('')

        wrapper.unmount()
    })

    test("timestamp and default property", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        // Mock axios
        const mock = new MockAdapter(axios as any)

        const topicMessage = SAMPLE_TOPIC_MESSAGES.messages[0]
        const timestamp = topicMessage.consensus_timestamp

        const matcher1 = "/api/v1/topics/messages/" + timestamp
        mock.onGet(matcher1).reply(200, topicMessage);

        const wrapper = mount(TopicMessageCell, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                timestamp: timestamp
            },
        })

        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('backgroundMessage')

        wrapper.unmount()
    })

    test("timestamp and property", async () => {

        await router.push("/") // To avoid "missing required param 'network'" error

        // Mock axios
        const mock = new MockAdapter(axios as any)

        const topicMessage = SAMPLE_TOPIC_MESSAGES.messages[0]
        const timestamp = topicMessage.consensus_timestamp

        const matcher1 = "/api/v1/topics/messages/" + timestamp
        mock.onGet(matcher1).reply(200, topicMessage);

        const wrapper = mount(TopicMessageCell, {
            global: {
                plugins: [router, Oruga]
            },
            props: {
                timestamp: timestamp,
                property: TopicMessageCellItem.message
            },
        })
        await flushPromises()
        // console.log(wrapper.html())
        // console.log(wrapper.text())

        expect(wrapper.text()).toBe('backgroundMessage')

        await wrapper.setProps({
            property: TopicMessageCellItem.sequenceNumber
        })
        await flushPromises()

        expect(wrapper.text()).toBe(topicMessage.sequence_number.toString())

        wrapper.unmount()
    })
})

