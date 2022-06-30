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
            <Property :id="'nodeAccount'">
              <template v-slot:name>Node Account</template>
              <template v-slot:value>
                <AccountLink :accountId="node?.node_account_id" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'description'">
              <template v-slot:name>Description</template>
              <template v-slot:value>
                <BlobValue :base64="false" :blob-value="nodeDescription" :show-none="true" class="should-wrap"/>
              </template>
            </Property>
            <Property :id="'file'">
              <template v-slot:name>Address Book File</template>
              <template v-slot:value>
                <StringValue :string-value="node?.file_id"/>
              </template>
            </Property>
            <Property :id="'rangeFrom'">
              <template v-slot:name>Node existed since</template>
              <template v-slot:value>
                <TimestampValue :show-none="true" :timestamp="node?.timestamp?.from"/>
              </template>
            </Property>
            <Property :id="'rangeTo'">
              <template v-slot:name>Node expiry date</template>
              <template v-slot:value>
                <TimestampValue :show-none="true" :timestamp="node?.timestamp?.to"/>
              </template>
            </Property>
            <Property :id="'serviceEndpoints'">
              <template v-slot:name>Service Endpoints</template>
              <template v-slot:value>
                <Endpoints :endpoints="node?.service_endpoints"></Endpoints>
              </template>
            </Property>
            <Property :id="'publicKey'">
              <template v-slot:name>Public Key</template>
              <template v-slot:value>
                <KeyValue :key-bytes="node?.public_key" :key-type="'RSA'" :show-none="true"/>
              </template>
            </Property>
            <Property :id="'nodeCertHash'">
              <template v-slot:name>Certificate Hash</template>
              <template v-slot:value>
                <HexaValue v-bind:byteString="node ? formatHash(node?.node_cert_hash): undefined"
                           v-bind:show-none="true"/>
              </template>
            </Property>
          </div>

          <div class="column" :class="{'h-has-column-separator': isStakingEnabled}">
            <div v-if="isStakingEnabled">
              <NetworkDashboardItem :name="'HBAR'" :title="'Stake for Consensus'" :value="totalStaked.toString()"/>
              <p class="h-is-property-text h-is-extra-text mt-1">{{ stakePercentage }}% of total</p>
              <br/><br/>
              <NetworkDashboardItem :name="'HBAR'" :title="'Stake Rewarded'" :value="totalRewarded.toString()"/>
              <p class="h-is-property-text h-is-extra-text mt-1">{{ rewardPercentage }}% of total</p>
              <br/><br/>
              <NetworkDashboardItem :name="'HOURS'" :title="'Current Staking Period'" :value="'24'"/>
              <p class="h-is-property-text h-is-extra-text mt-1">from 00:00 am today to 11:59 pm today UTC</p>
              <div class="mt-6"/>
            </div>
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
    const isStakingEnabled = process.env.VUE_APP_ENABLE_STAKING === 'true'

    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    let nodes = ref<Array<NetworkNode> | null>([])
    const node = ref<NetworkNode | null>(null)

    const totalStaked = ref(0)
    const totalRewarded = ref(0)
    const stakePercentage = computed(() =>
      node.value?.stake && totalStaked.value ? node.value.stake / totalStaked.value : 0
    )
    const rewardPercentage = computed(() =>
        node.value?.stake_rewarded && totalRewarded.value ? node.value.stake_rewarded / totalRewarded.value : 0
    )

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

                if (n.stake) {
                  totalStaked.value += n.stake
                }
                if (n.stake_rewarded) {
                  totalRewarded.value += n.stake_rewarded
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
      isStakingEnabled,
      isSmallScreen,
      isTouchDevice,
      node,
      totalStaked,
      totalRewarded,
      stakePercentage,
      rewardPercentage,
      notification,
      nodeDescription,
      formatHash
    }
  },
});

</script>

<style/>