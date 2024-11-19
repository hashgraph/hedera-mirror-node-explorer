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

  <div v-if="nftTransferLayout.length >= 1">
    <div v-if="!compact" class="h-is-tertiary-text mb-2">NFT Transfers</div>

    <div class="graph-container" v-bind:class="{'graph-container-6': !compact && descriptionVisible}">

      <template v-if="!compact">

        <div class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Account</div>
        <div/>
        <div class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Non Fungible Tokens</div>
        <div/>
        <div class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Account</div>
        <div v-if="!compact && descriptionVisible"/>
      </template>

      <template v-for="i in nftTransferLayout.length" v-bind:key="i">

        <!-- #0 : account id -->
        <div>
          <AccountLink
              v-bind:account-id="nftTransferLayout[i-1].sender_account_id"
              v-bind:no-anchor="compact"
              null-label="MINT"
              data-cy="sourceAccount"/>
        </div>

        <!-- #1 : arrow -->
        <div style="position: relative">
          <ArrowSegment v-bind:compact="compact"/>
        </div>

        <!-- #2 : nfts -->
        <div>
          <TokenLink
              v-bind:token-id="nftTransferLayout[i-1].token_id ?? undefined"
              v-bind:show-extra="true"
              v-bind:no-anchor="compact"
              data-cy="nft"/>
          <div class="h-is-text-size-3" style="max-width: 200px">
            <template v-if="!compact">
              <span v-for="sn in nftTransferLayout[i-1].serial_numbers" :key="sn">
                #{{ sn }}
              </span>
            </template>
          </div>
        </div>

        <!-- #3 : arrow -->
        <div style="position: relative">
          <ArrowSegment v-bind:compact="compact"/>
        </div>

        <!-- #4 : account id -->
        <div>
          <AccountLink
              v-bind:account-id="nftTransferLayout[i-1].receiver_account_id"
              v-bind:no-anchor="compact"
              null-label="BURN"
              data-cy="destinationAccount"/>
        </div>

        <!-- #5 : description -->
        <div v-if="!compact && descriptionVisible">
          <span class="h-is-smaller">{{ nftTransferLayout[i-1].description }}</span>
        </div>

      </template>

    </div>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref, watch} from "vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TokenLink from "@/components/values/link/TokenLink.vue";
import ArrowSegment from "@/components/transfer_graphs/ArrowSegment.vue";
import {NFTTransferLayout} from "@/components/transfer_graphs/layout/NFTTransferLayout";
import {TransactionDetail} from "@/schemas/MirrorNodeSchemas";

export default defineComponent({
  name: "NftTransferGraph",
  components: {TokenLink, AccountLink, ArrowSegment},
  props: {
    transaction: Object as PropType<TransactionDetail>,
    compact: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {

    const nftTransferLayout = ref(NFTTransferLayout.make(props.transaction))

    watch(() => props.transaction, () => {
      nftTransferLayout.value = NFTTransferLayout.make(props.transaction)
    })

    const descriptionVisible = inject("isSmallScreen", true)

    return {
      nftTransferLayout,
      descriptionVisible
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.graph-container {
  display: inline-grid;
  grid-template-columns: repeat(5, auto);
  line-height: 1.4rem;
  column-gap: 1em;
}

.graph-container-6 {
  grid-template-columns: repeat(6, auto);
  line-height: 1.4rem;
}

</style>

