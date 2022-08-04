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
      <template v-slot:table>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text mt-3">

          <div class="column">
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
          </div>

          <div class="column h-has-column-separator">
              <NetworkDashboardItem :name="'APPROX YEARLY EQUIVALENT'" :title="'Last Period Reward Rate'"
                                    :value="approxYearlyRate.toString()"/>
              <br/><br/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Stake for Consensus'" :value="stake.toLocaleString('en-US')"/>
              <p class="h-is-property-text h-is-extra-text mt-1">{{ stakePercentage }}% of total</p>
              <br/><br/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Min Stake'" :value="minStake.toLocaleString('en-US')"/>
              <br/><br/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Max Stake'" :value="maxStake.toLocaleString('en-US')"/>
              <br/><br/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Rewarded Stake'" :value="stakeRewarded.toLocaleString('en-US')"/>
              <p class="h-is-property-text h-is-extra-text mt-1">{{ stakeRewardedPercentage }}% of total</p>
              <br/><br/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Unrewarded Stake'" :value="stakeUnrewarded.toLocaleString('en-US')"/>
              <p class="h-is-property-text h-is-extra-text mt-1">{{ stakeUnrewardedPercentage }}% of total</p>
              <br/><br/>
              <NetworkDashboardItem :name="'HOURS'" :title="'Current Staking Period'" :value="'24'"/>
              <p class="h-is-property-text h-is-extra-text mt-1">from 00:00 am today to 11:59 pm today UTC</p>
              <div class="mt-6"/>
          </div>

        </div>
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

import {computed, defineComponent, inject, onBeforeMount, ref, watch} from 'vue';
import axios from "axios";
import {NetworkNode, NetworkNodesResponse} from "@/schemas/HederaSchemas";
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
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import Endpoints from "@/components/values/Endpoints.vue";
import NetworkDashboardItem from "@/components/node/NetworkDashboardItem.vue";

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
    const nodes = ref<Array<NetworkNode> | null>([])
    const node = ref<NetworkNode | null>(null)

    const rewardRate = computed(() =>
        node.value?.reward_rate_start && node.value?.stake_rewarded
            ? node.value.reward_rate_start / node.value?.stake_rewarded
            : 0)
    const approxYearlyRate = computed(() => {
      const formatter = new Intl.NumberFormat("en-US", {
        style: 'percent',
        maximumFractionDigits: 2
      })
      return formatter.format(rewardRate.value * 365);
    })
    const stake = computed(() => node.value?.stake ? Math.round(node.value.stake / 100000000) : 0)
    const minStake = computed(() => node.value?.min_stake ? Math.round(node.value.min_stake / 100000000) : 0)
    const maxStake = computed(() => node.value?.max_stake ? Math.round(node.value.max_stake / 100000000) : 0)
    const stakeTotal = computed(() => node.value?.stake_total ? Math.round(node.value.stake_total / 100000000) : 0)
    const stakePercentage = computed(() =>
        stakeTotal.value ? Math.round(stake.value / stakeTotal.value * 10000) / 100 : 0)

    const stakeRewarded = computed(() => node.value?.stake_rewarded ? Math.round(node.value.stake_rewarded / 100000000) : 0)
    const stakeRewardedTotal = ref(0)
    const stakeRewardedPercentage = computed(() =>
        stakeRewardedTotal.value ? Math.round(stakeRewarded.value / stakeRewardedTotal.value * 10000) / 100 : 0)

    const stakeUnrewarded = computed(() => node.value?.stake_not_rewarded ? Math.round(node.value.stake_not_rewarded / 100000000) : 0)
    const stakeUnrewardedTotal = ref(0)
    const stakeUnrewardedPercentage = computed(() =>
        stakeUnrewardedTotal.value ? Math.round(stakeUnrewarded.value / stakeUnrewardedTotal.value * 10000) / 100 : 0)

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

    const nodeDescription = computed(() => {
      let result
      if (node.value?.description) {
        result = node.value?.description
      } else {
        result = node.value?.node_account_id ? operatorRegistry.lookup(node.value?.node_account_id)?.getDescription() : null
      }
      return result
    })

    onBeforeMount(() => {
      fetchNodes()
      fetchNode(props.nodeId)
    })
    watch(() => props.nodeId, () => fetchNode(props.nodeId));

    const fetchNodes = (nextUrl: string | null = null) => {
      const url = nextUrl ?? "api/v1/network/nodes"
      axios
          .get<NetworkNodesResponse>(url, {params: {limit: 25}})
          .then(result => {
            if (result.data.nodes) {
              nodes.value = nodes.value ? nodes.value.concat(result.data.nodes) : result.data.nodes
              for (const n of result.data.nodes) {
                if (n.stake_rewarded) {
                  stakeRewardedTotal.value += n.stake_rewarded/100000000
                }
              }
            }
            const next = result.data.links?.next
            if (next) {
              fetchNodes(next)
            }
          })
    }

    const fetchNode = (nodeId: string) => {
      const url = "api/v1/network/nodes"
      const queryParams = {params: {'node.id': nodeId}}
      axios
          .get<NetworkNodesResponse>(url, queryParams)
          .then(result => {
            if (result.data.nodes && result.data.nodes.length > 0) {
              node.value = result.data.nodes[0]
              unknownNodeId.value = false
            } else {
              node.value = null
              unknownNodeId.value = true
            }
          })
    }

    const formatHash = (hash: string | undefined) => {
      return hash != undefined ? byteToHex(base64DecToArr(hash)) : ""
    }

    return {
      isSmallScreen,
      isTouchDevice,
      node,
      approxYearlyRate,
      stake,
      minStake,
      maxStake,
      stakePercentage,
      stakeRewarded,
      stakeRewardedPercentage,
      stakeUnrewarded,
      stakeUnrewardedPercentage,
      notification,
      nodeDescription,
      formatHash
    }
  },
});

</script>

<style/>