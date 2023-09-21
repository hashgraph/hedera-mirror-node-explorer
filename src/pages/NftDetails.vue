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
  <section
    :class="{ 'h-mobile-background': isTouchDevice || !isSmallScreen }"
    class="section"
  >
    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title mr-1"> Serial Number </span>
        <div
          class="is-inline-block h-is-tertiary-text h-is-extra-text should-wrap"
          style="word-break: break-all"
        >
          {{ serialNumber }}
        </div>
        <div
          id="entityId"
          class="headline-grid h-is-tertiary-text mt-3 is-align-items-baseline"
        >
          <div class="h-is-property-text has-text-weight-light">
            Token ID:
          </div>
          <div>
            <Copyable :content-to-copy="normalizedTokenId ?? ''">
              <template v-slot:content>
                <span>{{ normalizedTokenId ?? "" }}</span>
              </template>
            </Copyable>
          </div>
        </div>
      </template>

      <template v-slot:content>
        <NotificationBanner
          v-if="notification"
          :message="notification"
        />
      </template>

      <template v-slot:leftContent>
        <Property id="accountId">
          <template v-slot:name>Account ID</template>
          <template v-slot:value>
            <AccountLink
              :account-id="tokenInfo?.account_id"
              :show-none="true"
            />
          </template>
        </Property>
        <Property id="createdTimestamp">
          <template v-slot:name>Created Timestamp</template>
          <template v-slot:value>
            <TimestampValue
              :show-none="true"
              :timestamp="tokenInfo?.created_timestamp"
            />
          </template>
        </Property>
        <Property id="delegatingSpender">
          <template v-slot:name>Delegating Spender</template>
          <template v-slot:value>
            <AccountLink
              :account-id="tokenInfo?.delegating_spender"
              :show-none="true"
            />
          </template>
        </Property>
        <Property id="metadata">
          <template v-slot:name>Metadata</template>
          <template v-slot:value>
            <BlobValue
              :base64="true"
              :blob-value="tokenInfo?.metadata"
              :show-none="true"
            />
          </template>
        </Property>
        <Property id="modifiedTimeStamp">
          <template v-slot:name>Modified Timestamp</template>
          <template v-slot:value>
            <TimestampValue
              :timestamp="tokenInfo?.modified_timestamp"
              :show-none="true"
            />
          </template>
        </Property>
        <Property id="spenderId">
          <template v-slot:name>Spender ID</template>
          <template v-slot:value>
            <AccountLink
              :account-id="tokenInfo?.spender_id"
              :show-none="true"
            />
          </template>
        </Property>
      </template>
    </DashboardCard>

    <DashboardCard v-if="tokenInfo">
      <template v-slot:title>
        <p id="recentTransactions" class="h-is-secondary-title">
          Recent Transactions
        </p>
      </template>
      <template v-slot:control>
        <div class="is-flex is-align-items-flex-end">
          <PlayPauseButton
            v-bind:controller="transactionTableController"
          />
          <TransactionFilterSelect
            v-bind:controller="transactionTableController"
          />
        </div>
      </template>
      <template v-slot:content>
        <div id="recentTransactionsTable">
          <NftTransactionTable
            v-bind:controller="transactionTableController"
            v-bind:narrowed="true"
          />
        </div>
      </template>
    </DashboardCard>

    <ContractResultsSection :contract-id="normalizedTokenId ?? undefined"/>
  </section>

  <Footer/>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import {
    computed,
    defineComponent,
    inject,
    onBeforeUnmount,
    onMounted,
    ref,
    watch,
} from "vue"
import router, {routeManager} from "@/router"
import TimestampValue from "@/components/values/TimestampValue.vue"
import DashboardCard from "@/components/DashboardCard.vue"
import BlobValue from "@/components/values/BlobValue.vue"
import Footer from "@/components/Footer.vue"
import {EntityID} from "@/utils/EntityID"
import Property from "@/components/Property.vue"
import NotificationBanner from "@/components/NotificationBanner.vue"
import PlayPauseButton from "@/components/PlayPauseButton.vue"
import AccountLink from "@/components/values/AccountLink.vue"
import {NftBySerialCache} from "@/utils/cache/NftBySerialCache"
import ContractResultsSection from "@/components/contracts/ContractResultsSection.vue"
import Copyable from "@/components/Copyable.vue"
import NftTransactionTable from "@/components/transaction/NftTransactionTable.vue"
import {NftTransactionTableController} from "@/components/transaction/NftTransactionTableController"
import TransactionFilterSelect from "@/components/transaction/TransactionFilterSelect.vue"

export default defineComponent({
    name: "NftDetails",

    components: {
        Copyable,
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

        const serialNumber = ref(props.serialNumber)
        const tokenLookup = NftBySerialCache.instance.makeLookup(
            normalizedTokenId,
            serialNumber,
        )
        onMounted(() => tokenLookup.mount())
        onBeforeUnmount(() => tokenLookup.unmount())

        const notification = computed(() => {
            let result
            if (!validEntityId.value) {
                result = "Invalid token ID: " + props.tokenId
            } else if (tokenLookup.entity.value == null) {
                if (tokenLookup.isLoaded()) {
                    result =
                        "Token with ID " + props.tokenId + " was not found"
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
            tokenInfo: tokenLookup.entity,
            validEntityId,
            normalizedTokenId,
            notification,
            showTokenDetails,
            parseBigIntString,
            transactionTableController,
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
