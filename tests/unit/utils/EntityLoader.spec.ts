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

import {describe, expect, test, vi} from 'vitest'
import {EntityLoaderState, EntityLoader} from "../../../src/utils/loader/EntityLoader";
import {flushPromises} from "@vue/test-utils";
import {waitFor} from "../../../src/utils/TimerUtils";

describe("EntityLoader", () => {

    test("no periodic refresh", async () => {
        vi.useFakeTimers()

        const loader = new TestLoader(0, 0)
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)

        loader.mount()
        await flushPromises()
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        vi.advanceTimersToNextTimer()
        await flushPromises()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.PAUSED)

        vi.advanceTimersToNextTimer()
        await flushPromises()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.PAUSED)

        loader.unmount()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)
    })


    test("periodic refresh + automatic pause", async () => {
        vi.useFakeTimers()

        const loader = new TestLoader(100, 3)
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)

        loader.mount()
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe("Execution 2")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe("Execution 2")
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(3)
        expect(loader.entity.value).toBe("Execution 3")
        expect(loader.state.value).toBe(EntityLoaderState.PAUSED)

        loader.unmount()
        expect(loader.executionCount).toBe(3)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)
    })

    test("periodic refresh + explicit pause + explicit resume + automatic pause", async () => {
        vi.useFakeTimers()

        const loader = new TestLoader(100, 3)
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)

        loader.mount()
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)


        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe("Execution 2")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        loader.pause()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe("Execution 2")
        expect(loader.state.value).toBe(EntityLoaderState.PAUSED)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe("Execution 2")
        expect(loader.state.value).toBe(EntityLoaderState.PAUSED)

        loader.resume()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe("Execution 2")
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(3)
        expect(loader.entity.value).toBe("Execution 3")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(3)
        expect(loader.entity.value).toBe("Execution 3")
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(4)
        expect(loader.entity.value).toBe("Execution 4")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(4)
        expect(loader.entity.value).toBe("Execution 4")
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(5)
        expect(loader.entity.value).toBe("Execution 5")
        expect(loader.state.value).toBe(EntityLoaderState.PAUSED)

        loader.unmount()
        expect(loader.executionCount).toBe(5)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)
    })

    test("periodic refresh + unmount during sleeping", async () => {
        vi.useFakeTimers()

        const loader = new TestLoader(100, 3)
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)

        loader.mount()
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)


        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe("Execution 2")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        loader.unmount()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)

    })

    test("periodic refresh + unmount during loading", async () => {
        vi.useFakeTimers()

        const loader = new TestLoader(100, 3)
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)

        loader.mount()
        expect(loader.executionCount).toBe(0)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(1)
        expect(loader.entity.value).toBe("Execution 1")
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe("Execution 2")
        expect(loader.state.value).toBe(EntityLoaderState.SLEEPING)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe("Execution 2")
        expect(loader.state.value).toBe(EntityLoaderState.LOADING)

        loader.unmount()
        expect(loader.executionCount).toBe(2)
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)

        await vi.advanceTimersToNextTimerAsync()
        expect(loader.executionCount).toBe(3) // OK because TestLoader.load() did run until its end
        expect(loader.entity.value).toBe(null)
        expect(loader.state.value).toBe(EntityLoaderState.UNMOUNTED)
    })
})




class TestLoader extends EntityLoader<String> {

    public executionCount = 0

    //
    // EntityLoaderV2
    //

    constructor(refreshPeriod: number, maxRefreshCount: number) {
        super(refreshPeriod, maxRefreshCount)
    }

    protected async load(): Promise<String | null> {
        await waitFor(1000)
        this.executionCount += 1
        return "Execution " + this.executionCount
    }

}
