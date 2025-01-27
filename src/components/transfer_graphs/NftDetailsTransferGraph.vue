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
  <div>
    <div v-if="!compact" class="h-sub-section">
      NFT Transfers
    </div>

    <div class="graph-container" :class="{'graph-container-6': !compact && descriptionVisible}">

      <template v-if="!compact">

        <div class="transfer-header">ACCOUNT</div>
        <div/>
        <div class="transfer-header">NFT</div>
        <div/>
        <div class="transfer-header">ACCOUNT</div>
        <div v-if="!compact && descriptionVisible"/>
      </template>

      <div class="transfer-account">
        <AccountLink
            :account-id="nftTransferLayout.sender_account_id"
            :no-anchor="compact"
            null-label="MINT"
            data-cy="sourceAccount"
        />
      </div>

      <div style="position: relative">
        <ArrowSegment :compact="compact"/>
      </div>

      <div class="transfer-token">
        <TokenLink
            :token-id="nftTransferLayout.token_id ?? undefined"
            :show-extra="true"
            :no-anchor="compact"
            data-cy="nft"
        />
        <div v-if="!compact" class="transfer-serial">
            <span v-for="sn in nftTransferLayout.serial_numbers" :key="sn">
              #{{ sn }}
            </span>
        </div>
      </div>

      <div style="position: relative">
        <ArrowSegment :compact="compact"/>
      </div>

      <div class="transfer-account">
        <AccountLink
            :account-id="nftTransferLayout.receiver_account_id"
            :no-anchor="compact"
            null-label="BURN"
            data-cy="destinationAccount"
        />
      </div>

      <div v-if="!compact && descriptionVisible" class="description">
        {{ nftTransferLayout.description }}
      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">
import {inject, PropType, ref, watch} from "vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TokenLink from "@/components/values/link/TokenLink.vue";
import ArrowSegment from "@/components/transfer_graphs/ArrowSegment.vue";
import {NFTTransferLayout} from "@/components/transfer_graphs/layout/NFTTransferLayout";
import {NftTransactionTransfer} from "@/schemas/MirrorNodeSchemas";
import {useRoute} from "vue-router";

const props = defineProps({
  transaction: Object as PropType<NftTransactionTransfer>,
  compact: {
    type: Boolean,
    default: false,
  },
})

const route = useRoute();
const tokenId = route.params.tokenId;
const serialNumber = route.params.serialNumber;

const nftTransferLayout = ref(
    new NFTTransferLayout({
      receiver_account_id: props.transaction?.receiver_account_id,
      sender_account_id: props.transaction?.sender_account_id,
      token_id: tokenId as string,
      serial_number: Number(serialNumber),
      is_approval: props.transaction?.is_approval as boolean,
    }),
);

watch(
    () => props.transaction,
    () => {
      nftTransferLayout.value = new NFTTransferLayout({
        receiver_account_id: props.transaction?.receiver_account_id,
        sender_account_id: props.transaction?.sender_account_id,
        token_id: tokenId as string,
        serial_number: Number(serialNumber),
        is_approval: props.transaction?.is_approval as boolean,
      });
    },
);

const descriptionVisible = inject("isSmallScreen", true);

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.graph-container {
  column-gap: 1em;
  display: inline-grid;
  font-family: Inter, sans-serif;
  font-size: 14px;
  grid-template-columns: repeat(5, auto);
  line-height: 1.4rem;
  padding-left: 16px;
  padding-top: 8px;
}

.graph-container-6 {
  grid-template-columns: repeat(6, auto);
}

div.transfer-header {
  color: var(--text-secondary);
  font-weight: 500;
  font-size: 12px;
  font-family: Inter, sans-serif;
}

div.transfer-account {
  color: var(--text-primary);
  font-weight: 700;
}

div.transfer-token {
  color: var(--text-primary);
  font-weight: 400;
}

div.transfer-serial {
  color: var(--text-secondary);
  max-width: 200px;
}

div.description {
  color: var(--text-secondary);
}

</style>
