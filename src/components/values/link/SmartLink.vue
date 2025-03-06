// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <div v-if="routeName === 'AccountDetails'">
    <AccountLink :account-id="entityId" :show-extra="showExtra"/>
  </div>
  <div v-else-if="routeName === 'TokenDetails'">
    <TokenLink :token-id="entityId" :show-extra="showExtra"/>
  </div>
  <div v-else-if="routeName === 'ContractDetails'">
    <ContractLink :contract-id="entityId"/>
  </div>
  <div v-else-if="routeName === 'TopicDetails'">
    <TopicLink :topic-id="entityId"/>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent} from "vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TokenLink from "@/components/values/link/TokenLink.vue";
import TopicLink from "@/components/values/link/TopicLink.vue";
import ContractLink from "@/components/values/link/ContractLink.vue";

export default defineComponent({
  name: "EntityLink",
  components: {TokenLink, AccountLink, ContractLink, TopicLink},
  props: {
    entityId: String,
    routeName: String,
    showExtra: Boolean,
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

