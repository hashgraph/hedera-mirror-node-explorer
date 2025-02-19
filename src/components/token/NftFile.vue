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

  <MediaContent
      :url="url"
      :type="type"
      :size="size"
      :auto="false"
      :no-anchor="noAnchor"
  >
    <template #placeHolder>
      <div class="icon mt-4" style="font-size: 50px">
        <i class="fas fa-file"></i>
      </div>
      <div class="place-holder-text">
        {{ type }}
      </div>
    </template>
  </MediaContent>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType} from "vue";
import MediaContent from "@/components/MediaContent.vue";

export default defineComponent({
  name: "NftFile",
  components: {MediaContent},

  props: {
    url: {
      type: String as PropType<string | null>,
      default: null
    },
    type: {
      type: String as PropType<string | null>,
      default: null
    },
    size: {
      type: Number,
      default: 50
    },
    noAnchor: {
      type: Boolean,
      default: false
    },
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.place-holder-text {
  font-size: 10px;
  margin-top: 1.5rem;
}

</style>
