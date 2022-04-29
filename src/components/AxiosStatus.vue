<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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
        <ModalDialog v-model:show-dialog="showErrorDialog">
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

import {computed, defineComponent, onBeforeUnmount, onMounted, ref, watch} from "vue";
import {AxiosMonitor} from "@/utils/AxiosMonitor";
import ModalDialog from "@/components/ModalDialog.vue";
import axios from "axios";

export default defineComponent({

  name: "AxiosStatus",

  components: { ModalDialog },

  setup() {

    //
    // loading
    //
    const loading = ref(false)
    watch(loading, (newValue, oldValue) => {
      if (oldValue && !newValue) {
        stopTimeout()
      } else if (!oldValue && newValue) {
        startTimeout()
      }
    })

    //
    // Late
    //
    const late = computed(() => {
      return loading.value && timeoutElapsed.value
    })

    //
    // error
    //
    const error = ref(false)
    watch(error, (newValue, oldValue) => {
      if (oldValue && !newValue) {
        // Error flag off => hides error dialog if needed
        showErrorDialog.value = false
      }
    })

    //
    // Explanation / suggestion
    //
    const explanation = ref("")
    const suggestion = ref("")
    const monitorStateDidChange = () => {
      const activeRequestCount = AxiosMonitor.instance.getActiveRequestCount()
      const errorResponseCount = AxiosMonitor.instance.getErrorResponses().size

      loading.value = activeRequestCount >= 1
      error.value = errorResponseCount >= 1
      explanation.value = makeExplanationOrSuggestion(
          AxiosMonitor.instance.getErrorResponses(),
          AxiosMonitor.instance.getSuccessfulRequestCount(),
          true)
      suggestion.value = makeExplanationOrSuggestion(
          AxiosMonitor.instance.getErrorResponses(),
          AxiosMonitor.instance.getSuccessfulRequestCount(),
          false)
    }

    //
    // timeoutElapsed
    //
    const timeoutElapsed = ref(false)
    let timeoutID = -1
    const startTimeout = () => {
      if (timeoutID == -1) {
        timeoutElapsed.value = false
        timeoutID = setTimeout(() => {
          timeoutElapsed.value = true
          timeoutID = -1
        }, 1000)
      }
    }
    const stopTimeout = () => {
      if (timeoutID != -1) {
        clearTimeout(timeoutID)
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
      AxiosMonitor.instance.setStateChangeCB(monitorStateDidChange)
      startTimeout()
    })
    onBeforeUnmount(() => {
      AxiosMonitor.instance.setStateChangeCB(null)
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

function makeExplanationOrSuggestion(errors: Map<string, unknown>, successfulRequestCount: number, explanation: boolean): string {

  let errorCount_request = 0
  let errorCount_429 = 0


  const statusCodes = new Set<number>()
  for (const error of errors.values()) {

    // See https://axios-http.com/docs/handling_errors

    if (axios.isAxiosError(error)) {
      if (error.response) {
        if (error.response.status == 429) {
          errorCount_429 += 1
        } else {
          statusCodes.add(error.response.status)
        }
      } else {
        errorCount_request += 1
      }
    }
  }

  let result: string
  const errorCount = errors.size
  if (errorCount_429 >= 1) {
    // At least one request failed with http status #429
    result = explanation
        ? "The server is busy (status #429)"
        : "This is transient. Try to reload the page in a few moments."
  } else if (errorCount_request === errorCount) {
    // Failed requests do not have any response from server
    if (successfulRequestCount >= 1) {
      // Some requests did succeed => server overload ?
      result = explanation
          ? "The server is busy"
          : "This is transient. Try to reload the page in a few moments."
    } else {
      // No request did succeed => internet connection is dead ?
      result = explanation
          ? "Internet connection issue ?"
          : "Check your internet connection and reload the page."
    }
  } else {
    // Other cases
    if (statusCodes.size == 1) {
      // All requests returns the same http status
      const statusCode = statusCodes.values().next().value
      result = explanation
          ? "The server reported an error #" + statusCode
          : "This might be transient. Try to reload the page in a few moments."
    } else {
      result = explanation
          ? "The server reported errors"
          : "This might be transient. Try to reload the page in a few moments."
    }
  }

  return result
}


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