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
  <div :class="{'is-active': showDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px">
      <div class="box">
        <div class="is-flex is-justify-content-space-between is-align-items-self-end">
          <span>
            <span class="h-is-primary-title">Change Staking </span>
            <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
            <span v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3">{{ accountId }}</span>
          </span>
          <a @click="handleCancel">
            <img alt="Search bar" src="@/assets/close-icon.png" style="max-height: 20px;">
          </a>
        </div>
        <hr class="h-card-separator"/>

        <Property :id="'amountStaked'">
          <template v-slot:name>Amount Staked</template>
          <template v-slot:value>
            <HbarAmount v-if="account" :amount="account.balance.balance" :show-extra="true"/>
          </template>
        </Property>

        <Property :id="'currentlyStakedTo'">
          <template v-slot:name>Currently Staked To</template>
          <template v-slot:value>
            <StringValue v-if="account" :string-value="stakedTo"/>
          </template>
        </Property>

        <div class="columns">
          <div class="column is-one-third has-text-weight-light">
            Stake To
          </div>
          <div class="column">
            <div class="is-flex">
              <div class="control" style="width: 10rem">
                <label class="radio">
                  <input checked="checked" name="stakeTarget" type="radio">
                  Node
                </label>
              </div>
              <o-field>
                <o-select v-model="selectedNode" class="h-is-text-size-1" style="border-radius: 4px">
                  <option v-for="f in filterValues" v-bind:key="f" v-bind:value="f"
                          style="background-color: var(--h-theme-page-background-color)">
                    {{ f }}
                  </option>
                </o-select>
              </o-field>
            </div>
            <div class="is-flex mt-2">
              <div class="control" style="width: 10rem">
                <label class="radio ml-0">
                  <input name="stakeTarget" type="radio">
                  Other Account
                </label>
              </div>
              <o-field>
                <o-input placeholder="0.0.1234"></o-input>
              </o-field>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column is-one-third has-text-weight-light">
            Decline Reward
          </div>
          <div class="column">
            <label class="checkbox">
              <input checked="checked" type="checkbox">
            </label>
          </div>
        </div>

        <Property :id="'changeCost'">
          <template v-slot:name>Change Transaction Cost</template>
          <template v-slot:value>
            <HbarAmount v-if="account" :amount="10000000" :show-extra="true"/>
          </template>
        </Property>

        <div class="is-flex is-justify-content-flex-end">
          <button class="button is-white is-small" @click="handleCancel">CANCEL</button>
          <button class="button is-info is-small ml-4" @click="handleChange">CHANGE</button>
        </div>

      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType, ref} from "vue";
import {AccountBalanceTransactions, NetworkNode} from "@/schemas/HederaSchemas";
import Property from "@/components/Property.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StringValue from "@/components/values/StringValue.vue";

export default defineComponent({
  name: "StakingDialog",
  components: {StringValue, HbarAmount, Property},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    account: Object as PropType<AccountBalanceTransactions>,
    stakedTo: String,
    networkNode: {
      type: Object as PropType<NetworkNode | null>,
      default: null
    }
  },

  setup(props, context) {

    const accountId = computed(() => props.account?.account)

    const selectedAccount = ref("")
    const selectedNode = ref(0)
    const filterValues = ['Node1', 'Node2', 'Node3']

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleChange = () => {
      context.emit('update:showDialog', false)
    }

    return {
      accountId,
      selectedAccount,
      selectedNode,
      filterValues,
      handleCancel,
      handleChange
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

