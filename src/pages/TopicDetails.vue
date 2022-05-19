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

  <hr class="h-top-banner" style="margin: 0; height: 4px"/>

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Messages for Topic </span>
        <span v-if="validEntityId" class="h-is-secondary-text">{{ normalizedTopicId }}</span>
      </template>
      <template v-slot:control>
        <PlayPauseButton v-model="cacheState"/>
      </template>
      <template v-slot:table>

        <NotificationBanner v-if="notification" :message="notification"/>

        <TopicMessageTable v-if="validEntityId" v-model:cache-state="cacheState" v-bind:topic-id="topicId"/>
      </template>
    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from 'vue';
import PlayPauseButton, {PlayPauseState} from "@/components/PlayPauseButton.vue";
import TopicMessageTable from "@/components/topic/TopicMessageTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {EntityID} from "@/utils/EntityID";

export default defineComponent({

  name: 'TopicDetails',

  props: {
    topicId: {
      type: String,
      required: true
    },
    network: String
  },

  components: {
    NotificationBanner,
    Footer,
    DashboardCard,
    TopicMessageTable,
    PlayPauseButton
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const cacheState = ref<PlayPauseState>(PlayPauseState.Play)

    const validEntityId = computed(() => {
      return props.topicId ? EntityID.parse(props.topicId, true) != null : false
    })
    const normalizedTopicId = computed(() => {
      return props.topicId ? EntityID.normalize(props.topicId) : props.topicId
    })

    const notification = computed(() => {
      let result
      if (!validEntityId.value) {
        result = "Invalid topic ID: " + props.topicId
      } else {
        result = null
      }
      return result
    })

    return {
      isSmallScreen,
      isTouchDevice,
      cacheState,
      validEntityId,
      normalizedTopicId,
      notification
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>
