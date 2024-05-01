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
  <a :href="`${networkUrl}api/v1/${entityUrl}/${loc}`" target="_blank">
    <p class="has-text-right has-text-grey h-is-property-text">Show raw data</p>
  </a>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import {defineComponent} from "vue";

export default defineComponent({
  name: "MirrorLink",
  components: {},
  props: {
    network: String,
    entityUrl: String,
    loc: String,
  },

  setup(props) {
    let networkUrl = "https://mainnet-public.mirrornode.hedera.com/"
    if (props.network == "testnet") {
      networkUrl = "https://testnet.mirrornode.hedera.com/"
    }
    if (props.network == "previewnet") {
      networkUrl = "https://previewnet.mirrornode.hedera.com/"
    }

    return {networkUrl}
  }
});
</script>
