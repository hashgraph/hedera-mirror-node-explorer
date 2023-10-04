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
    <div v-if="routeName === 'AccountDetails'"
        ><AccountLink :account-id="entityId" :show-extra="showExtra"
    /></div>
    <div v-else-if="routeName === 'TokenDetails'"
        ><TokenLink :token-id="entityId" :show-extra="showExtra"
    /></div>
    <div v-else-if="routeName === 'ContractDetails'"
        ><ContractLink :contract-id="entityId" :show-extra="showExtra"
    /></div>
    <div v-else-if="routeName === 'TopicDetails'"
        ><TopicLink :topic-id="entityId" :show-extra="showExtra"
    /></div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import { defineComponent } from "vue";
import AccountLink from "@/components/values/AccountLink.vue";
import TokenLink from "@/components/values/TokenLink.vue";
import TopicLink from "@/components/values/TopicLink.vue";
import ContractLink from "@/components/values/ContractLink.vue";

export default defineComponent({
    name: "EntityLink",
    components: { TokenLink, AccountLink, ContractLink, TopicLink },
    props: {
        entityId: String,
        routeName: String,
        showExtra: {
            type: Boolean,
            default: false,
        },
    },
});
</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style />
