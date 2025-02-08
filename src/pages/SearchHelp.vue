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

  <PageFrameV2 page-title="Search Help">
    <section class="section" style="text-align: center;min-height: 450px">

      <div style="font-weight: 300; font-family: 'Inter', sans-serif;">
        <div class="has-text-left" style="display: inline-block; max-width: 1024px; font-size: 14px;">
          <span style="display: inline-block; font-size: 18px;">
            You can search using one of the expressions below:
          </span>
          <br/><br/>
          <div>
            &bull; a domain name<br/>
            <div class="should-wrap h-help-item">
              Example:&nbsp;domain1.hbar
            </div>
            <div class="should-wrap h-help-item">
              or:&nbsp;domain2.hh
            </div>
          </div>
          <div class="mt-3">
            &bull; an entity ID with or without checksum (0.0.x or 0.0.x-abcde)<br/>
            <div class="should-wrap h-help-item">
              Example:&nbsp;0.0.1484550
            </div>
            <div class="should-wrap h-help-item">
              or:&nbsp;0.0.1484550-yapfr
            </div>
          </div>
          <div class="mt-3">
            &bull; a transaction ID (0.0.x@seconds.nanoseconds)<br/>
            <div class="should-wrap h-help-item">
              Example:&nbsp;0.0.1484550@1672860351.268707677
            </div>
          </div>
          <div v-if="false" class="mt-3">
            &bull; a transaction hash (96 characters in hexadecimal notation)<br/>
            <div class="should-wrap h-help-item">
              Example:&nbsp;0x7b35c2dba2199cea846d96b58d8786132831a3522650bb369899e6fac01933a8ca3d79da0db93cd2bf816c1b97819afa
            </div>
          </div>
          <div class="mt-3">
            &bull; a transaction timestamp (seconds.nanoseconds)<br/>
            <div class="should-wrap h-help-item">
              Example:&nbsp;1672860361.726937910
            </div>
          </div>
          <div class="mt-3">
            &bull; an account public key (64 or 66 characters in hexadecimal notation)<br/>
            <div class="should-wrap h-help-item">
              Example:&nbsp;0x0000fc0634e2ab455eff393f04819efa262fe5e6ab1c7ed1d4f85fbcd8e6e296
            </div>
          </div>
          <div class="mt-3">
            &bull; a key alias (string in base 32 or hexadecimal notation)<br/>
            <div class="should-wrap h-help-item">
              Example:&nbsp;CIQAAAH4AY2OFK2FL37TSPYEQGPPUJRP4XTKWHD62HKPQX543DTOFFQ
            </div>
            <div class="should-wrap h-help-item">
              or:&nbsp;0x12200000fc0634e2ab455eff393f04819efa262fe5e6ab1c7ed1d4f85fbcd8e6e296
            </div>
          </div>
          <div class="mt-3">
            &bull; an evm address alias or account num alias (40 characters in hexadecimal notation)<br/>
            <div class="should-wrap h-help-item">
              Example:&nbsp;0x00000000000000000000000000000000000b03ae
            </div>
          </div>
          <div class="mt-3">
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

    </section>
  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
</script>


<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.h-help-item {
  margin-left: 15px;
  color: var(--text-secondary);
}

</style>
