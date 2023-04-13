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

    <div class="block h-is-tertiary-text" style="font-weight: 300">
        <template v-if="errorCount >= 1">
          Server reported errors during the search execution.<br/>
          This might be transient. Try to search again in a few moments.
        </template>
        <template v-else>
          <span >No account, transaction, contract, token or topic matches "</span>
          <span style="font-weight: 400">{{ searchedId }}</span>
          <span >".</span>
          <br/><br/>
          <hr style="height: 0.5px" />
          <br/>
          <div class="has-text-centered">
            <div class="has-text-left" style="display: inline-block; max-width: 1024px">
              <span style="display: inline-block">Make sure you enter one of the expressions below:</span>
              <br/><br/>
              <div>
                &bull; an entity ID (0.0.x)<br/>
                <div class="should-wrap h-help-item">
                  Example:&nbsp;0.0.1484550
                </div>
              </div>
              <div>
                &bull; a transaction ID (0.0.x@seconds.nanoseconds)<br/>
                <div class="should-wrap h-help-item">
                  Example:&nbsp;0.0.1484550@1672860351.268707677
                </div>
              </div>
              <div v-if="false">
                &bull; a transaction hash (96 characters in hexadecimal notation)<br/>
                <div class="should-wrap h-help-item">
                  Example:&nbsp;0x7b35c2dba2199cea846d96b58d8786132831a3522650bb369899e6fac01933a8ca3d79da0db93cd2bf816c1b97819afa
                </div>
              </div>
              <div>
                &bull; a transaction timestamp (seconds.nanoseconds)<br/>
                <div class="should-wrap h-help-item">
                  Example:&nbsp;1672860361.726937910
                </div>
              </div>
              <div>
                &bull; an account public key (64 or 66 characters in hexadecimal notation)<br/>
                <div class="should-wrap h-help-item">
                  Example:&nbsp;0x0000fc0634e2ab455eff393f04819efa262fe5e6ab1c7ed1d4f85fbcd8e6e296
                </div>
              </div>
              <div>
                &bull; a key alias (string in base 32 or hexadecimal notation)<br/>
                <div class="should-wrap h-help-item">
                  Example:&nbsp;CIQAAAH4AY2OFK2FL37TSPYEQGPPUJRP4XTKWHD62HKPQX543DTOFFQ
                </div>
                <div class="should-wrap h-help-item">
                  or:&nbsp;0x12200000fc0634e2ab455eff393f04819efa262fe5e6ab1c7ed1d4f85fbcd8e6e296
                </div>
              </div>
              <div>
                &bull; an evm address alias or account num alias (40 characters in hexadecimal notation)<br/>
                <div class="should-wrap h-help-item">
                  Example:&nbsp;0x00000000000000000000000000000000000b03ae
                </div>
              </div>
              <div>
                &bull; a block hash or hash prefix (resp. 96 or 64 characters in hexadecimal notation)<br/>
                <div class="should-wrap h-help-item">
                  Example:&nbsp;0xd84193b8a421cee8035fccbce280c89f79509aa86969c1a425337b7218e9474121254ce71aa3952fc909ac240bec2e5f
                </div>
                <div class="should-wrap h-help-item">
                  or: 0xd84193b8a421cee8035fccbce280c89f79509aa86969c1a425337b7218e94741
                </div>
              </div>
            </div>
          </div>

        </template>
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
  name: 'NoSearchResult',
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

.h-help-item {
  margin-left: 15px;
  font-weight: 200;
  font-size: 14px;
}

</style>
