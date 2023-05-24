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
    <div v-if="hexValue" class="should-wrap">
        <div :class="{'is-flex': isSmallScreen}" class="is-inline-block h-is-text-size-3 is-family-monospace"
             style="line-height: 20px">
            <div class="shy-scope mr-1" style="display: inline-block; position: relative;">
                <span class="has-text-grey">0x</span>
                <span>{{ hexValue }}</span>
                <div id="shyCopyButton" class="shy"
                     style="position: absolute; left: 0; top: 0; width: 100%; height: 100%">
                    <div style="position: absolute; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.50)"></div>
                    <div style="position: absolute; display: inline-block; left: 50%; top: 50%; transform: translate(-50%, -50%);">
                        <button class="button is-dark h-is-text-size-3" @click.stop="copyToClipboard">Copy to
                            Clipboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div v-else-if="initialLoading"/>
    <div v-else class="has-text-grey">None</div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from "vue";
import {base32ToAlias, byteToHex} from "@/utils/B64Utils";
import {initialLoadingKey} from "@/AppKeys";

export default defineComponent({
    name: "AliasValue",
    props: {
        aliasValue: String,
    },
    setup(props) {
        const initialLoading = inject(initialLoadingKey, ref(false))
        const isSmallScreen = inject('isSmallScreen', ref(false))

        const hexValue = computed(() => {
            let result
            if (props.aliasValue) {
                const alias = base32ToAlias(props.aliasValue)
                result = alias ? byteToHex(alias) : null
            } else {
                result = null
            }
            return result
        })

        const copyToClipboard = (): void => {
            if (hexValue.value) {
                navigator.clipboard.writeText(hexValue.value)
            }
        }

        return {
            initialLoading,
            isSmallScreen,
            hexValue,
            copyToClipboard
        }
    }
})

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
