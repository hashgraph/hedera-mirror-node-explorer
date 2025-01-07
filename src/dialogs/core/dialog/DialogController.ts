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

import {ref, Ref} from "vue";

export class DialogController {

    public readonly visible: Ref<boolean>
    public readonly mode = ref<DialogMode>(DialogMode.Input)

    public constructor(visible: Ref<boolean> = ref(false)) {
        this.visible = visible
    }

    public readonly handleClose = () => {
        this.visible.value = false
    }
}

export enum DialogMode {
    Input,
    Busy,
    Error,
    Success
}
