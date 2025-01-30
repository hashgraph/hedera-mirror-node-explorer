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

    <div class="page-container">
      <DashboardCardV2>
        <template #title>
          {{ `Node ${nodeIdNb}` }}
        </template>

        <!--        <template #subtitle>-->
        <!--          <div v-if="isCouncilNode">Hedera Council Node</div>-->
        <!--          <div v-else>Community Node</div>-->
        <!--        </template>-->

        <template v-if="notification" #content>
          <NotificationBanner :message="notification"/>
        </template>

        <template #left-content>
          <Property id="nodeAccount">
            <template #name>Node Account</template>
            <template #value>
              <AccountLink :accountId="node?.node_account_id"/>
            </template>
          </Property>
          <Property id="description">
            <template #name>Description</template>
            <template #value>
              <BlobValue :base64="false" :blob-value="nodeDescription" :show-none="true"/>
            </template>
          </Property>
          <Property id="file">
            <template #name>Address Book File</template>
            <template #value>
              <StringValue :string-value="node?.file_id"/>
            </template>
          </Property>
          <Property id="rangeFrom">
            <template #name>Node existed since</template>
            <template #value>
              <TimestampValue :show-none="true" :timestamp="node?.timestamp?.from"/>
            </template>
          </Property>
          <Property id="rangeTo">
            <template #name>Node expiry date</template>
            <template #value>
              <TimestampValue :show-none="true" :timestamp="node?.timestamp?.to"/>
            </template>
          </Property>
          <Property id="serviceEndpoints">
            <template #name>Service Endpoints</template>
            <template #value>
              <Endpoints :endpoints="node?.service_endpoints"></Endpoints>
            </template>
          </Property>
          <template v-if="enableStaking">
            <Property id="publicKey">
              <template #name>Public Key</template>
              <template #value>
                <KeyValue :key-bytes="node?.public_key" :show-none="true" key-type="RSA"/>
              </template>
            </Property>
            <Property id="nodeCertHash">
              <template #name>Certificate Hash</template>
              <template #value>
                <HexaValue :byteString="formattedHash" :show-none="true"/>
              </template>
            </Property>
          </template>
        </template>

        <template v-if="enableStaking" #right-content>
          <div class="dashboard-items">
            <NetworkDashboardItemV2
                id="yearlyRate"
                title="Last Period Reward Rate"
                :value="annualizedRate.toString()"
                unit="APPROX ANNUAL EQUIVALENT"
            />
            <NetworkDashboardItemV2
                id="consensusStake"
                title="Stake for Consensus"
                :value="makeFloorHbarAmount(stake)"
                :unit=cryptoName
                :info-label="stakeLabel"
                :extra="stake > 0 ? `${stakePercentage} of total` : undefined"
            />
            <NetworkDashboardItemV2
                id="rewarded"
                title="Staked for Reward"
                :value="makeFloorHbarAmount(stakeRewarded)"
                :unit=cryptoName
                :extra="`${stakeRewardedPercentage} of total`"
            />
            <NetworkDashboardItemV2
                id="notRewarded"
                title="Staked For No Reward"
                :value="makeFloorHbarAmount(stakeUnrewarded)"
                :unit=cryptoName
                :extra="`${stakeUnrewardedPercentage} of total`"
            />
            <NetworkDashboardItemV2
                id="minStake"
                title="Min Stake"
                :value="makeFloorHbarAmount(minStake)"
                :unit=cryptoName
            />
            <NetworkDashboardItemV2
                id="maxStake"
                title="Max Stake"
                :value="makeFloorHbarAmount(maxStake)"
                :unit=cryptoName
            />
            <NetworkDashboardItemV2
                title="Current Staking Period"
                id="stakingPeriod"
                value="24"
                unit="HOURS"
                extra="from 00:00 am today to 11:59 pm today UTC"
            />
          </div>
        </template>

        <template v-else #right-content>
          <Property id="publicKey">
            <template #name>Public Key</template>
            <template #value>
              <KeyValue :key-bytes="node?.public_key" :show-none="true" key-type="RSA"/>
            </template>
          </Property>
          <Property id="nodeCertHash">
            <template #name>Certificate Hash</template>
            <template #value>
              <HexaDumpValue :byteString="formattedHash" :show-none="true"/>
            </template>
          </Property>
        </template>
      </DashboardCardV2>

      <MirrorLink :network="props.network" entityUrl="network/nodes" :query="`node.id=${props.nodeId}`"/>
    </div>

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
import BlobValue from "@/components/values/BlobValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import PageFrameV2 from "@/components/page/PageFrameV2.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import Property from "@/components/Property.vue";
import HexaDumpValue from "@/components/values/HexaDumpValue.vue";
import Endpoints from "@/components/values/Endpoints.vue";
import {StakeCache} from "@/utils/cache/StakeCache";
import {PathParam} from "@/utils/PathParam";
import {NodeAnalyzer} from "@/utils/analyzer/NodeAnalyzer";
import {NetworkNode} from "@/schemas/MirrorNodeSchemas";
import {makeStakePercentage} from "@/schemas/MirrorNodeUtils.ts";
import {routeManager} from "@/router";
import {CoreConfig} from "@/config/CoreConfig.ts";
import DashboardCardV2 from "@/components/DashboardCardV2.vue";
import NetworkDashboardItemV2 from "@/components/node/NetworkDashboardItemV2.vue";
import MirrorLink from "@/components/MirrorLink.vue";
import HexaValue from "@/components/values/HexaValue.vue";

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
const nodeDescription = nodeAnalyzer.nodeDescription
const formattedHash = nodeAnalyzer.certificateHash

</script>

<style scoped>

div.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-left: 32px;
  margin-right: 32px;
}

div.dashboard-items {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

</style>
