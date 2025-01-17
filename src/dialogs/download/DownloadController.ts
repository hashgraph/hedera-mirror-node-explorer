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

import {Ref} from "vue";
import {TaskController} from "@/dialogs/core/task/TaskController.ts";
import {EntityDownloader} from "@/utils/downloader/EntityDownloader.ts";

export class DownloadController extends TaskController {

    public readonly downloader: EntityDownloader<unknown, unknown>

    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>, downloader: EntityDownloader<unknown, unknown>) {
        super(showDialog)
        this.downloader = downloader
    }

    //
    // TaskController
    //

    public canBeExecuted(): boolean {
        return true
    }

    public async execute(): Promise<void> {
        await this.downloader.run()
    }

}
