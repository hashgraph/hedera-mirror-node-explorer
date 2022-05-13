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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Token </span>
        <span class="h-is-secondary-text mr-2">{{ normalizedTokenId }}</span>
        <span v-if="tokenInfo?.type === 'NON_FUNGIBLE_UNIQUE'"
              class="h-is-tertiary-text has-text-grey">Non Fungible</span>
        <span v-else class="h-is-tertiary-text has-text-grey">Fungible</span>
      </template>
      <template v-slot:table>
        <div class="columns h-is-property-text">

          <div class="column">
            <Property :id="'name'">
              <template v-slot:name>Name</template>
              <template v-slot:value>
                <BlobValue v-bind:blob-value="tokenInfo?.name" v-bind:show-none="true" class="should-wrap"/>
              </template>
            </Property>
            <Property :id="'symbol'">
              <template v-slot:name>Symbol</template>
              <template v-slot:value>
                <BlobValue v-bind:blob-value="tokenInfo?.symbol" v-bind:show-none="true" class="should-wrap"/>
              </template>
            </Property>
            <Property :id="'adminKey'">
              <template v-slot:name>Admin Key</template>
              <template v-slot:value>
                <KeyValue :key-bytes="tokenInfo?.admin_key?.key" :key-type="tokenInfo?.admin_key?._type" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'memo'">
              <template v-slot:name>Memo</template>
              <template v-slot:value>
                <BlobValue :blob-value="tokenInfo?.memo" :show-none="true" :base64="true" class="should-wrap"/>
              </template>
            </Property>
            <Property :id="'expiresAt'">
              <template v-slot:name>Expires at</template>
              <template v-slot:value>
                <TimestampValue :timestamp="tokenInfo?.expiry_timestamp" :nano="true" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'autoRenewPeriod'">
              <template v-slot:name>Auto Renew Period</template>
              <template v-slot:value>
                {{ formatSeconds(tokenInfo?.auto_renew_period) }}
              </template>
            </Property>
          </div>

          <div class="column">
            <Property :id="'createdAt'">
              <template v-slot:name>Created at</template>
              <template v-slot:value>
                <TimestampValue :timestamp="tokenInfo?.created_timestamp" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'modifiedAt'">
              <template v-slot:name>Modified at</template>
              <template v-slot:value>
                <TimestampValue :timestamp="tokenInfo?.modified_timestamp" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'totalSupply'">
              <template v-slot:name>Total Supply</template>
              <template v-slot:value>
                <TokenAmount :amount="parseIntString(tokenInfo?.total_supply)" :token-id="tokenId" :show-extra="false"/>
              </template>
            </Property>
            <Property :id="'initialSupply'">
              <template v-slot:name>Initial Supply</template>
              <template v-slot:value>
                <TokenAmount :amount="parseIntString(tokenInfo?.initial_supply)" :token-id="tokenId" :show-extra="false"/>
              </template>
            </Property>
            <Property :id="'maxSupply'">
              <template v-slot:name>Max Supply</template>
              <template v-slot:value>
                <div v-if="tokenInfo?.supply_type === 'INFINITE'" class="has-text-grey">Infinite</div>
                <TokenAmount v-else :amount="parseIntString(tokenInfo?.max_supply)" :show-extra="false" :token-id="tokenId"/>
              </template>
            </Property>
            <Property :id="'ethereumAddress'">
              <template v-slot:name>Ethereum Compat. Address</template>
              <template v-slot:value>
                <HexaValue v-if="ethereumAddress" :byte-string="ethereumAddress" :show-none="true"/>
              </template>
            </Property>
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

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeMount, ref, watch} from 'vue';
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
import TokenAmount from "@/components/values/TokenAmount.vue";
import Footer from "@/components/Footer.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import {EntityID} from "@/utils/EntityID";
import Property from "@/components/Property.vue";

export default defineComponent({

  name: 'TokenDetails',

  components: {
    Property,
    HexaValue,
    Footer,
    BlobValue,
    DashboardCard,
    TimestampValue,
    TokenBalanceTable,
    TokenNftTable,
    TokenAmount,
    KeyValue
  },

  props: {
    tokenId: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    let tokenInfo = ref<TokenInfo | null>(null)

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

    const ethereumAddress = computed(() => {
      let result: string|undefined
      if (props.tokenId) {
        const entityID = EntityID.parse(props.tokenId, true)
        result = entityID?.toAddress()
      } else {
        result = undefined
      }
      return result
    })

    const normalizedTokenId = computed(() => {
      return props.tokenId ? EntityID.normalize(props.tokenId) : props.tokenId
    })

    return {
      isSmallScreen,
      isTouchDevice,
      tokenInfo,
      normalizedTokenId,
      showTokenDetails,
      formatSeconds,
      parseIntString,
      ethereumAddress
    }
  },
});

function parseIntString(s: string|undefined): number|undefined {
  const result = Number(s)
  return isNaN(result) ? undefined : result
}


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
