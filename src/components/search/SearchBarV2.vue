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

  <div v-if="!isMediumScreen">
    <form data-cy="searchBar" class="control" action="" v-on:submit.prevent="handleSubmit">
      <input
          class="input has-background-white has-text-black"
          style="border-radius: 10px; height: 50px"
          type="text"
          v-model="searchedText"
          v-bind:disabled="searchInputDisabled"
      />
    </form>
  </div>

  <div v-else>
    <div class="is-flex is-flex-direction-column">
      <form data-cy="searchBar" id="searchBar"
            class="control is-flex" action=""
            v-on:submit.prevent="handleSubmit">
        <input
            class="input has-text-white h-is-navbar-item"
            style="z-index: 1; height: 40px"
            type="text"
            placeholder="Search by ID / Address / Domain Name / Public Key / Hash / Alias / Timestamp"
            v-model="searchedText"
            v-bind:disabled="searchInputDisabled"
        />
      </form>
      <SearchDropdown :search-controller="searchController"/>
    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {inject, ref} from "vue";
import SearchDropdown from "@/components/search/SearchDropdown.vue";
import {SearchController} from "@/components/search/SearchController";
import router from "@/router";

const isMediumScreen = inject('isMediumScreen', true)
// const isTouchDevice = inject('isTouchDevice', false)
const searchedText = ref<string>("")
const searchInputDisabled = ref(false)

const searchController = new SearchController(searchedText)

const handleSubmit = (): void => {
  const allCandidates = searchController.candidates.value
  const defaultCandidate = allCandidates.length >= 1 ? allCandidates[0] : null
  if (defaultCandidate !== null) {
    router.push(defaultCandidate.route)
    searchedText.value = "" // Hides SearchDropdown
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

input::placeholder {
  color: grey;
}

</style>
