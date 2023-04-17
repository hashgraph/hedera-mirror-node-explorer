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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span v-if="tokenInfo" class="h-is-primary-title">
          <span v-if="tokenInfo.type === 'NON_FUNGIBLE_UNIQUE'">Non Fungible</span>
          <span v-else>Fungible</span>
        </span>
        <span class="h-is-primary-title mr-1"> Token </span>
        <div class="is-inline-block h-is-tertiary-text h-is-extra-text should-wrap" style="word-break: break-all">
          {{ displaySymbol }}
        </div>
        <div id="entityId" class="headline-grid h-is-tertiary-text mt-3 is-align-items-baseline">
          <div class="h-is-property-text has-text-weight-light">Token ID:</div>
          <div>
            <span>{{ normalizedTokenId ?? "" }}</span>
            <span v-if="tokenChecksum" class="has-text-grey">-{{ tokenChecksum }}</span>
          </div>
        </div>

        <div v-if="ethereumAddress" id="evmAddress"
             class="headline-grid is-align-items-baseline h-is-property-text mt-2" style="word-break: keep-all">
          <div class="has-text-weight-light">EVM Address:</div>
          <div class="is-flex is-align-items-baseline">
            <EVMAddress class="mr-3" :show-id="false" :has-custom-font="true" :address="ethereumAddress"/>
            <MetaMaskImport v-if="isSmallScreen"
                            :address="ethereumAddress"
                            :decimals="tokenInfo?.decimals"
                            :show-import="true"
                            :symbol="tokenSymbol"/>
          </div>
        </div>
        <div v-if="ethereumAddress && !isSmallScreen" class="mt-2 h-is-property-text">
          <MetaMaskImport :address="ethereumAddress"
                          :decimals="tokenInfo?.decimals"
                          :show-import="true"
                          :symbol="tokenSymbol"/>
        </div>

      </template>

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification"/>
      </template>

      <template v-slot:leftContent>
        <Property id="name">
          <template v-slot:name>Name</template>
          <template v-slot:value>
            <BlobValue v-bind:blob-value="tokenInfo?.name" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="symbol">
          <template v-slot:name>Symbol</template>
          <template v-slot:value>
            <BlobValue v-bind:blob-value="tokenInfo?.symbol" v-bind:show-none="true"/>
          </template>
        </Property>
        <Property id="memo">
          <template v-slot:name>Memo</template>
          <template v-slot:value>
            <BlobValue :base64="true" :blob-value="tokenInfo?.memo" :show-none="true"/>
          </template>
        </Property>
        <Property id="expiresAt">
          <template v-slot:name>Expires at</template>
          <template v-slot:value>
            <TimestampValue :nano="true" :show-none="true" :timestamp="tokenInfo?.expiry_timestamp?.toString()"/>
          </template>
        </Property>
        <Property id="autoRenewPeriod">
          <template v-slot:name>Auto Renew Period</template>
          <template v-slot:value>
            <DurationValue v-if="false" v-bind:string-value="tokenInfo?.auto_renew_period?.toString()"/>
            <span v-else class="has-text-grey">Not yet enabled</span>
          </template>
        </Property>
        <Property id="autoRenewAccount">
          <template v-slot:name>Auto Renew Account</template>
          <template v-slot:value>
            <AccountLink v-if="false" :account-id="tokenInfo?.auto_renew_account" :show-none="true"/>
            <span v-else class="has-text-grey">Not yet enabled</span>
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
            <StringValue v-if="tokenInfo?.pause_status === 'NOT_APPLICABLE'"
                         class="has-text-grey" string-value="Not applicable"/>
            <StringValue v-else :string-value="tokenInfo?.pause_status"/>
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
            <TimestampValue :show-none="true" :timestamp="tokenInfo?.created_timestamp"/>
          </template>
        </Property>
        <Property id="modifiedAt">
          <template v-slot:name>Modified at</template>
          <template v-slot:value>
            <TimestampValue :show-none="true" :timestamp="tokenInfo?.modified_timestamp"/>
          </template>
        </Property>
        <Property id="totalSupply">
          <template v-slot:name>Total Supply</template>
          <template v-if="validEntityId" v-slot:value>
            <TokenAmount :amount="parseIntString(tokenInfo?.total_supply)" :show-extra="false"
                         :token-id="normalizedTokenId"/>
          </template>
        </Property>
        <Property id="initialSupply">
          <template v-slot:name>Initial Supply</template>
          <template v-if="validEntityId" v-slot:value>
            <TokenAmount :amount="parseIntString(tokenInfo?.initial_supply)" :show-extra="false"
                         :token-id="normalizedTokenId"/>
          </template>
        </Property>
        <Property id="maxSupply">
          <template v-slot:name>Max Supply</template>
          <template v-if="validEntityId" v-slot:value>
            <div v-if="tokenInfo?.supply_type === 'INFINITE'" class="has-text-grey">Infinite</div>
            <TokenAmount v-else :amount="parseIntString(tokenInfo?.max_supply)" :show-extra="false"
                         :token-id="normalizedTokenId"/>
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
                      none-extra="Token is immutable"/>
          </template>
        </Property>
        <Property id="kycKey">
          <template v-slot:name>KYC Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.kyc_key?.key"
                      :key-type="tokenInfo?.kyc_key?._type"
                      :show-none="true"
                      none-extra="KYC is not required"/>
          </template>
        </Property>
        <Property id="freezeKey">
          <template v-slot:name>Freeze Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.freeze_key?.key"
                      :key-type="tokenInfo?.freeze_key?._type"
                      :show-none="true"
                      none-extra="Token cannot be frozen"/>
          </template>
        </Property>
        <Property id="wipeKey">
          <template v-slot:name>Wipe Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.wipe_key?.key"
                      :key-type="tokenInfo?.wipe_key?._type"
                      :show-none="true"
                      none-extra="Token cannot be wiped"/>
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
                      none-extra="Token cannot be minted or burnt"/>
          </template>
        </Property>
        <Property id="feeScheduleKey">
          <template v-slot:name>Fee Schedule Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.fee_schedule_key?.key"
                      :key-type="tokenInfo?.fee_schedule_key?._type"
                      :show-none="true"
                      none-extra="Custom fee schedule is immutable"/>
          </template>
        </Property>
        <Property id="pauseKey">
          <template v-slot:name>Pause Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="tokenInfo?.pause_key?.key"
                      :key-type="tokenInfo?.pause_key?._type"
                      :show-none="true"
                      none-extra="Token cannot be paused"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

    <TokenCustomFees v-if="hasCustomFees" :analyzer="analyzer"/>

    <DashboardCard v-if="tokenInfo">

      <template v-slot:title>
        <div v-if="tokenInfo.type === 'NON_FUNGIBLE_UNIQUE'" class="h-is-secondary-title mb-2">NFT Holders</div>
        <div v-else class="h-is-secondary-title mb-2">Balances</div>
      </template>

      <template v-slot:control>
        <PlayPauseButton v-if="isNft" :controller="nftHolderTableController"/>
        <PlayPauseButton v-else :controller="tokenBalanceTableController"/>
      </template>

      <template v-slot:content>
        <div v-if="isNft" id="nft-holder-table">
          <NftHolderTable :controller="nftHolderTableController"/>
        </div>
        <div v-else id="token-balance-table">
          <TokenBalanceTable :controller="tokenBalanceTableController"/>
        </div>
      </template>

    </DashboardCard>

    <ContractResultsSection :contract-id="normalizedTokenId"/>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted} from 'vue';
