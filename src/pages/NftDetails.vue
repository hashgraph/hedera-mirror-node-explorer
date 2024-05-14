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
    <DashboardCard>
      <template #title>
        <span class="h-is-primary-title mr-3">Serial Number {{ serialNumber }}</span>
        <div
            class="is-inline-block h-is-tertiary-text h-is-extra-text should-wrap"
            style="word-break: break-all"
        >
          {{ symbol }}
        </div>
      </template>

      <template #content>
        <NotificationBanner
            v-if="notification"
            :message="notification"
        />
      </template>

      <template #leftContent>
        <Property id="tokenId">
          <template #name>Token ID</template>
          <template #value>
            <TokenLink :token-id="tokenId" :show-extra="true"/>
          </template>
        </Property>
        <Property id="accountId">
          <template #name>Account ID</template>
          <template #value>
            <AccountLink
                :account-id="nftInfo?.account_id"
                :show-none="true"
            />
          </template>
        </Property>
        <Property id="createdTimestamp">
          <template #name>Created Timestamp</template>
          <template #value>
            <TimestampValue
                :show-none="true"
                :timestamp="nftInfo?.created_timestamp"
            />
          </template>
        </Property>
        <Property id="modifiedTimeStamp">
          <template #name>Modified Timestamp</template>
          <template #value>
            <TimestampValue
                :timestamp="nftInfo?.modified_timestamp"
                :show-none="true"
            />
          </template>
        </Property>
        <Property id="createTransaction">
          <template v-slot:name>Mint Transaction</template>
          <template v-slot:value>
            <TransactionLink :transactionLoc="nftInfo?.created_timestamp ?? undefined"/>
          </template>
        </Property>
        <Property id="metadata">
          <template #name>Metadata</template>
          <template #value>
            <BlobValue
                :base64="true"
                :blob-value="nftInfo?.metadata"
                :show-none="true"
            />
          </template>
        </Property>
        <Property id="spenderId">
          <template #name>Spender ID</template>
          <template #value>
            <AccountLink
                :account-id="nftInfo?.spender_id"
                :show-none="true"
            />
          </template>
        </Property>
        <Property id="delegatingSpender">
          <template #name>Delegating Spender</template>
          <template #value>
            <AccountLink
                :account-id="nftInfo?.delegating_spender"
                :show-none="true"
            />
          </template>
        </Property>
      </template>
    </DashboardCard>

    <DashboardCard v-if="nftInfo">
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
import ContractResultsSection from "@/components/contracts/ContractResultsSection.vue"
import NftTransactionTable from "@/components/transaction/NftTransactionTable.vue"
import {NftTransactionTableController} from "@/components/transaction/NftTransactionTableController"
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue"
import {makeTokenSymbol} from "@/schemas/HederaUtils";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import TokenLink from "@/components/values/link/TokenLink.vue";
import TransactionLink from "@/components/values/TransactionLink.vue";
import MirrorLink from "@/components/MirrorLink.vue";

export default defineComponent({
  name: "NftDetails",

  components: {
    TransactionLink,
    MirrorLink,
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

    const symbol = computed(() => makeTokenSymbol(tokenLookup.entity.value, 256))

    const serialNumber = ref(props.serialNumber)
    const nftLookup = NftBySerialCache.instance.makeNftLookup(
        normalizedTokenId,
        serialNumber,
    )
    onMounted(() => nftLookup.mount())
    onBeforeUnmount(() => nftLookup.unmount())

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

    //
    // TokenBalanceTableController
    //

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
      symbol
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

<style scoped>
.headline-grid {
  display: grid;
  grid-template-columns: 2fr 10fr;
  grid-column-gap: 0.5rem;
}
</style>
