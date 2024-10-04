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
import {Token} from "@/schemas/HederaSchemas";
import {Ref, watch, WatchStopHandle} from "vue";
import {SelectedTokensCache} from "@/utils/cache/SelectedTokensCache";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";

export class TokensByPopulariyTableLoader extends TableLoader<Token> {

    private readonly name: Ref<string | null>
    private nameWatchHandle: WatchStopHandle|null = null

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

    protected async load(): Promise<Token[]> {
        const result: Token[] = []
        if (this.name.value !== null) {
            const index = await SelectedTokensCache.instance.lookup()
            const indexEntries = index.search(this.name.value)
            for (const e of indexEntries) {
                const token = await TokenInfoCache.instance.lookup(e.token_id)
                if (token !== null) {
                    result.push(token as unknown as Token)
                }
            }
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
