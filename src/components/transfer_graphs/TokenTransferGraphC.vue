// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <div
    v-if="tokenTransferLayout.length >= 1"
    class="graph-container"
  >
    <template
      v-for="s in tokenTransferLayout.length"
      :key="s"
    >
      <template
        v-for="i in tokenTransferLayout[s-1].rowCount"
        :key="i"
      >
        <!-- #0 : account id -->
        <div>
          <template v-if="i <= tokenTransferLayout[s-1].sources.length">
            <AccountLink
              :account-id="tokenTransferLayout[s-1].sources[i-1].account"
              :no-anchor="true"
              null-label="MINT"
              data-cy="sourceAccount"
            />
          </template>
        </div>

        <!-- #1 : arrow -->
        <div style="position: relative">
          <ArrowSegment
            :source-count="tokenTransferLayout[s-1].sources.length"
            :compact="true"
            :row-index="i-1"
          />
        </div>

        <!-- #2 : token amount -->
        <div class="justify-end">
          <TokenAmount
            v-if="i === 1"
            :amount="BigInt(tokenTransferLayout[s-1].netAmount)"
            :token-id="tokenTransferLayout[s-1].tokenId"
            :show-extra="true"
          />
        </div>

        <!-- #3 : arrow -->
        <div style="position: relative">
          <ArrowSegment
            :dest-count="tokenTransferLayout[s-1].destinations.length"
            :compact="true"
            :row-index="i-1"
          />
        </div>

        <!-- #4 : account id -->
        <div>
          <template v-if="i <= tokenTransferLayout[s-1].destinations.length">
            <AccountLink
              :account-id="tokenTransferLayout[s-1].destinations[i-1].account"
              :no-anchor="true"
              null-label="BURN"
              data-cy="destinationAccount"
            />
          </template>
        </div>
      </template>
    </template>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType, ref, watch} from "vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import ArrowSegment from "@/components/transfer_graphs/ArrowSegment.vue";
import {TokenTransferLayout} from "@/components/transfer_graphs/layout/TokenTransferLayout";
import {Transaction} from "@/schemas/MirrorNodeSchemas";

export default defineComponent({
  name: "TokenTransferGraphC",
  components: {AccountLink, TokenAmount, ArrowSegment},
  props: {
    transaction: Object as PropType<Transaction>
  },
  setup(props) {

    const tokenTransferLayout = ref(TokenTransferLayout.make(props.transaction))

    watch(() => props.transaction, () => {
      tokenTransferLayout.value = TokenTransferLayout.make(props.transaction)
    })

    return {
      tokenTransferLayout,
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
  column-gap: 1em
}

div.justify-end {
  justify-self: end;
}

</style>
