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

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification"/>
      </template>

      <template v-slot:leftContent>
            <Property id="name">
              <template v-slot:name>Name</template>
              <template v-slot:value>
                <BlobValue v-bind:blob-value="tokenInfo?.name" v-bind:show-none="true" class="should-wrap"/>
              </template>
            </Property>
            <Property id="symbol">
              <template v-slot:name>Symbol</template>
              <template v-slot:value>
                <BlobValue v-bind:blob-value="tokenInfo?.symbol" v-bind:show-none="true" class="should-wrap"/>
              </template>
            </Property>
            <Property id="memo">
              <template v-slot:name>Memo</template>
              <template v-slot:value>
                <BlobValue :blob-value="tokenInfo?.memo" :show-none="true" :base64="true" class="should-wrap"/>
              </template>
            </Property>
            <Property id="expiresAt">
              <template v-slot:name>Expires at</template>
              <template v-slot:value>
                <TimestampValue :timestamp="tokenInfo?.expiry_timestamp" :nano="true" :show-none="true"/>
              </template>
            </Property>
            <Property id="autoRenewPeriod">
              <template v-slot:name>Auto Renew Period</template>
              <template v-slot:value>
                <DurationValue v-bind:string-value="tokenInfo?.auto_renew_period?.toString()"/>
              </template>
            </Property>
            <Property id="autoRenewAccount">
              <template v-slot:name>Auto Renew Account</template>
              <template v-slot:value>
                <AccountLink :account-id="tokenInfo?.auto_renew_account" :show-none="true"/>
              </template>
            </Property>
            <Property id="freezeDefault">
              <template v-slot:name>Freeze Default</template>
              <template v-slot:value>
                <StringValue :string-value="tokenInfo?.freeze_default?.toString()"/>
              </template>
            </Property>
            <Property id="pauseStatus">
              <template v-slot:name>Pause Status</template>
              <template v-slot:value>
                <StringValue :string-value="tokenInfo?.pause_status"
                             :class="{'has-text-grey': tokenInfo?.pause_status === 'NOT_APPLICABLE'}"/>
              </template>
            </Property>

      </template>

      <template v-slot:rightContent>
            <Property id="treasuryAccount">
              <template v-slot:name>Treasury Account</template>
              <template v-slot:value>
                <AccountLink :account-id="tokenInfo?.treasury_account_id"/>
              </template>
            </Property>
            <Property id="createdAt">
              <template v-slot:name>Created at</template>
              <template v-slot:value>
                <TimestampValue :timestamp="tokenInfo?.created_timestamp" :show-none="true"/>
              </template>
            </Property>
            <Property id="modifiedAt">
              <template v-slot:name>Modified at</template>
              <template v-slot:value>
                <TimestampValue :timestamp="tokenInfo?.modified_timestamp" :show-none="true"/>
              </template>
            </Property>
            <Property id="totalSupply">
              <template v-slot:name>Total Supply</template>
              <template v-slot:value v-if="validEntityId">
                <TokenAmount :amount="parseIntString(tokenInfo?.total_supply)" :token-id="tokenId" :show-extra="false"/>
              </template>
            </Property>
            <Property id="initialSupply">
              <template v-slot:name>Initial Supply</template>
              <template v-slot:value v-if="validEntityId">
                <TokenAmount :amount="parseIntString(tokenInfo?.initial_supply)" :token-id="tokenId" :show-extra="false"/>
              </template>
            </Property>
            <Property id="maxSupply">
              <template v-slot:name>Max Supply</template>
              <template v-slot:value v-if="validEntityId">
                <div v-if="tokenInfo?.supply_type === 'INFINITE'" class="has-text-grey">Infinite</div>
                <TokenAmount v-else :amount="parseIntString(tokenInfo?.max_supply)" :show-extra="false" :token-id="tokenId"/>
              </template>
            </Property>
            <Property id="ethereumAddress">
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
      </template>

    </DashboardCard>

    <DashboardCard v-if="tokenInfo">

      <template v-slot:title>
        <div class="h-is-secondary-title mb-2">Token Keys</div>
      </template>

      <template v-slot:leftContent>
        <Property id="adminKey">
          <template v-slot:name>Admin Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.admin_key?.key"
                      :key-type="tokenInfo?.admin_key?._type"
                      :show-none="true"
                      :none-label="'Token is immutable'"/>
          </template>
        </Property>
        <Property id="kycKey">
          <template v-slot:name>KYC Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.kyc_key?.key"
                      :key-type="tokenInfo?.kyc_key?._type"
                      :show-none="true"
                      :none-label="'KYC is not required'"/>
          </template>
        </Property>
        <Property id="freezeKey">
          <template v-slot:name>Freeze Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.freeze_key?.key"
                      :key-type="tokenInfo?.freeze_key?._type"
                      :show-none="true"
                      :none-label="'Token cannot be frozen'"/>
          </template>
        </Property>
        <Property id="wipeKey">
          <template v-slot:name>Wipe Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.wipe_key?.key"
                      :key-type="tokenInfo?.wipe_key?._type"
                      :show-none="true"
                      :none-label="'Token cannot be wiped'"/>
          </template>
        </Property>
      </template>

      <template v-slot:rightContent>
        <Property id="supplyKey">
          <template v-slot:name>Supply Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.supply_key?.key"
                      :key-type="tokenInfo?.supply_key?._type"
                      :show-none="true"
                      :none-label="'Token cannot be minted or burnt'"/>
          </template>
        </Property>
        <Property id="feeScheduleKey">
          <template v-slot:name>Fee Schedule Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.fee_schedule_key?.key"
                      :key-type="tokenInfo?.fee_schedule_key?._type"
                      :show-none="true"
                      :none-label="'Custom fee schedule is immutable'"/>
          </template>
        </Property>
        <Property id="pauseKey">
          <template v-slot:name>Pause Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.pause_key?.key"
                      :key-type="tokenInfo?.pause_key?._type"
                      :show-none="true"
                      :none-label="'Token cannot be paused'"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

    <DashboardCard v-if="tokenInfo">

      <template v-slot:title>
        <div v-if="tokenInfo.type === 'NON_FUNGIBLE_UNIQUE'" class="h-is-secondary-title mb-2">NFT Holders</div>
        <div v-else class="h-is-secondary-title mb-2">Balances</div>
      </template>

      <template v-slot:content>
        <TokenNftTable v-if="tokenInfo.type === 'NON_FUNGIBLE_UNIQUE'" v-bind:nb-items="10" v-bind:nfts="nfts"/>
        <TokenBalanceTable v-else v-bind:nb-items="10" v-bind:token-id="tokenId" v-bind:token-balances="tokenBalances"/>
      </template>

    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, watch} from 'vue';
