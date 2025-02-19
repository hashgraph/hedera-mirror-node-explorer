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

  <PageFrame>
    <template #pageContent>
      <DashboardCard>
        <template v-slot:title>
          <span class="h-is-primary-title">Recent Accounts</span>
        </template>
        <template v-slot:control>
          <PlayPauseButton v-bind:controller="accountTableController"/>
        </template>
        <template v-slot:content>
          <AccountTable :controller="accountTableController"/>
        </template>
      </DashboardCard>
    </template>
  </PageFrame>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
import AccountTable from "@/components/account/AccountTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import PageFrame from "@/components/page/PageFrame.vue";
import {AccountTableController} from "@/components/account/AccountTableController";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import {useRouter} from "vue-router";

export default defineComponent({
  name: 'Accounts',

  props: {
    network: String
  },

  components: {
    PageFrame,
    PlayPauseButton,
    DashboardCard,
    AccountTable
  },

  setup() {
    const isMediumScreen = inject('isMediumScreen', true)

    //
    // AccountTableController
    //
    const perPage = ref(isMediumScreen ? 15 : 10)
    const accountTableController = new AccountTableController(useRouter(), perPage)
    onMounted(() => accountTableController.mount())
    onBeforeUnmount(() => accountTableController.unmount())

    return {
      accountTableController,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
