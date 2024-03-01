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
    <DialogButton :controller="controller" :auto-close="false" :enabled="enabled" @action="handleAction">
        <div class="dialog-stack">
            <div :class="{'is-invisible': isBusy}">
                <slot/>
            </div>
            <div :class="{'is-invisible': !isBusy}">
                <span class="loader is-inline-block"/>
            </div>
        </div>
        <template v-if="isBusy">
        </template>
        <template v-else>
        </template>
    </DialogButton>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">


import {computed, defineComponent, PropType} from "vue";
import Dialog from "@/components/dialog/Dialog.vue";
import DialogButton from "@/components/dialog/DialogButton.vue";
import {DialogController, DialogMode} from "@/components/dialog/DialogController";

export default defineComponent({
    name: "CommitButton",
    components: {DialogButton, Dialog },

    props: {
        controller: {
            type: Object as PropType<DialogController>,
            required: true
        },
        enabled: Boolean
    },
    emits: ["action"],
    setup(props, ctx) {

        const isBusy = computed(() => props.controller.mode.value == DialogMode.Busy)
        const handleAction = () => {
            ctx.emit("action")
        }

        return {
            isBusy,
            handleAction
        }
    }

})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
.dialog-stack {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    justify-items: center;
}
.dialog-stack div {
    grid-column-start: 1;
    grid-row-start: 1
}
</style>
