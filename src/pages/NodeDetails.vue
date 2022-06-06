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

  <hr class="h-top-banner" style="margin: 0; height: 4px"/>

  <section :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}" class="section">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Node </span>
        <span class="h-is-secondary-text is-numeric mr-3">{{ nodeId }}</span>
      </template>
      <template v-slot:table>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text">

          <div class="column">
            <Property :id="'nodeAccount'">
              <template v-slot:name>Node Account</template>
              <template v-slot:value>
                <AccountLink v-bind:accountId="node?.node_account_id"/>
              </template>
            </Property>
            <Property :id="'description'">
              <template v-slot:name>Description</template>
              <template v-slot:value>
                <BlobValue :base64="false" :blob-value="nodeDescription" :show-none="true" class="should-wrap"/>
              </template>
            </Property>
            <Property :id="'memo'">
              <template v-slot:name>Memo</template>
              <template v-slot:value>
                <BlobValue :base64="true" :blob-value="node?.memo" :show-none="true" class="should-wrap"/>
              </template>
            </Property>
            <Property :id="'publicKey'">
              <template v-slot:name>Public Key</template>
              <template v-slot:value>
                <KeyValue :key-bytes="node?.public_key" :key-type="'RSA'" :show-none="true"/>
              </template>
            </Property>
          </div>

          <div class="column">
            <Property :id="'file'">
              <template v-slot:name>Address Book File</template>
              <template v-slot:value>
                <StringValue :string-value="node?.file_id"/>
              </template>
            </Property>
            <Property :id="'rangeFrom'">
              <template v-slot:name>From</template>
              <template v-slot:value>
                <TimestampValue :show-none="true" :timestamp="node?.timestamp?.from"/>
              </template>
            </Property>
            <Property :id="'rangeTo'">
              <template v-slot:name>To</template>
              <template v-slot:value>
                <TimestampValue :show-none="true" :timestamp="node?.timestamp?.to"/>
              </template>
            </Property>
            <Property :id="'nodeCertHash'">
              <template v-slot:name>Certificate Hash</template>
              <template v-slot:value>
                <HexaValue v-bind:byteString="node ? formatHash(node?.node_cert_hash): undefined"
                           v-bind:show-none="true"/>
              </template>
            </Property>
            <Property :id="'serviceEndpoints'">
              <template v-slot:name>Service Endpoints</template>
              <template v-slot:value>
                <div v-for="s in node?.service_endpoints" :key="s.ip_address_v4">
                  <Endpoint :address="s.ip_address_v4" :port="s.port"></Endpoint>
                </div>
              </template>
            </Property>
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
import Endpoint from "@/components/values/Endpoint.vue";

export default defineComponent({

  name: 'NodeDetails',

  components: {
    Endpoint,
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
      type: Number,
      required: true
    },
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const node = ref<NetworkNode | null>(null)
    const notification = ""
    const nodeDescription = computed(() => {
      let result
      if (node.value?.description) {
        result = node.value?.description
      } else {
        result = node.value?.node_account_id ? operatorRegistry.lookup(node.value?.node_account_id)?.getDescription() : null
      }
      return result
    })

    onBeforeMount(() => fetchNode(props.nodeId))
    watch(() => props.nodeId, () => fetchNode(props.nodeId));

    const fetchNode = (nodeId: number) => {
      const url = "api/v1/network/nodes"
      const queryParams = {params: {'node.id': nodeId}}
      axios
          .get<NetworkNodesResponse>(url, queryParams)
          .then(result => {
            if (result.data.nodes) {
              node.value = result.data.nodes[0]
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
      notification,
      nodeDescription,
      formatHash
    }
  },
});

</script>

<style/>