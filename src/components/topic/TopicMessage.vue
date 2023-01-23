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

  <div v-if="message">

    <DashboardCard class="h-card">
      <template v-slot:title>
        <span class="h-is-secondary-title">Message Submitted</span>
      </template>
      <template v-slot:content>
        <Property id="sequenceNumber" :full-width="true">
          <template v-slot:name>Sequence Number</template>
          <template v-slot:value>
            {{ sequence_number }}
          </template>
        </Property>
        <Property id="message" :full-width="true">
          <template v-slot:name>Message</template>
          <template v-slot:value>
            <BlobValue :blob-value="message" :show-none="true" :base64="true" :pretty="true" class="should-wrap is-numeric"/>
          </template>
        </Property>
        <Property id="runningHashVersion" :full-width="true">
          <template v-slot:name>Running Hash Version</template>
          <template v-slot:value>
            <PlainAmount :amount="running_hash_version"/>
          </template>
        </Property>
        <Property id="runningHash" :full-width="true">
          <template v-slot:name>Running Hash</template>
          <template v-slot:value>
            <BlobValue :blob-value="running_hash" :show-none="true" class="should-wrap is-numeric"/>
          </template>
        </Property>
      </template>
    </DashboardCard>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Property from "@/components/Property.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import {TopicMessageLoader} from "@/components/topic/TopicMessageLoader";
import BlobValue from "@/components/values/BlobValue.vue";

export default defineComponent({

  name: 'TopicMessage',

  components: {
    PlainAmount,
    BlobValue,
    Property,
    DashboardCard
  },

  props: {
    messageLoader: {
      type: Object as PropType<TopicMessageLoader>,
      required: true
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    return {
      isSmallScreen,
      isTouchDevice,
      sequence_number: props.messageLoader.sequence_number,
      message: props.messageLoader.message,
      running_hash_version: props.messageLoader.running_hash_version,
      running_hash: props.messageLoader.running_hash
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>