import {useRouter} from "vue-router";
import {routeManager} from "@/router";
import KeyValue from "@/components/values/KeyValue.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import TokenBalanceTable from "@/components/token/TokenBalanceTable.vue";
import DurationValue from "@/components/values/DurationValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import Footer from "@/components/Footer.vue";
import MetaMaskImport from "@/components/token/MetaMaskImport.vue";
import {EntityID} from "@/utils/EntityID";
import Property from "@/components/Property.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import NftHolderTable from "@/components/token/NftHolderTable.vue";
import PlayPauseButton from "@/components/PlayPauseButton.vue";
import {NftHolderTableController} from "@/components/token/NftHolderTableController";
import {TokenBalanceTableController} from "@/components/token/TokenBalanceTableController";
import AccountLink from "@/components/values/AccountLink.vue";
import StringValue from "@/components/values/StringValue.vue";
import TokenCustomFees from "@/components/token/TokenCustomFees.vue";
import EVMAddress from "@/components/values/EVMAddress.vue";
import {makeTokenSymbol} from "@/schemas/HederaUtils";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {TokenInfoAnalyzer} from "@/components/token/TokenInfoAnalyzer";
import ContractResultsSection from "@/components/contracts/ContractResultsSection.vue";

export default defineComponent({

  name: 'TokenDetails',

  components: {
    ContractResultsSection,
    EVMAddress,
    TokenCustomFees,
    PlayPauseButton,
    NftHolderTable,
    StringValue,
    AccountLink,
    NotificationBanner,
    Property,
    MetaMaskImport,
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

    const normalizedTokenId = computed(() => {
      const result = EntityID.parse(props.tokenId) ?? EntityID.fromAddress(props.tokenId)
      return result !== null ? result.toString() : null
    })
    const validEntityId = computed(() => normalizedTokenId.value != null)

    const tokenLookup = TokenInfoCache.instance.makeLookup(normalizedTokenId)
    onMounted(() => tokenLookup.mount())
    onBeforeUnmount(() => tokenLookup.unmount())

    const tokenAnalyzer = new TokenInfoAnalyzer(tokenLookup.entity)

    const displaySymbol = computed(() => makeTokenSymbol(tokenLookup.entity.value, 256))

    const notification = computed(() => {
      let result
      if (!validEntityId.value) {
        result = "Invalid token ID: " + props.tokenId
      } else if (tokenLookup.entity.value == null) {
          if (tokenLookup.isLoaded()) {
              result = "Token with ID " + props.tokenId + " was not found"
          } else {
              result = null
          }
      } else if (tokenLookup.entity.value?.deleted) {
        result = "Token is deleted"
      } else {
        result = null
      }
      return result
    })

    const showTokenDetails = (tokenId: string) => {
      routeManager.routeToToken(tokenId)
    }

    const perPage = computed(() => isMediumScreen ? 10 : 5)

    //
    // TokenBalanceTableController
    //
    const fungibleTokenId = computed(() => tokenAnalyzer.isFungible.value ? normalizedTokenId.value : null)
    const tokenBalanceTableController = new TokenBalanceTableController(useRouter(), fungibleTokenId, perPage);
    onMounted(() => tokenBalanceTableController.mount())
    onBeforeUnmount(() => tokenBalanceTableController.unmount())

    //
    // NftHolderTableController
    //
    const nftTokenId = computed(() => tokenAnalyzer.isNft.value ? normalizedTokenId.value : null)
    const nftHolderTableController = new NftHolderTableController(useRouter(), nftTokenId, perPage)
    onMounted(() => nftHolderTableController.mount())
    onBeforeUnmount(() => nftHolderTableController.unmount())

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      displaySymbol,
      analyzer: tokenAnalyzer,
      tokenInfo: tokenLookup.entity,
      isNft: tokenAnalyzer.isNft,
      isFungible: tokenAnalyzer.isFungible,
      hasCustomFees: tokenAnalyzer.hasCustomFees,
      tokenChecksum: tokenAnalyzer.tokenChecksum,
      validEntityId,
      normalizedTokenId,
      notification,
      showTokenDetails,
      parseIntString,
      ethereumAddress: tokenAnalyzer.ethereumAddress,
      tokenSymbol: tokenAnalyzer.tokenSymbol,
      tokenBalanceTableController,
      nftHolderTableController,
    }
  },
});

function parseIntString(s: string | undefined): number | undefined {
  const result = Number(s)
  return isNaN(result) ? undefined : result
}


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.headline-grid {
  display: grid;
  grid-template-columns: 2fr 10fr;
  grid-column-gap: 0.5rem;
}

</style>
