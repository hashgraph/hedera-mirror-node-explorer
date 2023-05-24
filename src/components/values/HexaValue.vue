<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
  -
  - Licensed under the Apache License, Version 2.0 (the "License");
  - you may not use this file except in compliance with the License.
  - You may obtain a copy of the License at
  -
  -      http://www.apache.org/licenses/LICENSE-2.0
  -
  - Unless required by applicable law or agreed to in writing, software
  - distributed under the License is distributed on an "AS IS" BASIS,
  - WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  - See the License for the specific language governing permissions and
  - limitations under the License.
  -
  -->

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
    <div v-if="normByteString" class="shy-scope" style="display: inline-block; position: relative">
        <div class="is-family-monospace h-is-text-size-3 mt-1" :class="{'has-text-grey': lowContrast}">
            {{ flow(isMediumScreen ? wordWrapMedium : wordWrapSmall) }}
        </div>
        <div v-if="isCopyEnabled" id="shyCopyButton" class="shy"
             style="position: absolute; left: 0; top: 0; width: 100%; height: 100%">
            <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.50)"></div>
            <div style="position: absolute; display: inline-block; left: 50%; top: 50%; transform: translate(-50%, -50%);">
                <button class="button is-dark h-is-text-size-3" v-on:click="copyToClipboard">Copy to Clipboard</button>
            </div>
        </div>
    </div>
    <div v-else-if="showNone && !initialLoading">
        <div class="has-text-grey">None</div>
        <div v-if="noneExtra" class="has-text-grey h-is-text-size-3">{{ noneExtra }}</div>
    </div>
    <div v-else/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";

export default defineComponent({
    name: "HexaValue",
    props: {
        byteString: String,
        showNone: {
            type: Boolean,
            default: false
        },
        noneExtra: String,
        lowContrast: {
            type: Boolean,
            default: true
        },
        wordWrapMedium: {
            type: Number,
            default: null
        },
        wordWrapSmall: {
            type: Number,
            default: null
        }
    },

    setup(props) {
        const isSmallScreen = inject('isSmallScreen', true)
        const isMediumScreen = inject('isMediumScreen', true)

        // 0)
        const normByteString = computed((): string | undefined => {
            let result: string | undefined
            if (props.byteString) {
                result = props.byteString.startsWith("0x") ? props.byteString.slice(2) : props.byteString
            } else {
                result = undefined
            }
            return result
        })

        // 1)
        const flow = (nbWords: number | null): string => {
            return normByteString.value ? makeByteLine(normByteString.value, nbWords) : ""
        }

        // 2)
        const copyToClipboard = (): void => {
            if (props.byteString) {
                navigator.clipboard.writeText("0x" + normByteString.value)
            }
        }

        // 3)
        const isCopyEnabled = computed(() => {
            return (normByteString.value?.length ?? 0) >= 1
        })

        // 4)
        const initialLoading = inject(initialLoadingKey, ref(false))

        return {
            normByteString,
            isSmallScreen,
            isMediumScreen,
            flow,
            copyToClipboard,
            isCopyEnabled,
            initialLoading
        }
    }
})

function makeByteLine(byteString: string, nbWords: number | null): string {
    let result = ""

    const wordCount = byteString.length / 4
    for (let i = 0; i < wordCount; i += 1) {
        if (result != "") {
            if (nbWords && i % nbWords != 0) {
                result += "\u00A0"
            } else {
                result += " "
            }
        }
        result += byteString.substring(4 * i, 4 * (i + 1))
    }

    return result
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.shy {
    display: none
}

.shy-scope:hover > .shy {
    display: block;
}

</style>
