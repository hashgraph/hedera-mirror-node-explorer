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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span v-if="tokenInfo" class="h-is-primary-title">
          <span v-if="tokenInfo.type === 'NON_FUNGIBLE_UNIQUE'">Non Fungible</span>
          <span v-else>Fungible</span>
        </span>
        <span class="h-is-primary-title"> Token </span>
        <span class="h-is-secondary-text mr-2">{{ normalizedTokenId }}</span>
      </template>
      <template v-slot:table>

        <NotificationBanner v-if="notification" :message="notification"/>

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
                <DurationValue v-bind:string-value="tokenInfo?.auto_renew_period?.toString()"/>
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
              <template v-slot:value v-if="validEntityId">
                <TokenAmount :amount="parseIntString(tokenInfo?.total_supply)" :token-id="tokenId" :show-extra="false"/>
              </template>
            </Property>
            <Property :id="'initialSupply'">
              <template v-slot:name>Initial Supply</template>
              <template v-slot:value v-if="validEntityId">
                <TokenAmount :amount="parseIntString(tokenInfo?.initial_supply)" :token-id="tokenId" :show-extra="false"/>
              </template>
            </Property>
            <Property :id="'maxSupply'">
              <template v-slot:name>Max Supply</template>
              <template v-slot:value v-if="validEntityId">
                <div v-if="tokenInfo?.supply_type === 'INFINITE'" class="has-text-grey">Infinite</div>
                <TokenAmount v-else :amount="parseIntString(tokenInfo?.max_supply)" :show-extra="false" :token-id="tokenId"/>
              </template>
            </Property>
            <Property :id="'ethereumAddress'">
              <template v-slot:name>ERC20 Address</template>
              <template v-slot:value>
                <EthAddress v-if="ethereumAddress"
                            :address="ethereumAddress"
                            :symbol="tokenSymbol"
                            :decimals="tokenInfo?.decimals"
                            :show-import="true"
                            :show-none="true"/>
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
import DurationValue from "@/components/values/DurationValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import Footer from "@/components/Footer.vue";
import EthAddress from "@/components/values/EthAddress.vue";
import {EntityID} from "@/utils/EntityID";
import Property from "@/components/Property.vue";
import {makeEthAddressForToken, makeTokenSymbol} from "@/schemas/HederaUtils";
import NotificationBanner from "@/components/NotificationBanner.vue";

export default defineComponent({

  name: 'TokenDetails',

  components: {
    NotificationBanner,
    Property,
    EthAddress,
    Footer,
    BlobValue,
    DashboardCard,
    TimestampValue,
    DurationValue,
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

    const got404 = ref(false)
    const validEntityId = computed(() => {
      return props.tokenId ? EntityID.parse(props.tokenId, true) != null : false
    })
    const normalizedTokenId = computed(() => {
      return props.tokenId ? EntityID.normalize(props.tokenId) : props.tokenId
    })

    const notification = computed(() => {
      let result
      if (!validEntityId.value) {
        result = "Invalid token ID: " + props.tokenId
      } else if (got404.value) {
        result = "Token with ID " + props.tokenId + " was not found"
      } else {
        result = null
      }
      return result
    })

    onBeforeMount(() => {
      fetchTokenInfo();
    })

    watch(() => props.tokenId, () => {
      fetchTokenInfo()
    });

    const fetchTokenInfo = () => {
      tokenInfo.value = null
      got404.value = false
      if (validEntityId.value) {
        axios
            .get("api/v1/tokens/" + props.tokenId)
            .then(response => {
              tokenInfo.value = response.data;
            })
            .catch(reason => {
              if (axios.isAxiosError(reason) && reason?.request?.status === 404) {
                got404.value = true
              }
            })
      }
    }

    const showTokenDetails = (tokenId: string) => {
      router.push({name: 'TokenDetails', params: {tokenId: tokenId}})
    }

    const ethereumAddress = computed(() => {
      return tokenInfo.value !== null ? makeEthAddressForToken(tokenInfo.value) : null
    })

    const tokenSymbol = computed( () => makeTokenSymbol(tokenInfo.value, 11))

    return {
      isSmallScreen,
      isTouchDevice,
      tokenInfo,
      validEntityId,
      normalizedTokenId,
      notification,
      showTokenDetails,
      parseIntString,
      ethereumAddress,
      tokenSymbol
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
