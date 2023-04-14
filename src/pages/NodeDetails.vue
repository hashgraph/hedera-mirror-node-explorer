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
        <div class="is-flex is-align-items-center">
          <span class="h-is-primary-title mr-2">Node </span>
          <span class="h-is-secondary-text is-numeric mr-3">{{ nodeIdNb }}</span>
        </div>
        <div v-if="isCouncilNode">
          <span class="icon has-text-info mr-2"><i class="fas fa-building"></i></span>
          <span class="h-is-tertiary-text has-text-grey">Hedera Council Node</span>
        </div>
        <div v-else>
          <span class="icon has-text-info mr-2"><i class="fas fa-users"></i></span>
          <span class="h-is-tertiary-text has-text-grey">Community Node</span>
        </div>
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
            <BlobValue :base64="false" :blob-value="nodeDescription" :show-none="true"/>
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
            <KeyValue :key-bytes="node?.public_key" :show-none="true" key-type="RSA"/>
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
        <NetworkDashboardItem id="yearlyRate" :value="annualizedRate.toString()" name="APPROX ANNUAL EQUIVALENT"
                              title="Last Period Reward Rate"/>
        <br/><br/>
        <NetworkDashboardItem id="consensusStake" :value="makeFloorHbarAmount(stake)" name="HBAR"
                              title="Stake for Consensus"/>
        <p v-if="stake" id="consensusStakePercent" class="h-is-property-text h-is-extra-text mt-1">{{
            stakePercentage
          }}% of total</p>
        <p v-else class="h-is-property-text h-is-extra-text mt-1">(&lt;Min)</p>
        <br/><br/>
        <div v-if="stake === 0">
          <NetworkDashboardItem id="currentStake" :value="makeFloorHbarAmount(unclampedStake)"
                                name="HBAR" title="Current Stake"/>
          <br/><br/>
        </div>
        <NetworkDashboardItem id="minStake" :value="makeFloorHbarAmount(minStake)" name="HBAR" title="Min Stake"/>
        <br/><br/>
        <NetworkDashboardItem id="maxStake" :value="makeFloorHbarAmount(maxStake)" name="HBAR" title="Max Stake"/>
        <br/><br/>
        <NetworkDashboardItem id="rewarded" :value="makeFloorHbarAmount(stakeRewarded)" name="HBAR"
                              title="Staked for Reward"/>
        <p id="rewardedPercent" class="h-is-property-text h-is-extra-text mt-1">{{ stakeRewardedPercentage }}% of
          total</p>
        <br/><br/>
        <NetworkDashboardItem id="notRewarded" :value="makeFloorHbarAmount(stakeUnrewarded)" name="HBAR"
                              title="Staked For No Reward"/>
        <p id="notRewardedPercent" class="h-is-property-text h-is-extra-text mt-1">{{ stakeUnrewardedPercentage }}% of
          total</p>
        <br/><br/>
        <NetworkDashboardItem id="stakingPeriod" name="HOURS" title="Current Staking Period" value="24"/>
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

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, ref} from 'vue';
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
import {StakeCache} from "@/utils/cache/StakeCache";
import {PathParam} from "@/utils/PathParam";
import {NodeRegistry} from "@/components/node/NodeRegistry";

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

    const nodeIdNb = computed(() => PathParam.parseNodeId(props.nodeId))
    const nodeCursor = NodeRegistry.getCursor(nodeIdNb)

    const stakeLookup = StakeCache.instance.makeLookup()
    onMounted(() => stakeLookup.mount())
    onBeforeUnmount(() => stakeLookup.unmount())

    const stakeTotal = computed(() => stakeLookup.entity.value?.stake_total ?? 0)
    const stakePercentage = computed(() =>
        stakeTotal.value ? Math.round(nodeCursor.stake.value / stakeTotal.value * 10000) / 100 : 0)

    const stakeRewardedPercentage = computed(() =>
        NodeRegistry.instance.stakeRewardedTotal.value != 0 ? Math.round(nodeCursor.stakeRewarded.value / NodeRegistry.instance.stakeRewardedTotal.value * 10000) / 100 : 0)

    const stakeUnrewardedPercentage = computed(() =>
        NodeRegistry.instance.stakeUnrewardedTotal.value != 0 ? Math.round(nodeCursor.stakeUnrewarded.value / NodeRegistry.instance.stakeUnrewardedTotal.value * 10000) / 100 : 0)

    const unknownNodeId = ref(false)
    const notification = computed(() => {
      let result
      if (unknownNodeId.value) {
        result = "Node with ID " + props.nodeId + " was not found"
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
      nodeIdNb,
      node: nodeCursor.node,
      annualizedRate: nodeCursor.annualizedRate,
      stake: nodeCursor.stake,
      minStake: nodeCursor.minStake,
      maxStake: nodeCursor.maxStake,
      stakePercentage,
      unclampedStake: nodeCursor.unclampedStake,
      stakeRewarded: nodeCursor.stakeRewarded,
      stakeRewardedPercentage,
      stakeUnrewarded: nodeCursor.stakeUnrewarded,
      stakeUnrewardedPercentage,
      notification,
      isCouncilNode: nodeCursor.isCouncilNode,
      nodeDescription: nodeCursor.nodeDescription,
      formatHash,
      makeFloorHbarAmount
    }
  },
});

</script>

<style/>