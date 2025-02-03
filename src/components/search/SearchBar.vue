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
  <DropdownPanel
      v-model:deployed="showSearchDropdown"
      background-color="var(--border-secondary)"
      :stretched="true">
    <template #button>
      <form data-cy="searchBar" id="searchBar" action=""
            v-on:submit.prevent="handleSubmit">
        <input
            type="text"
            spellcheck="false"
            placeholder="Search by ID / Address / Domain Name / Public Key / Hash / Alias / Timestamp"
            v-model="searchedText"
            ref="inputElement"
            :size="isLargeScreen ? 70 : undefined"
            style="width: 100%; text-overflow: ellipsis;"
        />
        <button type="submit" value="searchBar" :disabled="submitDisabled" style="flex: none" >
          <Search :size="18" style="color: var(--network-button-text-color); margin-top: 4px;"/>
        </button>
      </form>
    </template>
    <template #panel>
      <SearchDropdown :search-controller="searchController" v-model:selected-agent-id="selectedAgentId"/>
    </template>
  </DropdownPanel>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, ref, watch} from "vue";
import {SearchController} from "@/components/search/SearchController";
import router from "@/router";
import {SearchAgent, SearchCandidate} from "@/components/search/SearchAgent";
import DropdownPanel from "@/components/DropdownPanel.vue";
import SearchDropdown from "@/components/search/SearchDropdown.vue";
import {Search} from "lucide-vue-next";

const emit = defineEmits(["search"]);

const isLargeScreen = inject('isLargeScreen', true)

const searchedText = ref<string>("")

const searchController = new SearchController(searchedText)

const inputElement = ref<HTMLInputElement | null>(null)

const selectedAgentId = ref<string | null>(null)

const selectedAgent = computed(() => {
  let result: SearchAgent<unknown, unknown> | null
  if (selectedAgentId.value !== null) {
    result = searchController.findAgentById(selectedAgentId.value)
  } else {
    result = null
  }
  return result
})

const candidates = computed(() => {
  let result: SearchCandidate<unknown>[]
  if (selectedAgent.value !== null) {
    result = selectedAgent.value.candidates.value
  } else {
    result = []
  }
  return result
})

const defaultCandidate = computed(() => {
  let result: SearchCandidate<unknown> | null
  if (candidates.value.length >= 1) {
    result = candidates.value[0]
  } else {
    result = null
  }
  return result
})

watch(selectedAgent, () => {
  if (inputElement.value !== null) {
    inputElement.value.focus()
  }
})

const handleSubmit = () => {
  emit("search")
  if (selectedAgent.value !== null && defaultCandidate.value?.route) {
    searchedText.value = "" // Hides SearchDropdown
    selectedAgent.value.willNavigate(defaultCandidate.value)
    router.push(defaultCandidate.value.route)
  }
}

const submitDisabled = computed(() => defaultCandidate.value === null)

const showSearchDropdown = ref(false)
watch(searchController.actualInputText, (newValue) => {
  showSearchDropdown.value = newValue !== ""
})
watch(showSearchDropdown, (show) => {
  if (!show) {
    searchController.inputText.value = ""
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

form {
  display: flex;
  align-items: center;
  background-color: var(--border-secondary);
  border-radius: 40px;
  border-width: 1px;
  border-style: solid;
  border-color: transparent;
  padding: 5px;
  justify-content: flex-end;
}

input {
  height: 48px;
  padding-left: 24px;
  padding-right: 4px;
  background-color: transparent;
  border-color: transparent;
  color: var(--text-primary);
  outline: none;
}

button {
  height: 48px;
  width: 66px;
  background-color: var(--network-theme-color);
  border-radius: 24px;
  border-style: solid;
  border-width: 0;
}

</style>
