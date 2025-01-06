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

  <BlobValue
      :blob-value="propertyValue"
      :base64="isMessage"
  />

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onBeforeUnmount, onMounted, PropType} from "vue";
import BlobValue from "@/components/values/BlobValue.vue";
import {TopicMessageByTimestampCache} from "@/utils/cache/TopicMessageByTimestampCache.ts";

export enum TopicMessageCellItem {
  sequenceNumber = "sequenceNumber",
  message = "message"
}

const DEFAULT_TRUNCATION = 150

export default defineComponent({
  name: "TopicMessageCell",
  components: {BlobValue},

  props: {
    timestamp: {
      type: String as PropType<string | null>,
      default: null
    },
    property: {
      type: String as PropType<TopicMessageCellItem>,
      default: TopicMessageCellItem.message
    },
    truncation: {
      type: Number,
      default: DEFAULT_TRUNCATION
    }
  },

  setup(props) {
    const timestamp = computed(() => props.timestamp)

    const messageLookup = TopicMessageByTimestampCache.instance.makeLookup(timestamp)
    onMounted(() => messageLookup.mount())
    onBeforeUnmount(() => messageLookup.unmount())

    const isMessage = computed(() =>
        props.property === TopicMessageCellItem.message && propertyValue.value !== null
    )

    const propertyValue = computed(() => {
      let result: string | null
      switch (props.property) {
        case TopicMessageCellItem.message:
          result = truncate(messageLookup.entity.value?.message ?? '', props.truncation)
          break
        case TopicMessageCellItem.sequenceNumber:
          result = messageLookup.entity.value?.sequence_number.toString() ?? ''
          break
        default:
          result = null
      }
      return result
    })

    const truncate = (value: string, length: number): string => {
      return value.length > length ? value.slice(0, length) + '…' : value
    }

    return {
      propertyValue,
      isMessage,
      TopicMessageCellItem,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
