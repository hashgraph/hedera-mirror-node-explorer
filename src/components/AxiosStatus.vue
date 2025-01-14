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


<!--

              \   loading  |         true         |        false         |
        error              |                      |                      |
        -------------------+----------------------+----------------------+
        false              |  if timeoutElapsed   |        empty         |
                           |        loader        |                      |
        -------------------+  else                +----------------------+
        true               |        empty         |     error button     |
                           |                      |                      |
        -------------------+----------------------+----------------------+

 -->

<template>
  <span class="icon">
    <template v-if="late">
      <span class="loader is-inline-block"/>
    </template>
    <template v-else-if="error">
      <i class="fa fa-exclamation-triangle has-text-danger" @click="showErrorDialog = true"/>
    </template>
    <span style="display: inline-block">
        <ModalDialog v-model:show-dialog="showErrorDialog" iconClass="fa fa-2x fa-exclamation-triangle has-text-danger">
          <template v-slot:dialogMessage><slot name="message"/>{{ explanation }}</template>
          <template v-slot:dialogDetails>
            <div v-if="explanation" class="block">
              Some of the data required by this page could not be downloaded.
              The information displayed may not be accurate.
            </div>
            <div v-if="suggestion" class="block">{{ suggestion }}</div>
          </template>
        </ModalDialog>
      </span>
  </span>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from "vue"
import {errorKey, explanationKey, loadingKey, suggestionKey} from "@/AppKeys"
import ModalDialog from "@/dialogs/core/ModalDialog.vue";

export default defineComponent({

  name: "AxiosStatus",

  components: {ModalDialog},

  setup() {

    const loading = inject(loadingKey, ref(false))
    const error = inject(errorKey, ref(false))
    const explanation = inject(explanationKey, ref(""))
    const suggestion = inject(suggestionKey, ref(""))

    watch(loading, (newValue, oldValue) => {
      if (oldValue && !newValue) {
        stopTimeout()
      } else if (!oldValue && newValue) {
        startTimeout()
      }
    })
    watch(error, (newValue, oldValue) => {
      if (oldValue && !newValue) {
        // Error flag off => hides error dialog if needed
        showErrorDialog.value = false
      }
    })

    //
    // Late
    //
    const late = computed(() => {
      return loading.value && timeoutElapsed.value
    })

    //
    // timeoutElapsed
    //
    const timeoutElapsed = ref(false)
    let timeoutID = -1
    const startTimeout = () => {
      if (timeoutID == -1) {
        timeoutElapsed.value = false
        timeoutID = window.setTimeout(() => {
          timeoutElapsed.value = true
          timeoutID = -1
        }, 1000)
      }
    }
    const stopTimeout = () => {
      if (timeoutID != -1) {
        window.clearTimeout(timeoutID)
        timeoutID = -1
      }
    }

    //
    // showErrorDialog
    //
    const showErrorDialog = ref(false)

    //
    // Mount
    //
    onMounted(() => {
      startTimeout()
    })
    onBeforeUnmount(() => {
      stopTimeout()
    })

    return {
      late,
      error,
      explanation,
      suggestion,
      showErrorDialog,
    }
  }
})


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
.loader {
  border-left-color: grey;
  border-bottom-color: grey
}

i.fa-exclamation-triangle {
  cursor: pointer
}
</style>
