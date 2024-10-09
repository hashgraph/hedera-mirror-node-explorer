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

  <div v-if="!isMediumScreen" ref="root">
    <div class="is-flex is-flex-direction-column">
      <form data-cy="searchBar" class="control" action="" v-on:submit.prevent="handleSubmit">
        <input
            class="input has-background-white has-text-black"
            style="border-radius: 10px; height: 50px"
            type="text"
            spellcheck="false"
            v-model="searchedText"
            ref="inputElement"
        />
      </form>
      <SearchDropdown :search-controller="searchController" v-model:selected-agent-id="selectedAgentId"/>
    </div>
  </div>

  <div v-else ref="root">
    <div class="is-flex is-flex-direction-column">
      <form data-cy="searchBar" id="searchBar"
            class="control is-flex" action=""
            v-on:submit.prevent="handleSubmit">
        <input
            class="input has-text-white h-is-navbar-item"
            style="z-index: 1; height: 40px"
            type="text"
            spellcheck="false"
            placeholder="Search by ID / Address / Domain Name / Public Key / Hash / Alias / Timestamp"
            v-model="searchedText"
            ref="inputElement"
        />
        <button class="button is-dark" type="submit" value="searchBar"
                style="border-color: white; border-left: none; height: 40px; z-index: 0; outline: none"
                :disabled="submitDisabled">
          <i class="fa fa-search"/>
        </button>
      </form>
      <SearchDropdown :search-controller="searchController" v-model:selected-agent-id="selectedAgentId"/>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, onBeforeUnmount, onMounted, ref, watch} from "vue";
import SearchDropdown from "@/components/search/SearchDropdown.vue";
import {SearchController} from "@/components/search/SearchController";
import router from "@/router";
import {SearchAgent, SearchCandidate} from "@/components/search/SearchAgent";

const isMediumScreen = inject('isMediumScreen', true)
// const isTouchDevice = inject('isTouchDevice', false)
const searchedText = ref<string>("")

const searchController = new SearchController(searchedText)

const inputElement = ref<HTMLInputElement|null>(null)

const selectedAgentId = ref<string|null>(null)

const selectedAgent = computed(() => {
  let result: SearchAgent<unknown, unknown>|null
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
  let result: SearchCandidate<unknown>|null
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
  if (selectedAgent.value !== null && defaultCandidate.value?.route) {
    searchedText.value = "" // Hides SearchDropdown
    selectedAgent.value.willNavigate(defaultCandidate.value)
    router.push(defaultCandidate.value.route)
  }
}

const submitDisabled = computed(() => defaultCandidate.value === null)

const root = ref<HTMLElement|null>(null)
const isInside = (target: Node) => root.value !== null && root.value.contains(target)

const onMouseDown = (ev: MouseEvent) => {
  if (ev.target instanceof Node && !isInside(ev.target)) {
    searchController.inputText.value = "" // Hides SearchDropdown
  }
}
onMounted(() => {
  document.addEventListener("mousedown", onMouseDown)
})
onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onMouseDown)
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

input::placeholder {
  color: grey;
}

</style>
