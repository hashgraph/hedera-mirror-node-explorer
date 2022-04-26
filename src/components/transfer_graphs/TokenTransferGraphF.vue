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

  <div v-if="tokenTransferLayout.length >= 1" data-cy="tokenTransfers">

    <br/>
    <p class="h-is-tertiary-text mb-4">Token Transfers</p>

    <div class="container">

      <div style="grid-column-end: span 1" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Account</div>
      <div style="grid-column-end: span 2" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Token Amount</div>
      <div/>
      <div style="grid-column-end: span 1" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Account</div>
      <div style="grid-column-end: span 2" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Token Amount</div>
      <div/>

      <template v-for="s in tokenTransferLayout.length" v-bind:key="s">

        <template v-for="i in tokenTransferLayout[s-1].rowCount" v-bind:key="i">

          <!-- #0 : account id -->
          <div>
            <template v-if="i <= tokenTransferLayout[s-1].sources.length">
              <AccountLink v-bind:account-id="tokenTransferLayout[s-1].sources[i-1].account"
                           null-label="MINT"
                           data-cy="sourceAccount"/>
            </template>
          </div>

          <!-- #1 : token amount -->
          <div class="justify-end">
            <TokenAmount v-if="i <= tokenTransferLayout[s-1].sources.length"
                         v-bind:amount="tokenTransferLayout[s-1].sources[i-1].amount"/>
          </div>

          <!-- #2 : token symbol -->
          <div data-cy="tokenExtra" v-bind:class="{ 'mobile': isMobileScreen }">
            <TokenExtra v-if="i <= tokenTransferLayout[s-1].sources.length && !isMobileScreen"
                        v-bind:token-id="tokenTransferLayout[s-1].tokenId"
                        v-bind:use-anchor="true"/>
          </div>

          <!-- #3 : arrow -->
          <div  style="position: relative">
            <ArrowSegment
                v-bind:source-count="tokenTransferLayout[s-1].sources.length"
                v-bind:dest-count="tokenTransferLayout[s-1].destinations.length"
                v-bind:row-index="i-1"/>
          </div>

          <!-- #4 : account id -->
          <div>
            <template v-if="i <= tokenTransferLayout[s-1].destinations.length">
              <AccountLink v-bind:account-id="tokenTransferLayout[s-1].destinations[i-1].account"
                           null-label="BURN"
                           data-cy="destinationAccount"/>
            </template>
          </div>

          <!-- #5 : token amount -->
          <div>
            <TokenAmount v-if="i <= tokenTransferLayout[s-1].destinations.length"
                         v-bind:amount="tokenTransferLayout[s-1].destinations[i-1].amount"/>
          </div>

          <!-- #6 : token symbol -->
          <div data-cy="tokenExtra" v-bind:class="{ 'mobile': isMobileScreen }">
            <TokenExtra v-if="i <= tokenTransferLayout[s-1].destinations.length && !isMobileScreen"
                        v-bind:token-id="tokenTransferLayout[s-1].tokenId"
                        v-bind:use-anchor="true"/>
          </div>

          <!-- #7 : description -->
          <div v-bind:class="{ 'mobile': isMobileScreen }">
            <template v-if="i <= tokenTransferLayout[s-1].descriptions.length && !isMobileScreen">
              <span  class="h-is-smaller">{{ tokenTransferLayout[s-1].descriptions[i-1] }}</span>
            </template>
          </div>


        </template>

      </template>

    </div>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, PropType, ref, watch} from "vue";
import AccountLink from "@/components/values/AccountLink.vue";
import TokenAmount from "@/components/values/TokenAmount.vue";
import ArrowSegment from "@/components/transfer_graphs/ArrowSegment.vue";
import TokenExtra from "@/components/values/TokenExtra.vue";
import {TokenTransferLayout} from "@/components/transfer_graphs/layout/TokenTransferLayout";
import {Transaction} from "@/schemas/HederaSchemas";

export default defineComponent({
  name: "TokenTransferGraphF",
  components: {AccountLink, TokenAmount, ArrowSegment, TokenExtra},
  props: {
    transaction: Object as PropType<Transaction>
  },
  setup(props) {

    const tokenTransferLayout = ref(TokenTransferLayout.make(props.transaction))

    watch(() => props.transaction, () => {
      tokenTransferLayout.value = TokenTransferLayout.make(props.transaction)
    })

    const isMobileScreen = inject("isMobileScreen", false)

    return {
      tokenTransferLayout,
      isMobileScreen
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.container {
  display: inline-grid;
  grid-template-columns: repeat(8, auto)
}

div.container > div {
  margin-right: 1em;
}

div.container > div.mobile {
  margin-right: 0;
}

div.container > div.justify-end {
  justify-self: end;
}

</style>