import router from "@/router";
import KeyValue from "@/components/values/KeyValue.vue";
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
import NotificationBanner from "@/components/NotificationBanner.vue";
import {EntityCacheStateV2} from "@/utils/EntityCacheV2";
import {TokenNftCache} from "@/components/token/TokenNftCache";
import {TokenBalanceCache} from "@/components/token/TokenBalanceCache";
import {TokenInfoLoader} from "@/components/token/TokenInfoLoader";
import AccountLink from "@/components/values/AccountLink.vue";
import StringValue from "@/components/values/StringValue.vue";

export default defineComponent({

  name: 'TokenDetails',

  components: {
    StringValue,
    AccountLink,
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

    const validEntityId = computed(() => {
      return props.tokenId ? EntityID.parse(props.tokenId, true) != null : false
    })
    const normalizedTokenId = computed(() => {
      return props.tokenId ? EntityID.normalize(props.tokenId) : null
    })

    const tokenInfoLoader = new TokenInfoLoader(normalizedTokenId)
    onMounted(() => tokenInfoLoader.requestLoad())

    const notification = computed(() => {
      let result
      if (!validEntityId.value) {
        result = "Invalid token ID: " + props.tokenId
      } else if (tokenInfoLoader.got404.value) {
        result = "Token with ID " + props.tokenId + " was not found"
      } else if (tokenInfoLoader.entity.value?.deleted) {
        result = "Token is deleted"
      } else {
        result = null
      }
      return result
    })

    const showTokenDetails = (tokenId: string) => {
      router.push({name: 'TokenDetails', params: {tokenId: tokenId}})
    }

    //
    // tokenBalanceCache
    //

    const tokenBalanceCache = new TokenBalanceCache();
    const setupTokenBalanceCache = () => {
      if (tokenInfoLoader.isFungible.value) {
        tokenBalanceCache.tokenId.value = props.tokenId ?? null
        tokenBalanceCache.state.value = EntityCacheStateV2.Started
      }
      else {
        tokenBalanceCache.state.value = EntityCacheStateV2.Stopped
      }
    }
    watch([() => props.tokenId, tokenInfoLoader.isFungible], () => {
      setupTokenBalanceCache()
    })
    onMounted(() => {
      setupTokenBalanceCache()
    })
    onBeforeUnmount(() => {
      tokenBalanceCache.state.value = EntityCacheStateV2.Stopped
    })

    //
    // tokenNftCache
    //

    const tokenNftCache = new TokenNftCache();
    const isNFT = computed(() => {
      return tokenInfoLoader.entity.value != null && tokenInfoLoader.entity.value.type == "NON_FUNGIBLE_UNIQUE"
    })
    const setupTransactionCache = () => {
      if (isNFT.value) {
        tokenNftCache.tokenId.value = props.tokenId ?? null
        tokenNftCache.state.value = EntityCacheStateV2.Started
      }
      else {
        tokenNftCache.state.value = EntityCacheStateV2.Stopped
      }
    }

    watch([() => props.tokenId, isNFT], () => {
      setupTransactionCache()
    })
    onMounted(() => {
      setupTransactionCache()
    })
    onBeforeUnmount(() => {
      tokenNftCache.state.value = EntityCacheStateV2.Stopped
    })

    return {
      isSmallScreen,
      isTouchDevice,
      tokenInfo: tokenInfoLoader.entity,
      validEntityId,
      normalizedTokenId,
      notification,
      showTokenDetails,
      parseIntString,
      ethereumAddress: tokenInfoLoader.ethereumAddress,
      tokenSymbol: tokenInfoLoader.tokenSymbol,
      nfts: tokenNftCache.nfts,
      tokenBalances: tokenBalanceCache.balances,
      tokenNftCache, // For test purpose
      tokenBalanceCache, // For test purpose
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
