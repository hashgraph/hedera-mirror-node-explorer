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
  <section
      :class="{ 'h-mobile-background': isTouchDevice || !isSmallScreen }"
      class="section"
  >
    <DashboardCard collapsible-key="nftDetails">
      <template #title>
        <div class="is-flex is-align-items-baseline h-is-tertiary-text">
          <div
              class="is-inline-block h-is-extra-text should-wrap mr-3"
              style="word-break: break-all"
          >
            {{ nftName ?? tokenName }}
          </div>
          <span class="mr-2 has-text-grey">Non Fungible Token</span>
        </div>
      </template>

      <template #content>
        <NotificationBanner
            v-if="notification"
            :message="notification"
        />
      </template>

      <template #mediaContent>
        <NftPreview
            :type="type"
            :url="imageUrl"
            :size="isSmallScreen ? 450 : 300"
            :auto="true"
        />
      </template>
      <template #mediaDescription>
        <Property v-if="description" id="description" custom-nb-col-class="is-one-quarter">
          <template #name>Description</template>
          <template #value>
            <BlobValue :blob-value="description"/>
          </template>
        </Property>
        <Property id="tokenId" custom-nb-col-class="is-one-quarter">
          <template #name>NFT Collection</template>
          <template #value>
            <router-link :to="tokenRoute">
              <span class="h-is-extra-text mr-2">{{ tokenName }}</span>
            </router-link>
            <span>(</span>
            <TokenLink :token-id="tokenId" :show-extra="false"/>
            <span>)</span>
          </template>
        </Property>
        <Property id="serialNumber" custom-nb-col-class="is-one-quarter">
          <template #name>Serial #</template>
          <template #value>
            {{ serialNumber }}
          </template>
        </Property>
        <Property id="accountId" custom-nb-col-class="is-one-quarter">
          <template #name>Owner</template>
          <template #value>
            <AccountLink
                :account-id="nftInfo?.account_id"
            />
          </template>
        </Property>
        <Property v-if="creator" id="creator" custom-nb-col-class="is-one-quarter">
          <template #name>Creator</template>
          <template #value>
            {{ creator }}
          </template>
        </Property>
        <Property id="createdTimestamp" custom-nb-col-class="is-one-quarter">
          <template #name>Created</template>
          <template #value>
            <TimestampValue
                :show-none="true"
                :timestamp="nftInfo?.created_timestamp"
            />
          </template>
        </Property>
        <Property id="modifiedTimeStamp" custom-nb-col-class="is-one-quarter">
          <template #name>Modified</template>
          <template #value>
            <TimestampValue
                :timestamp="nftInfo?.modified_timestamp"
                :show-none="true"
            />
          </template>
        </Property>
        <Property id="spenderId" custom-nb-col-class="is-one-quarter">
          <template #name>Spender</template>
          <template #value>
            <AccountLink
                :account-id="nftInfo?.spender"
                :show-none="true"
            />
          </template>
        </Property>
        <Property id="delegatingSpender" custom-nb-col-class="is-one-quarter">
          <template #name>Delegating Spender</template>
          <template #value>
            <AccountLink
                :account-id="nftInfo?.delegating_spender"
            />
          </template>
        </Property>
        <Property id="createTransaction" custom-nb-col-class="is-one-quarter">>
          <template v-slot:name>Mint Transaction</template>
          <template v-slot:value>
            <TransactionLink :transactionLoc="nftInfo?.created_timestamp ?? undefined"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

    <MetadataSection :metadata-analyzer="metadataAnalyzer"/>

    <DashboardCard v-if="nftInfo" collapsible-key="recentNftTransactions">
      <template #title>
        <p id="recentTransactions" class="h-is-secondary-title">
          Recent Transactions
        </p>
      </template>
      <template #control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButton
              v-bind:controller="transactionTableController"
          />
          <TransactionFilterSelect v-model:selected-filter="transactionType" nft-filter
                                   class="ml-2"
          />
        </div>
      </template>
      <template #content>
        <div id="recentTransactionsTable">
          <NftTransactionTable
              v-bind:controller="transactionTableController"
              v-bind:narrowed="true"
          />
        </div>
      </template>
    </DashboardCard>

    <ContractResultsSection :contract-id="normalizedTokenId ?? undefined"/>

    <MirrorLink :network="network" entityUrl="tokens" :loc="normalizedTokenId + '/nfts/' + serialNumber"/>

  </section>

  <Footer/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref, watch} from "vue"
