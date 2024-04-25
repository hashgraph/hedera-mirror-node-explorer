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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <div class="is-flex is-align-items-baseline">
          <p class="h-is-primary-title">Collection</p>
          <TokenLink
              v-bind:show-extra="true"
              v-bind:token-id="tokenId"
              class="h-is-secondary-text ml-2"
          />
        </div>
        <p class="h-is-tertiary-text has-text-grey">{{ 'for Account ' + normalizedAccountId }}</p>
      </template>
      <template v-slot:content>
        <CollectionTable :token-id="tokenId" :controller="collectionTableController"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import {useRouter} from "vue-router";
import {EntityID} from "@/utils/EntityID";
import {CollectionTableController} from "@/components/account/CollectionTableController";
import CollectionTable from "@/components/account/CollectionTable.vue";
import TokenLink from "@/components/values/link/TokenLink.vue";

export default defineComponent({

  name: 'AccountCollection',

  components: {
    TokenLink,
    CollectionTable,
    Footer,
    DashboardCard
  },

  props: {
    accountId: {
      type: String,
      required: true
    },
    tokenId: {
      type: String,
      required: true
    },
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const perPage = computed(() => isMediumScreen ? 15 : 5)
    const normalizedAccountId = computed(() => {
      const result = EntityID.parse(props.accountId) ?? EntityID.fromAddress(props.accountId)
      return result !== null ? result.toString() : null
    })

    const collectionTableController = new CollectionTableController(useRouter(), props.tokenId, normalizedAccountId, perPage);
    onMounted(() => {
      collectionTableController.mount()
    })
    onBeforeUnmount(() => {
      collectionTableController.unmount()
    })

    return {
      isSmallScreen,
      isTouchDevice,
      collectionTableController,
      normalizedAccountId,
    }
  }
});

</script>

<style/>
