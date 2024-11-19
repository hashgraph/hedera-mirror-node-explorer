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
  <div v-if="rewardTransferLayout.destinations.length >= 1">
    <p class="h-is-tertiary-text mb-2">Staking Rewards</p>

    <div class="graph-container" v-bind:class="{'graph-container-8': dollarVisible }">

      <template v-if="dollarVisible">
        <div style="grid-column-end: span 2" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Reward Account</div>
        <div/>
        <div style="grid-column-end: span 1" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Account</div>
        <div style="grid-column-end: span 2" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Amount Rewarded</div>
        <div/>
        <div/>
      </template>
      <template v-else>
        <div style="grid-column-end: span 1" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Account</div>
        <div/>
        <div style="grid-column-end: span 1" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Account</div>
        <div style="grid-column-end: span 1" class="h-is-text-size-3 has-text-grey-light has-text-weight-light mb-2">Amount Rewarded</div>
        <div/>
      </template>

      <template v-for="i in rewardTransferLayout.destinations.length" v-bind:key="i">

        <!-- #0 : account id -->
        <div>
          <AccountLink v-if="i === 1" account-id="0.0.800" data-cy="awardSourceAccount"/>
          <div v-else/>
        </div>
        <div/>

        <!-- #1 : arrow -->
        <div style="position: relative">
          <ArrowSegment
              :source-count="1"
              :dest-count="rewardTransferLayout.destinations.length"
              :row-index="i-1"/>
        </div>

        <!-- #2 : account id -->
        <div>
          <AccountLink v-if="i <= rewardTransferLayout.destinations.length"
                       v-bind:account-id="rewardTransferLayout.destinations[i-1].account"
                       data-cy="destinationAccount"/>
        </div>

        <!-- #3 : reward amount -->
        <div class="justify-end">
          <HbarAmount v-if="i <= rewardTransferLayout.destinations.length"
                      v-bind:amount="rewardTransferLayout.destinations[i-1].amount"
                      v-bind:colored="true"/>
        </div>

        <template v-if="dollarVisible">

          <!-- #4 : dollar amount -->
          <div class="justify-end">
            <HbarExtra v-if="i <= rewardTransferLayout.destinations.length"
                       v-bind:tbarAmount="rewardTransferLayout.destinations[i-1].amount"
                       v-bind:timestamp="transaction?.consensus_timestamp ?? undefined"/>
          </div>

        </template>
        <div/>
        <div/>

      </template>

    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType} from "vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import ArrowSegment from "@/components/transfer_graphs/ArrowSegment.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import HbarExtra from "@/components/values/HbarExtra.vue";
import {Transaction} from "@/schemas/MirrorNodeSchemas";
import {RewardTransferLayout} from "@/components/transfer_graphs/layout/RewardTransferLayout";

export default defineComponent({
  name: "RewardTransferGraph",
  components: {HbarAmount, HbarExtra, ArrowSegment, AccountLink},
  props: {
    transaction: Object as PropType<Transaction>,
  },
  setup(props) {

    const rewardTransferLayout = computed(() => new RewardTransferLayout(props.transaction))

    const dollarVisible = inject("isSmallScreen", true)

    return {
      rewardTransferLayout,
      dollarVisible
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
  column-gap: 1em;
}

.graph-container-8 {
  grid-template-columns: repeat(8, auto);
}

div.graph-container > div.justify-end {
  justify-self: end;
}

</style>
