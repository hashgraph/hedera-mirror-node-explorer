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
            <Property id="adminKey">
              <template v-slot:name>Admin Key</template>
              <template v-slot:value>
                <KeyValue :key-bytes="tokenInfo?.admin_key?.key" :key-type="tokenInfo?.admin_key?._type" :show-none="true"/>
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
      </template>

      <template v-slot:rightContent>
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
        <div v-if="tokenInfo.type === 'NON_FUNGIBLE_UNIQUE'" class="h-is-secondary-title mb-2">NFT Holders</div>
        <div v-else class="h-is-secondary-title mb-2">Balances</div>
      </template>

      <template v-slot:control>
        <PlayPauseButton v-if="isNft" :controller="nftHolderTableController"/>
      </template>

      <template v-slot:content>
        <NftHolderTable v-if="isNft" :controller="nftHolderTableController"/>
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

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import router from "@/router";
import KeyValue from "@/components/values/KeyValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
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
import {TokenBalanceCache} from "@/components/token/TokenBalanceCache";
import {TokenInfoLoader} from "@/components/token/TokenInfoLoader";
import NftHolderTable from "@/components/token/NftHolderTable.vue";
import PlayPauseButton from "@/utils/table/PlayPauseButton.vue";
import {NftHolderTableController} from "@/components/token/NftHolderTableController";

export default defineComponent({

  name: 'TokenDetails',

  components: {
    PlayPauseButton,
    NftHolderTable,
    NotificationBanner,
    Property,
    EthAddress,
    Footer,
    BlobValue,
    DashboardCard,
    TimestampValue,
    DurationValue,
    TokenBalanceTable,
    TokenAmount,
    KeyValue
  },

  props: {
    tokenId: {
      type: String,
      required: true
    },
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
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
    const perPage = computed(() => isMediumScreen ? 10 : 5)

    const nftHolderTableController = new NftHolderTableController(ref(props.tokenId), perPage)
    const setupNftHolderTable = () => {
      if (tokenInfoLoader.isNft.value) {
        nftHolderTableController.tokenId.value = props.tokenId
        nftHolderTableController.mounted.value = true
      }
      else {
        nftHolderTableController.mounted.value = false
      }
    }

    watch([() => props.tokenId, tokenInfoLoader.isNft], () => {
      setupNftHolderTable()
    })
    onMounted(() => {
      setupNftHolderTable()
    })
    onBeforeUnmount(() => {
      nftHolderTableController.mounted.value = false
    })

    return {
      isSmallScreen,
      isTouchDevice,
      tokenInfo: tokenInfoLoader.entity,
      isNft: tokenInfoLoader.isNft,
      isFungible: tokenInfoLoader.isFungible,
      validEntityId,
      normalizedTokenId,
      notification,
      showTokenDetails,
      parseIntString,
      ethereumAddress: tokenInfoLoader.ethereumAddress,
      tokenSymbol: tokenInfoLoader.tokenSymbol,
      tokenBalanceCache,
      nftHolderTableController,
      tokenBalances: tokenBalanceCache.balances,
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
