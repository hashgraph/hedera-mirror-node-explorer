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
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
    <button class="button is-white is-small is-uppercase"
            @click="handleClick"
            :disabled="!buttonEnabled"><slot/></button>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {DialogController, DialogMode} from "@/components/dialog/DialogController";

export default defineComponent({
    name: "DialogButton",
    components: {},

    props: {
        controller: {
            type: Object as PropType<DialogController>,
            required: true
        },
        autoClose: {
            type: Boolean,
            default: true
        },
        enabled: {
            type: Boolean,
            default: true
        }
    },
    emits: ["action"],
    setup(props, ctx) {

        const handleClick = () => {
            ctx.emit("action")
            if (props.autoClose) {
                props.controller.visible.value = false
            }
        }

        const buttonEnabled = computed(
            () => props.enabled && props.controller.mode.value !== DialogMode.Busy)

        return {
            handleClick,
            buttonEnabled
        }
    }

})
</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
