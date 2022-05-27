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

<template>

  <div v-if="accountId">
    <template v-if="noAnchor">
      <span class="is-numeric">{{ accountId }}</span>
    </template>
    <template v-else>
      <router-link :to="{name: 'AccountDetails', params: {accountId: accountId}}">
        <span class="is-numeric">{{ accountId }}</span>
      </router-link>
    </template>
    <template v-if="showExtra && extra.length > 0">
      <span class="ml-2 h-is-smaller h-is-extra-text is-numeric">{{ extra }}</span>
    </template>
  </div>

  <span v-else-if="showNone && !initialLoading" class="has-text-grey">None</span>

  <div v-else-if="accountId === null">{{ nullLabel }}</div>

  <span v-else/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from "vue";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import {initialLoadingKey} from "@/AppKeys";

export default defineComponent({
  name: "AccountLink",

  props: {
    accountId: String as PropType<string|null>,
    showExtra: {
      type: Boolean,
      default: false
    },
    showNone: {
      type: Boolean,
      default: false
    },
    noAnchor: {
      type: Boolean,
      default: false
    },
    nullLabel: {
      type: String,
      default: "O"
    }
  },

  setup(props) {
    const extra = computed(() => {
      return (props.accountId ? operatorRegistry.makeDescription(props.accountId) : null) ?? ""
    })

    const initialLoading = inject(initialLoadingKey, ref(false))

    return { extra, initialLoading }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

