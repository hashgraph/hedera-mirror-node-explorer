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

  <PageFrameV2 page-title="Node Details">

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
            <AccountLink :accountId="node?.node_account_id"/>
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
        <Property v-if="enableStaking" id="publicKey">
          <template v-slot:name>Public Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="node?.public_key" :show-none="true" key-type="RSA"/>
          </template>
        </Property>
        <Property v-if="enableStaking" id="nodeCertHash">
          <template v-slot:name>Certificate Hash</template>
          <template v-slot:value>
            <HexaValue v-bind:byteString="formattedHash" v-bind:show-none="true"/>
          </template>
        </Property>
      </template>

      <template v-if="enableStaking" v-slot:rightContent>
        <div>
          <NetworkDashboardItem
              id="yearlyRate"
              :value="annualizedRate.toString()"
              name="APPROX ANNUAL EQUIVALENT"
              title="Last Period Reward Rate"
          />
        </div>

        <div class="mt-5">
          <NetworkDashboardItem
              id="consensusStake"
              :value="makeFloorHbarAmount(stake)"
              :name=cryptoName
              title="Stake for Consensus"
              :info-label="stakeLabel"
          />
          <p v-if="stake > 0" id="consensusStakePercent" class="h-is-property-text h-is-extra-text mt-1">
            {{ stakePercentage }} of total
          </p>
        </div>

        <div class="mt-5">
          <NetworkDashboardItem
              id="rewarded"
              :value="makeFloorHbarAmount(stakeRewarded)"
              :name=cryptoName
              title="Staked for Reward"
          />
          <p id="rewardedPercent" class="h-is-property-text h-is-extra-text mt-1">
            {{ stakeRewardedPercentage }}% of total
          </p>
        </div>

        <div class="mt-5">
          <NetworkDashboardItem
              id="notRewarded"
              :value="makeFloorHbarAmount(stakeUnrewarded)"
              :name=cryptoName
              title="Staked For No Reward"
          />
          <p id="notRewardedPercent" class="h-is-property-text h-is-extra-text mt-1">
            {{ stakeUnrewardedPercentage }}% of total
          </p>
        </div>

        <div class="mt-5">
          <NetworkDashboardItem
              id="minStake"
              :value="makeFloorHbarAmount(minStake)"
              :name=cryptoName
              title="Min Stake"
          />
        </div>

        <div class="mt-5">
          <NetworkDashboardItem
              id="maxStake"
              :value="makeFloorHbarAmount(maxStake)"
              :name=cryptoName
              title="Max Stake"
          />
        </div>

        <div class="mt-5">
          <NetworkDashboardItem
              id="stakingPeriod"
              name="HOURS"
              title="Current Staking Period"
              value="24"
          />
          <p class="h-is-property-text h-is-extra-text mt-1">
            from 00:00 am today to 11:59 pm today UTC
          </p>
        </div>
      </template>

      <template v-else v-slot:rightContent>
        <Property id="publicKey">
          <template v-slot:name>Public Key</template>
          <template v-slot:value>
            <KeyValue :key-bytes="node?.public_key" :show-none="true" key-type="RSA"/>
          </template>
        </Property>
        <Property id="nodeCertHash">
          <template v-slot:name>Certificate Hash</template>
          <template v-slot:value>
            <HexaValue v-bind:byteString="formattedHash" v-bind:show-none="true"/>
          </template>
        </Property>
      </template>

    </DashboardCard>

  </PageFrameV2>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, ref} from 'vue';
import KeyValue from "@/components/values/KeyValue.vue";
import AccountLink from "@/components/values/link/AccountLink.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import DashboardCard from "@/components/DashboardCard.vue";
import BlobValue from "@/components/values/BlobValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import Property from "@/components/Property.vue";
import HexaValue from "@/components/values/HexaValue.vue";
import Endpoints from "@/components/values/Endpoints.vue";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";
import {StakeCache} from "@/utils/cache/StakeCache";
import {PathParam} from "@/utils/PathParam";
import {NodeAnalyzer} from "@/utils/analyzer/NodeAnalyzer";
import {NetworkNode} from "@/schemas/MirrorNodeSchemas";
import {makeStakePercentage} from "@/schemas/MirrorNodeUtils.ts";
import {routeManager} from "@/router";
import {CoreConfig} from "@/config/CoreConfig.ts";

const props = defineProps({
  nodeId: {
    type: String,
    required: true
  },
  network: String
})

const cryptoName = CoreConfig.inject().cryptoName

const nodeIdNb = computed(() => PathParam.parseNodeId(props.nodeId))
const nodeAnalyzer = new NodeAnalyzer(nodeIdNb)
onMounted(() => nodeAnalyzer.mount())
onBeforeUnmount(() => nodeAnalyzer.unmount())
const networkAnalyzer = nodeAnalyzer.networkAnalyzer // Mounted / unmounted by nodeAnalyzer

const stakeLookup = StakeCache.instance.makeLookup()
onMounted(() => stakeLookup.mount())
onBeforeUnmount(() => stakeLookup.unmount())

const stakeTotal = computed(() => stakeLookup.entity.value?.stake_total ?? 0)
const stakePercentage = computed(() =>
    nodeAnalyzer.node.value && stakeTotal.value
        ? makeStakePercentage(nodeAnalyzer.node.value as NetworkNode, stakeTotal.value)
        : "0"
)
const stakeLabel = computed(() =>
    nodeAnalyzer.stake.value === 0
        ? 'Stake for consensus is 0 because (Staked for Reward + Staked For No Reward) was less than Min Stake at the beginning of the current staking period.'
        : null
)
const stakeRewardedPercentage = computed(() =>
    networkAnalyzer.stakeRewardedTotal.value != 0 ? Math.round(nodeAnalyzer.stakeRewarded.value / networkAnalyzer.stakeRewardedTotal.value * 10000) / 100 : 0
)
const stakeUnrewardedPercentage = computed(() =>
    networkAnalyzer.stakeUnrewardedTotal.value != 0 ? Math.round(nodeAnalyzer.stakeUnrewarded.value / networkAnalyzer.stakeUnrewardedTotal.value * 10000) / 100 : 0
)

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

const makeFloorHbarAmount = (tinyBarAmount: number) => {
  return Math.floor((tinyBarAmount ?? 0) / 100000000).toLocaleString('en-US')
}

const enableStaking = routeManager.enableStaking
const node = nodeAnalyzer.node
const annualizedRate = nodeAnalyzer.annualizedRate
const stake = nodeAnalyzer.stake
const minStake = nodeAnalyzer.minStake
const maxStake = nodeAnalyzer.maxStake
const stakeRewarded = nodeAnalyzer.stakeRewarded
const stakeUnrewarded = nodeAnalyzer.stakeUnrewarded
const isCouncilNode = nodeAnalyzer.isCouncilNode
const nodeDescription = nodeAnalyzer.nodeDescription
const formattedHash = nodeAnalyzer.certificateHash

</script>

<style/>
