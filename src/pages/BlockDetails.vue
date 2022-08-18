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

  <section class="section" :class="{'h-mobile-background': isTouchDevice || !isSmallScreen}">

    <DashboardCard>
      <template v-slot:title>
        <span class="h-is-primary-title">Block {{ blockNb ?? "" }}</span>
      </template>

      <template v-slot:table>

        <NotificationBanner v-if="notification" :message="notification"/>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="count">
              <template v-slot:name>No. of Transactions</template>
              <template v-slot:value>
                <StringValue :string-value="block?.count?.toLocaleString()"/>
              </template>
            </Property>
          </div>
        </div>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="blockHash">
              <template v-slot:name>Hash</template>
              <template v-slot:value>
                <KeyValue :key-bytes="block?.hash" key-type="SHA384" :show-none="true"/>
              </template>
            </Property>
          </div>
        </div>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="fromTimestamp">
              <template v-slot:name>From Timestamp</template>
              <template v-slot:value>
                <TimestampValue :timestamp="block?.timestamp?.from" :show-none="true"/>
              </template>
            </Property>
          </div>
        </div>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="toTimestamp">
              <template v-slot:name>To Timestamp</template>
              <template v-slot:value>
                <TimestampValue :timestamp="block?.timestamp?.to" :show-none="true"/>
              </template>
            </Property>
          </div>
        </div>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="gasUsed">
              <template v-slot:name>Gas Used</template>
              <template v-slot:value>
                <StringValue :string-value="block?.gas_used?.toLocaleString()"/>
              </template>
            </Property>
          </div>
        </div>

        <div class="columns h-is-property-text">
          <div class="column">
            <Property id="recordFileName">
              <template v-slot:name>Record File Name</template>
              <template v-slot:value>
                <StringValue :string-value="block?.name"/>
              </template>
            </Property>
          </div>
        </div>

      </template>

    </DashboardCard>

  </section>

  <Footer/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onMounted, ref, watch} from 'vue';
import {Block} from "@/schemas/HederaSchemas";
import {BlockNb} from "@/utils/BlockNb";
import DashboardCard from "@/components/DashboardCard.vue";
import NotificationBanner from "@/components/NotificationBanner.vue";
import Property from "@/components/Property.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";
import StringValue from "@/components/values/StringValue.vue";
import KeyValue from "@/components/values/KeyValue.vue";
import Footer from "@/components/Footer.vue";
import axios from "axios";

export default defineComponent({

  name: 'BlockDetails',

  components: {
    DashboardCard,
    NotificationBanner,
    Property,
    Footer,
    StringValue,
    TimestampValue,
    KeyValue,
  },

  props: {
    blockNb: String,
    network: String
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)

    const validBlockNb = computed(() => {
      return props.blockNb ? BlockNb.parse(props.blockNb) !== null : false
    })

    //
    // block
    //

    const block = ref<Block|null>(null)
    const blockError = ref<unknown>(null)

    const got404 = computed(() => {
      return blockError.value !== null
          && axios.isAxiosError(blockError.value)
          && blockError.value?.request?.status === 404
    })

    const notification = computed(() => {
      let result
      if (!validBlockNb.value) {
        result =  "Invalid block NB: " + props.blockNb
      } else if (got404.value) {
        result =  "Block with NB " + props.blockNb + " was not found"
      } else {
        result = null
      }
      return result
    })

    const fetchBlock = () => {
      if (validBlockNb.value) {
        axios
            .get<Block>("api/v1/blocks/" + props.blockNb)
            .then(response => {
              block.value = response.data
              blockError.value = null
            })
            .catch(reason => {
              block.value = null
              blockError.value = reason
            })
      } else {
        block.value = null
        blockError.value = null
      }
    }

    watch(() => props.blockNb, () => fetchBlock())
    onMounted(() => fetchBlock())

    return {
      isSmallScreen,
      isTouchDevice,
      block,
      notification,
    }
  }
});

</script>

<style/>