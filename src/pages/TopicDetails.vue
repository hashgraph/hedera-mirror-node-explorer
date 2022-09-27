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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>

      <template v-slot:title>
        <span class="h-is-primary-title">Messages for Topic </span>
        <span v-if="validEntityId" class="h-is-secondary-text">{{ normalizedTopicId }}</span>
        <span v-if="topicChecksum" class="has-text-grey" style="font-size: 28px">-{{ topicChecksum }}</span>
      </template>

      <template v-slot:control>
        <PlayPauseButton v-bind:controller="messageTableController"/>
      </template>

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification"/>
        <TopicMessageTable v-if="validEntityId" v-bind:controller="messageTableController"/>
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
import PlayPauseButton from "@/utils/table/PlayPauseButton.vue";
import TopicMessageTable from "@/components/topic/TopicMessageTable.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import Footer from "@/components/Footer.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import {EntityID} from "@/utils/EntityID";
import {TopicMessageTableController} from "@/components/topic/TopicMessageTableController";

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
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const validEntityId = computed(() => {
      return props.topicId ? EntityID.parse(props.topicId, true) != null : false
    })
    const normalizedTopicId = computed(() => {
      return props.topicId ? EntityID.normalize(props.topicId) : props.topicId
    })

    const topicChecksum = computed(() =>
        normalizedTopicId.value ? EntityID.parse(normalizedTopicId.value)?.makeChecksum() : null)

    const notification = computed(() => {
      let result
      if (!validEntityId.value) {
        result = "Invalid topic ID: " + props.topicId
      } else {
        result = null
      }
      return result
    })

    //
    // messageTableController
    //

    const pageSize = computed(() => isMediumScreen ? 15 : 5)
    const messageTableController = new TopicMessageTableController(normalizedTopicId, pageSize)
    onMounted(() => messageTableController.mounted.value = true)
    onBeforeUnmount(() => messageTableController.mounted.value = false)

    return {
      isSmallScreen,
      isTouchDevice,
      messageTableController,
      validEntityId,
      normalizedTopicId,
      topicChecksum,
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
