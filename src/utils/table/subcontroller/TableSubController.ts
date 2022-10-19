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

import {TableController} from "@/utils/table/TableController";
import {LocationQuery} from "vue-router";

export abstract class TableSubController<R, K> {

    protected readonly tableController: TableController<R, K>

    //
    // Public
    //

    public constructor(tableController: TableController<R, K>) {
        this.tableController = tableController
    }


    //
    // Public (to be subclassed)
    //

    public abstract mount(): void
    public abstract unmount(): void
    public abstract makeRouteQuery(currentQuery: LocationQuery): LocationQuery;
}