import router, {routeManager} from "@/router"
import TimestampValue from "@/components/values/TimestampValue.vue"
import DashboardCard from "@/components/DashboardCard.vue"
import BlobValue from "@/components/values/BlobValue.vue"
import Footer from "@/components/Footer.vue"
import {EntityID} from "@/utils/EntityID"
import Property from "@/components/Property.vue"
import NotificationBanner from "@/components/NotificationBanner.vue"
import PlayPauseButton from "@/components/PlayPauseButton.vue"
import AccountLink from "@/components/values/link/AccountLink.vue"
import {NftBySerialCache} from "@/utils/cache/NftBySerialCache"
import ContractResultsSection from "@/components/contract/ContractResultsSection.vue"
import NftTransactionTable from "@/components/transaction/NftTransactionTable.vue"
import {NftTransactionTableController} from "@/components/transaction/NftTransactionTableController"
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue"
import {makeTokenName, makeTokenSymbol} from "@/schemas/HederaUtils";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import TokenLink from "@/components/values/link/TokenLink.vue";
import MetadataSection from "@/components/token/MetadataSection.vue";
import TransactionLink from "@/components/values/TransactionLink.vue";
import MirrorLink from "@/components/MirrorLink.vue";
import {TokenMetadataAnalyzer} from "@/components/token/TokenMetadataAnalyzer";
import NftPreview from "@/components/token/NftPreview.vue";

export default defineComponent({
  name: "NftDetails",

  components: {
    NftPreview,
    TransactionLink,
    MirrorLink,
    MetadataSection,
    TokenLink,
    ContractResultsSection,
    PlayPauseButton,
    AccountLink,
    NotificationBanner,
    Property,
    BlobValue,
    DashboardCard,
    TimestampValue,
    NftTransactionTable,
    TransactionFilterSelect,
    Footer,
  },

  props: {
    tokenId: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: String,
      required: true,
    },
    network: String,
  },

  setup(props) {
    const isSmallScreen = inject("isSmallScreen", true)
    const isMediumScreen = inject("isMediumScreen", true)
    const isTouchDevice = inject("isTouchDevice", false)

    const normalizedTokenId = computed(() => {
      const result =
          EntityID.parse(props.tokenId) ??
          EntityID.fromAddress(props.tokenId)
      return result !== null ? result.toString() : null
    })
    const validEntityId = computed(() => normalizedTokenId.value != null)

    const tokenLookup = TokenInfoCache.instance.makeLookup(normalizedTokenId)
    onMounted(() => tokenLookup.mount())
    onBeforeUnmount(() => tokenLookup.unmount())

    const tokenName = computed(() => makeTokenName(tokenLookup.entity.value, 80))
    const tokenSymbol = computed(() => makeTokenSymbol(tokenLookup.entity.value, 80))

    const serialNumber = ref(props.serialNumber)
    const nftLookup = NftBySerialCache.instance.makeNftLookup(
        normalizedTokenId,
        serialNumber,
    )
    onMounted(() => nftLookup.mount())
    onBeforeUnmount(() => nftLookup.unmount())

    const metadata = computed(() => nftLookup.entity.value?.metadata ?? '')
    const metadataAnalyzer = new TokenMetadataAnalyzer(metadata)
    onMounted(() => metadataAnalyzer.mount())
    onBeforeUnmount(() => metadataAnalyzer.unmount())

    const notification = computed(() => {
      let result
      if (!validEntityId.value) {
        result = "Invalid token ID: " + props.tokenId
      } else if (nftLookup.entity.value == null) {
        if (nftLookup.isLoaded()) {
          result =
              "Token with ID " + props.tokenId + " was not found"
        } else {
          result = null
        }
      } else if (nftLookup.entity.value?.deleted) {
        result = "Token is deleted"
      } else {
        result = null
      }
      return result
    })

    const perPage = computed(() => (isMediumScreen ? 10 : 5))

    const tokenRoute = computed(() => routeManager.makeRouteToToken(props.tokenId))

    const tokenId = ref(props.tokenId)

    //
    // TransactionTableController
    //
    const transactionTableController = new NftTransactionTableController(
        router,
        tokenId,
        serialNumber,
        perPage,
        "p1",
        "k1",
    )

    let mounted = false
    onMounted(() => {
      mounted = true
      if (serialNumber.value !== null) {
        transactionTableController.mount()
      }
    })
    onBeforeUnmount(() => {
      mounted = false
      if (serialNumber.value !== null) {
        transactionTableController.unmount()
      }
    })
    watch(serialNumber, () => {
      if (mounted) {
        if (serialNumber.value !== null) {
          transactionTableController.mount()
        } else {
          transactionTableController.unmount()
        }
      }
    })

    return {
      isSmallScreen,
      isMediumScreen,
      isTouchDevice,
      nftInfo: nftLookup.entity,
      validEntityId,
      normalizedTokenId,
      notification,
      parseBigIntString,
      transactionTableController,
      transactionType: transactionTableController.transactionType,
      tokenSymbol,
      tokenName,
      tokenRoute,
      metadata,
      metadataAnalyzer,
      nftName: metadataAnalyzer.name,
      creator: metadataAnalyzer.creator,
      description: metadataAnalyzer.description,
      type: metadataAnalyzer.type,
      imageUrl: metadataAnalyzer.imageUrl,
    }
  },
})

function parseBigIntString(s: string | undefined): bigint | undefined {
  let result: bigint | undefined
  try {
    result = s ? BigInt(s) : undefined
  } catch {
    result = undefined
  }
  return result
}
</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
