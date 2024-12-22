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

import {TableLoader} from "@/utils/table/TableLoader";
import {Ref, watch, WatchStopHandle} from "vue";
import {ERC721Cache, ERC721Contract} from "@/utils/cache/ERC721Cache.ts";

export class ERC721ByNameTableLoader extends TableLoader<ERC721Contract> {

    private readonly name: Ref<string | null>
    private nameWatchHandle: WatchStopHandle | null = null

    //
    // Public
    //

    public constructor(pageSize: Ref<number>, name: Ref<string | null>) {
        super(pageSize)
        this.name = name
    }

    //
    // Protected (to be subclassed)
    //

    protected async load(): Promise<ERC721Contract[]> {
        let result: ERC721Contract[]
        if (this.name.value !== null) {
            result = await ERC721Cache.instance.search(this.name.value)
        } else {
            result = []
        }
        return Promise.resolve(result)
    }

    public async mount(): Promise<void> {
        this.nameWatchHandle = watch(this.name, () => this.remount())
        return super.mount()
    }

    public unmount() {
        super.unmount()
        if (this.nameWatchHandle !== null) {
            this.nameWatchHandle()
        }
    }
}
