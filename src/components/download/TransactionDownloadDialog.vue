<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
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

    <Dialog :controller="controller">

        <!-- title -->
        <template v-slot:dialogTitle>
            <DialogTitle>{{ dialogTitle }}</DialogTitle>
        </template>

        <!-- input -->
        <template v-slot:dialogInput>
            Input parameters
        </template>

        <template v-slot:dialogInputButtons>
            <DialogButton :controller="controller">Cancel</DialogButton>
            <CommitButton :controller="controller" :enabled="downloadEnabled" @action="handleDownload" >Download</CommitButton>
        </template>


    </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import DialogTitle from "@/components/dialog/DialogTitle.vue";
import DialogStatus from "@/components/dialog/DialogStatus.vue";
import CommitButton from "@/components/dialog/CommitButton.vue";
import DialogButton from "@/components/dialog/DialogButton.vue";
import Dialog from "@/components/dialog/Dialog.vue";
import {DialogController} from "@/components/dialog/DialogController";

export default defineComponent({
    components: {DialogTitle, DialogStatus, CommitButton, DialogButton, Dialog },
    props: {
        controller: {
            type: Object as PropType<DialogController>,
            required: true
        }
    },
    setup(props) {

        const dialogTitle = computed(() => "Beau titre")

        const handleDownload = () => {
            props.controller.visible.value = false
            // props.controller.mode.value = DialogMode.Busy
            // props.contractCallBuilder.saveInputParams()
            // props.contractCallBuilder.execute()
            //     .then(() => {
            //         if (props.contractCallBuilder.lastError.value !== null) {
            //             props.controller.mode.value = DialogMode.Error
            //         } else {
            //             props.controller.mode.value = DialogMode.Success
            //         }
            //     })
            //     .catch(() => {
            //         props.controller.mode.value = DialogMode.Error
            //     })
            //     .finally(() => {
            //         if (!props.contractCallBuilder.isReadOnly()) {
            //             ctx.emit("didUpdateContractState")
            //         }
            //     })
        }

        const downloadEnabled = computed(() => false)

        const errorMessage = computed(() => {
            return "no error details"
        } )

        return {
            dialogTitle,
            downloadEnabled,
            errorMessage,
            handleDownload
        }
    }

})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>