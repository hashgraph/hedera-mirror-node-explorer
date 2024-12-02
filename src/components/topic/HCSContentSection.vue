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

  <DashboardCard v-if="props.hcs1Asset && props.topicMemo" collapsible-key="hcs1Content">

    <template v-slot:title>
      <span class="h-is-secondary-title">HCS-1 Content</span>
    </template>

    <template #content>
      <Property id="hash" :full-width="true">
        <template v-slot:name>Hash</template>
        <template v-slot:value>
          {{ props.topicMemo?.hash }}
        </template>
      </Property>
      <Property id="compression" :full-width="true">
        <template v-slot:name>Compression</template>
        <template v-slot:value>
          {{ props.topicMemo?.algo }}
        </template>
      </Property>
      <Property id="encoding" :full-width="true">
        <template v-slot:name>Encoding</template>
        <template v-slot:value>
          {{ props.topicMemo?.encoding }}
        </template>
      </Property>
      <Property id="mime-type" :full-width="true">
        <template v-slot:name>MIME Type</template>
        <template v-slot:value>
          {{ hcs1DataType }}
        </template>
      </Property>
      <Property id="preview" :full-width="true">
        <template v-slot:name>Preview</template>
        <template v-slot:value>
          <MediaContent
              v-if="hcs1DataURL"
              :url="hcs1DataURL"
              :type="hcs1DataType"
              :size="200"
              :auto="false"
          />
          <BlobValue
              v-else-if="jsonContent"
              :blob-value="jsonContent"
              :show-none="true"
              :base64="true"
              :pretty="true"
          />
        </template>
      </Property>
    </template>
  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, PropType} from 'vue';
import DashboardCard from "@/components/DashboardCard.vue";
import Property from "@/components/Property.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {HCSTopicMemo} from "@/utils/HCSTopicMemo.ts";
import MediaContent from "@/components/MediaContent.vue";
import {HCSAsset} from "@/utils/cache/HCSAsset.ts";

const props = defineProps({
  topicMemo: {
    type: Object as PropType<HCSTopicMemo | null>,
    default: null
  },
  hcs1Asset: {
    type: Object as PropType<HCSAsset | null>,
    default: null
  }
})


const hcs1DataType = computed(() =>
    props.hcs1Asset ? props.hcs1Asset.type : null
)

const jsonContent = computed(() => {
  let result: string | null
  if (
      props.hcs1Asset
      && hcs1DataType.value !== null
      && (hcs1DataType.value.startsWith('application/json'))
  ) {
    result = Buffer.from(props.hcs1Asset.content).toString()
  } else {
    result = null
  }
  return result
})

const hcs1DataURL = computed(() => {
  let result: string | null
  if (
      props.hcs1Asset
      && hcs1DataType.value !== null
      && (hcs1DataType.value.startsWith('image') || hcs1DataType.value.startsWith('video'))
  ) {
    result = props.hcs1Asset.getDataURL()
  } else {
    result = null
  }
  return result
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>
