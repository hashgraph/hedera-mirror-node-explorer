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

  <hr class="h-top-banner" style="margin: 0; height: 4px"/>

  <section class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Token </span>
        <span class="h-is-secondary-text mr-2">{{ tokenId }}</span>
        <span v-if="tokenInfo?.type === 'NON_FUNGIBLE_UNIQUE'"
              class="h-is-tertiary-text has-text-grey">Non Fungible</span>
        <span v-else class="h-is-tertiary-text has-text-grey">Fungible</span>
      </template>
      <template v-slot:table>
        <div class="columns h-is-property-text">

          <div class="column">

            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Name</div>
              <div class="column should-wrap" id="name">
                <BlobValue v-bind:blob-value="tokenInfo?.name" v-bind:show-none="true"/>
              </div>
            </div>

            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Symbol</div>
              <div class="column should-wrap" id="symbol">
                <BlobValue v-bind:blob-value="tokenInfo?.symbol" v-bind:show-none="true"/>
              </div>
            </div>

            <div class="columns" id="adminKey">
              <div class="column is-one-third has-text-weight-light">Admin Key</div>
              <div v-if="tokenInfo?.admin_key != null" class="column">
                <KeyValue
                    v-bind:key-bytes="tokenInfo?.admin_key?.key"
                    v-bind:key-type="tokenInfo?.admin_key?._type"
                />
              </div>
              <div v-else class="column has-text-grey">None</div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Memo</div>
              <div class="column should-wrap" id="memo">
                <BlobValue v-bind:blob-value="tokenInfo?.memo" v-bind:show-none="true" v-bind:base64="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Expires at</div>
              <div class="column" id="expiresAt">
                <TimestampValue v-bind:timestamp="tokenInfo?.expiry_timestamp" v-bind:nano="true" v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Auto Renew Period</div>
              <div class="column" id="autoRenewPeriod">{{ formatSeconds(tokenInfo?.auto_renew_period) }}</div>
            </div>

          </div>

          <div class="column has-text-left">

            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Created at</div>
              <div class="column" id="createdAt">
                <TimestampValue v-bind:timestamp="tokenInfo?.created_timestamp" v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Modified at</div>
              <div class="column" id="modifiedAt">
                <TimestampValue v-bind:timestamp="tokenInfo?.modified_timestamp" v-bind:show-none="true"/>
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Supply Type</div>
              <div class="column" id="supplyType">
                {{ tokenInfo?.supply_type }}
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Total Supply</div>
              <div class="column" id="totalSupply">
                {{ tokenInfo?.total_supply }}
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Initial Supply</div>
              <div class="column" id="initialSupply">
                {{ tokenInfo?.initial_supply }}
              </div>
            </div>
            <div class="columns">
              <div class="column is-one-third has-text-weight-light">Max Supply</div>
              <div class="column" id="maxSupply">
                {{ tokenInfo?.max_supply }}
              </div>
            </div>

          </div>

        </div>

        <template v-if="tokenInfo">
          <br/>
          <div v-if="tokenInfo.type === 'NON_FUNGIBLE_UNIQUE'">
            <p class="h-is-tertiary-text mb-2">NFT Holders</p>

            <TokenNftTable v-bind:nb-items="10" v-bind:token-id="tokenId"/>
          </div>

          <div v-else>
            <p class="h-is-tertiary-text mb-2">Balances</p>

            <TokenBalanceTable v-bind:nb-items="10" v-bind:token-id="tokenId"/>
          </div>
        </template>
      </template>
    </DashboardCard>

  </section>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, onBeforeMount, ref, watch} from 'vue';
import router from "@/router";
import axios from "axios";
import KeyValue from "@/components/values/KeyValue.vue";
import {TokenInfo} from "@/schemas/HederaSchemas";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TokenNftTable from "@/components/token/TokenNftTable.vue";
import TokenBalanceTable from "@/components/token/TokenBalanceTable.vue";
import {formatSeconds} from "@/utils/Duration";
import DashboardCard from "@/components/DashboardCard.vue";
import BlobValue from "@/components/values/BlobValue.vue";

export default defineComponent({

  name: 'TokenDetails',

  components: {
    BlobValue,
    DashboardCard,
    TimestampValue,
    TokenBalanceTable,
    TokenNftTable,
    KeyValue
  },

  props: {
    tokenId: String,
    network: String
  },

  setup(props) {

    let tokenInfo = ref<TokenInfo | null> (null)

    onBeforeMount(() => {
      fetchTokenInfo();
    })

    watch(() => props.tokenId, () => {
      fetchTokenInfo()
    });

    const fetchTokenInfo = () => {
      axios
          .get("api/v1/tokens/" + props.tokenId)
          .then(response => {
            tokenInfo.value = response.data;
          })
    }

    const showTokenDetails = (tokenId: string) => {
      router.push({name: 'TokenDetails', params: {tokenId: tokenId}})
    }

    return {
      tokenInfo,
      showTokenDetails,

      formatSeconds
    }
  },
});



</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
