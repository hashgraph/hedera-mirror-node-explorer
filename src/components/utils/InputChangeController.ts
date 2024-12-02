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

import {Ref, ref, watch} from "vue";

export class InputChangeController {

    public readonly outputText = ref<string>("")
    private timeoutID = -1

    //
    // Public
    //

    public constructor(private readonly inputText: Ref<string>, private readonly millis: number = 500) {
        watch(this.inputText, this.inputTextDidChange, {immediate: true})
    }

    //
    // Private
    //

    private readonly inputTextDidChange = () => {
        if (this.timeoutID != -1) {
            window.clearTimeout(this.timeoutID)
            this.timeoutID = -1
        }
        if (this.inputText.value == "") {
            this.outputText.value = this.inputText.value
        } else {
            this.timeoutID = window.setTimeout(() => {
                this.outputText.value = this.inputText.value.trim()
                this.timeoutID = -1
            }, this.millis)
        }
    }
}
