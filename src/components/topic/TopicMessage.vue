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

  <DashboardCardV2 v-if="props.message" collapsible-key="messageSubmitted">
    <template #title>
      <span>Message Submitted</span>
    </template>
    <template #content>
      <Property id="sequenceNumber" :full-width="true">
        <template v-slot:name>Sequence Number</template>
        <template v-slot:value>
          {{ sequence_number }}
        </template>
      </Property>
      <Property id="props.message" :full-width="true">
        <template v-slot:name>Message</template>
        <template v-slot:value>
          <BlobValue :blob-value="messageContent" :show-none="true" :base64="true" :pretty="true"/>
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
          <BlobValue :blob-value="running_hash" :show-none="true"/>
        </template>
      </Property>
    </template>
  </DashboardCardV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from 'vue';
import Property from "@/components/Property.vue";
import PlainAmount from "@/components/values/PlainAmount.vue";
import {TopicMessage} from "@/schemas/MirrorNodeSchemas";
import BlobValue from "@/components/values/BlobValue.vue";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";

const props = defineProps({
  message: Object as PropType<TopicMessage | null>
})

const messageContent = computed(() => props.message?.message ?? null)

const sequence_number = computed(() => props.message?.sequence_number ?? null)

const running_hash_version = computed(() => props.message?.running_hash_version ?? null)

const running_hash = computed(() => props.message?.running_hash ?? null)

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
