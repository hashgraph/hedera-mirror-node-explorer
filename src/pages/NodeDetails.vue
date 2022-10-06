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

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Node </span>
        <span class="h-is-secondary-text is-numeric mr-3">{{ nodeId }}</span>
      </template>

      <template v-slot:content>
        <NotificationBanner v-if="notification" :message="notification"/>
      </template>

      <template v-slot:leftContent>
            <Property id="nodeAccount">
              <template v-slot:name>Node Account</template>
              <template v-slot:value>
                <AccountLink :accountId="node?.node_account_id" :show-none="true"/>
              </template>
            </Property>
            <Property id="description">
              <template v-slot:name>Description</template>
              <template v-slot:value>
                <BlobValue :base64="false" :blob-value="nodeDescription" :show-none="true" class="should-wrap"/>
              </template>
            </Property>
            <Property id="file">
              <template v-slot:name>Address Book File</template>
              <template v-slot:value>
                <StringValue :string-value="node?.file_id"/>
              </template>
            </Property>
            <Property id="rangeFrom">
              <template v-slot:name>Node existed since</template>
              <template v-slot:value>
                <TimestampValue :show-none="true" :timestamp="node?.timestamp?.from"/>
              </template>
            </Property>
            <Property id="rangeTo">
              <template v-slot:name>Node expiry date</template>
              <template v-slot:value>
                <TimestampValue :show-none="true" :timestamp="node?.timestamp?.to"/>
              </template>
            </Property>
            <Property id="serviceEndpoints">
              <template v-slot:name>Service Endpoints</template>
              <template v-slot:value>
                <Endpoints :endpoints="node?.service_endpoints"></Endpoints>
              </template>
            </Property>
            <Property id="publicKey">
              <template v-slot:name>Public Key</template>
              <template v-slot:value>
                <KeyValue :key-bytes="node?.public_key" :key-type="'RSA'" :show-none="true"/>
              </template>
            </Property>
            <Property id="nodeCertHash">
              <template v-slot:name>Certificate Hash</template>
              <template v-slot:value>
                <HexaValue v-bind:byteString="node ? formatHash(node?.node_cert_hash): undefined"
                           v-bind:show-none="true"/>
              </template>
            </Property>
      </template>

      <template v-slot:rightContent>
              <NetworkDashboardItem id="yearlyRate" :name="'APPROX ANNUAL EQUIVALENT'" :title="'Last Period Reward Rate'"
                                    :value="approxYearlyRate.toString()"/>
              <br/><br/>
              <NetworkDashboardItem id="consensusStake" :name="'HBAR'" :title="'Stake for Consensus'" :value="makeFloorHbarAmount(stake)"/>
                <p id="consensusStakePercent" v-if="stake" class="h-is-property-text h-is-extra-text mt-1">{{ stakePercentage }}% of total</p>
                <p v-else class="h-is-property-text h-is-extra-text mt-1">(&lt;Min)</p>
              <br/><br/>
              <NetworkDashboardItem id="minStake" :name="'HBAR'" :title="'Min Stake'" :value="makeFloorHbarAmount(minStake)"/>
              <br/><br/>
              <NetworkDashboardItem id="maxStake" :name="'HBAR'" :title="'Max Stake'" :value="makeFloorHbarAmount(maxStake)"/>
              <br/><br/>
              <NetworkDashboardItem id="rewarded" :name="'HBAR'" :title="'Stake Rewarded'" :value="makeFloorHbarAmount(stakeRewarded)"/>
              <p id="rewardedPercent" class="h-is-property-text h-is-extra-text mt-1">{{ stakeRewardedPercentage }}% of total</p>
              <br/><br/>
              <NetworkDashboardItem id="notRewarded" :name="'HBAR'" :title="'Stake Not Rewarded'" :value="makeFloorHbarAmount(stakeUnrewarded)"/>
              <p id="notRewardedPercent" class="h-is-property-text h-is-extra-text mt-1">{{ stakeUnrewardedPercentage }}% of total</p>
              <br/><br/>
              <NetworkDashboardItem id="stakingPeriod" :name="'HOURS'" :title="'Current Staking Period'" :value="'24'"/>
              <p class="h-is-property-text h-is-extra-text mt-1">from 00:00 am today to 11:59 pm today UTC</p>
              <div class="mt-6"/>
              <br/>
      </template>

    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, ref} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import AccountLink from "@/components/values/AccountLink.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import Footer from "@/components/Footer.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import Property from "@/components/Property.vue";
import {base64DecToArr, byteToHex} from "@/utils/B64Utils";
import HexaValue from "@/components/values/HexaValue.vue";
import Endpoints from "@/components/values/Endpoints.vue";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import {StakeLoader} from "@/components/staking/StakeLoader";
import {NodeCursor} from "@/components/node/NodeCursor";
import {NodesLoader} from "@/components/node/NodesLoader";
import {PathParam} from "@/utils/PathParam";

export default defineComponent({

  name: 'NodeDetails',

  components: {
    NetworkDashboardItem,
    Endpoints,
    HexaValue,
    Property,
    NotificationBanner,
    Footer,
    BlobValue,
    DashboardCard,
    AccountLink,
    TimestampValue,
    KeyValue,
    StringValue,
  },

  props: {
    nodeId: {
      type: String,
      required: true
    },
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const nodesLoader = new NodesLoader()
    onMounted(() => nodesLoader.requestLoad())

    const nodeCursor = new NodeCursor(computed(() => PathParam.parseNodeId(props.nodeId)), nodesLoader)
    const stakeLoader = new StakeLoader()

    const stakeTotal = computed(() => stakeLoader.entity.value?.stake_total ?? 0)
    const stakePercentage = computed(() =>
        stakeTotal.value ? Math.round(nodeCursor.stake.value / stakeTotal.value * 10000) / 100 : 0)

    const stakeRewardedPercentage = computed(() =>
        nodesLoader.stakeRewardedTotal.value != 0 ? Math.round(nodeCursor.stakeRewarded.value / nodesLoader.stakeRewardedTotal.value * 10000) / 100 : 0)

    const stakeUnrewardedPercentage = computed(() =>
        nodesLoader.stakeUnrewardedTotal.value != 0 ? Math.round(nodeCursor.stakeUnrewarded.value / nodesLoader.stakeUnrewardedTotal.value * 10000) / 100 : 0)

    const unknownNodeId = ref(false)
    const notification = computed(() => {
      let result
      if (unknownNodeId.value) {
        result =  "Node with ID " + props.nodeId + " was not found"
      } else {
        result = null
      }
      return result
    })

    const formatHash = (hash: string | undefined) => {
      return hash != undefined ? byteToHex(base64DecToArr(hash)) : ""
    }

    const makeFloorHbarAmount = (tinyBarAmount: number) => Math.floor((tinyBarAmount ?? 0) / 100000000).toLocaleString('en-US')

    return {
      isSmallScreen,
      isTouchDevice,
      node: nodeCursor.node,
      approxYearlyRate: nodeCursor.approxYearlyRate,
      stake: nodeCursor.stake,
      minStake: nodeCursor.minStake,
      maxStake: nodeCursor.maxStake,
      stakePercentage,
      stakeRewarded: nodeCursor.stakeRewarded,
      stakeRewardedPercentage,
      stakeUnrewarded: nodeCursor.stakeUnrewarded,
      stakeUnrewardedPercentage,
      notification,
      nodeDescription: nodeCursor.nodeDescription,
      formatHash,
      makeFloorHbarAmount
    }
  },
});

</script>

<style/>