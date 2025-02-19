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
  <div class="should-wrap">

    <template v-if="decodedValue">

      <template v-if="decodedURL">
        <span v-if="noAnchor">{{ decodedValue }}</span>
        <a v-else :href="decodedURL">{{ decodedValue }}</a>
      </template>

      <template v-else-if="jsonValue && isNaN(jsonValue)">
        <div class="json-formatting h-code-box is-inline-block should-wrap"
        >
          {{ jsonValue }}
        </div>
      </template>

      <template v-else-if="hcs1TopicRoute">
        <EntityLink :route="noAnchor ? null : hcs1TopicRoute">
          {{ decodedValue }}
        </EntityLink>
      </template>

      <template v-else>
        <div v-if="decodedValue.length > 1024"
             class="json-formatting h-code-box is-inline-block should-wrap">
          <span id="blob-main">
            {{ (b64EncodingFound && showBase64AsExtra) ? blobValue : decodedValue }}
          </span>
        </div>
        <div v-else style="word-break: break-word">
          <span id="blob-main">
            {{ (b64EncodingFound && showBase64AsExtra) ? blobValue : decodedValue }}
          </span>
          <div v-if="b64EncodingFound && showBase64AsExtra" class="h-is-extra-text">
            <span class="has-text-grey">Base64:</span>
            <span id="blob-extra">{{ decodedValue }}</span>
          </div>
        </div>
      </template>

    </template>

    <span v-else-if="showNone && !initialLoading" class="has-text-grey">None</span>

    <span v-else/>

  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, inject, PropType, ref} from "vue";
import {initialLoadingKey} from "@/AppKeys";
import {CoreConfig} from "@/config/CoreConfig";
import {blob2URL} from "@/utils/URLUtils.ts";
import {HCSURI} from "@/utils/HCSURI.ts";
import {routeManager} from "@/router.ts";
import EntityLink from "@/components/values/link/EntityLink.vue";

const props = defineProps({
  blobValue: {
    type: String as PropType<string | null>,
    default: null
  },
  showNone: {
    type: Boolean,
    default: false
  },
  base64: {
    type: Boolean,
    default: false
  },
  showBase64AsExtra: {
    type: Boolean,
    default: false
  },
  pretty: {
    type: Boolean,
    default: false
  },
  noAnchor: {
    type: Boolean,
    default: false
  }
})

const initialLoading = inject(initialLoadingKey, ref(false))

const coreConfig = CoreConfig.inject()
const ipfsGateway = coreConfig.ipfsGatewayURL
const arweaveServer = coreConfig.arweaveServerURL

const decodedURL = computed(() => blob2URL(decodedValue.value, ipfsGateway, arweaveServer))

const jsonValue = computed(() => {
  let result
  if (decodedValue.value && decodedValue.value != '{}' && props.pretty) {
    try {
      result = JSON.parse(decodedValue.value)
    } catch (e) {
      result = null
    }
  } else {
    result = null
  }
  return result
})

const hcs1TopicRoute = computed(() => {
  let result
  const hcs1Uri = HCSURI.parse(decodedValue.value)
  if (hcs1Uri) {
    result = routeManager.makeRouteToTopic(hcs1Uri.topicId)
  } else {
    result = null
  }
  return result
})

const b64EncodingFound = computed(() => b64DecodedValue.value !== null)

const b64DecodedValue = computed(() => {
  let result: string | null
  const base64regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
  if (props.blobValue && props.base64 && base64regex.test(props.blobValue)) {
    try {
      result = Buffer.from(props.blobValue, 'base64').toString()
    } catch {
      result = null
    }
  } else {
    result = null
  }
  return result
})

const decodedValue = computed(() => {

  let result: string

  if (props.blobValue) {
    if (props.base64) {
      result = b64DecodedValue.value ?? props.blobValue
    } else {
      result = props.blobValue
    }
  } else {
    result = ""
  }
  return result
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.json-formatting {
  white-space: pre-wrap;
  max-height: 200px;
}

</style>
