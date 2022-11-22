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

  <section class="section has-text-centered" style="min-height: 450px">

    <p class="h-is-secondary-text" style="font-weight: 300">
      <template v-if="errorCount >= 1">
        Search error
      </template>
      <template v-else>
        No result
      </template>
    </p>
    <br/>

    <div class="block">
      <p class="h-is-tertiary-text" style="font-weight: 300">
        <template v-if="errorCount >= 1">
          Server reported errors during the search execution.<br/>
          This might be transient. Try to search again in a few moments.
        </template>
        <template v-else>
          <span >No account, transaction, contract, token or topic matches "</span>
          <span style="font-weight: 400">{{ this.searchedId }}</span>
          <span >".</span>
          <br/><br/>
          Make sure you enter one of the expressions below:<br/><br/>
          an entity ID (0.0.x),<br/>
          a transaction ID (0.0.x@seconds.nanoseconds),<br/>
          a transaction hash (48 bytes in hexadecimal notation),<br/>
          an ethereum address (20 bytes in hexadecimal notation),<br/>
          an account public key (32 or 33 bytes in hexadecimal notation),<br/>
          an account alias (string in base 32 or hexadecimal notation).<br/>
        </template>
      </p>
    </div>

  </section>

  <Footer :keep-background="true"/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent} from 'vue';
import Footer from "@/components/Footer.vue";

export default defineComponent({
  name: 'SearchResult',
  components: {Footer},
  props: {
    "searchedId": String,
    "errorCount": Number,
    "network": String
  }
})

</script>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

</style>
