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

  <ConfirmDialog v-model:show-dialog="showConfirmDialog" :main-message="confirmMessage"
                 @onConfirm="handleConfirmChange" @onCancel="handleCancelChange">
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">Change Staking </span>
      <span v-if="accountId" class="h-is-tertiary-text"> for account </span>
      <span v-if="accountId" class="h-is-secondary-text has-text-weight-light mr-3"
            style="line-height: 36px">{{ accountId }}</span>
    </template>
  </ConfirmDialog>

  <div :class="{'is-active': showDialog}" class="modal has-text-white">
    <div class="modal-background"/>
    <div class="modal-content" style="width: 768px; border-radius: 16px">
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
            <StringValue v-if="account" :string-value="currentlyStakedTo"/>
          </template>
        </Property>

        <div class="columns">
          <div class="column is-one-third has-text-weight-light">
            Stake To
          </div>
          <div class="column">
            <div class="is-flex">
              <div class="control" style="width: 10rem">
                <label class="radio h-radio-button">
                  <input name="stakeTarget" type="radio" value="node" v-model="stakeChoice">
                  Node
                </label>
              </div>
              <o-field>
                <o-select v-model="selectedNode" :disabled="!isNodeSelected"
                          class="h-is-text-size-1" style="border-radius: 4px">
                  <option v-for="n in nodes" :key="n.node_id" :value="n.node_id"
                          style="background-color: var(--h-theme-box-background-color)">
                    {{ makeNodeDescription(n) }}
                  </option>
                </o-select>
              </o-field>
            </div>
            <div class="is-flex mt-2">
              <div class="control" style="width: 10rem">
                <label class="radio h-radio-button ml-0">
                  <input name="stakeTarget" type="radio" value="account" v-model="stakeChoice">
                  Other Account
                </label>
              </div>
              <o-field>
                <o-input v-model="selectedAccount" placeholder="0.0.1234" :disabled="!isAccountSelected"
                         style="width: 12rem; color: white; background-color: var(--h-theme-box-background-color) ">
                </o-input>
              </o-field>
            </div>
          </div>
        </div>

        <div class="columns">
          <div class="column is-one-third has-text-weight-light">
            Decline Rewards
          </div>
          <div class="column">
            <label class="checkbox">
              <input checked="checked" type="checkbox" v-model="declineChoice" :disabled="!isNodeSelected || selectedNode == null">
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
          <button class="button is-info is-small ml-4"
                  :disabled="!enableChangeButton" @click="handleChange">CHANGE</button>
        </div>

      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, onMounted, PropType, ref, watch} from "vue";
import {AccountBalanceTransactions, NetworkNode, NetworkNodesResponse} from "@/schemas/HederaSchemas";
import Property from "@/components/Property.vue";
import HbarAmount from "@/components/values/HbarAmount.vue";
import StringValue from "@/components/values/StringValue.vue";
import axios from "axios";
import {operatorRegistry} from "@/schemas/OperatorRegistry";
import {EntityID} from "@/utils/EntityID";
import ConfirmDialog from "@/components/ConfirmDialog.vue";

export default defineComponent({
  name: "StakingDialog",
  components: {ConfirmDialog, StringValue, HbarAmount, Property},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    account: Object as PropType<AccountBalanceTransactions>,
    currentlyStakedTo: String,
  },
  emits: [ "changeStaking", "update:showDialog"],
  setup(props, context) {
    const accountId = computed(() => props.account?.account)

    const showConfirmDialog = ref(false)
    const confirmMessage = computed(() => {
          let result: string
          if (isNodeSelected.value) {
            if (selectedNode.value !== props.account?.staked_node_id) {
              result = "Do you want to stake to " + selectedNodeDescription.value + "?"
            } else {
              result = declineChoice.value ? "Do you want to decline rewards?" : "Do you want to accept rewards?"
            }
          } else {
            result = "Do you want to stake to account " + selectedAccount.value
          }
          return result
        })

    const stakeChoice = ref("node")
    const isNodeSelected = computed(() => stakeChoice.value === 'node')
    const isAccountSelected = computed(() => stakeChoice.value === 'account')

    const selectedAccount = ref<string|null>(null)
    const isSelectedAccountValid = ref(true)
    watch(selectedAccount, () => {
      if (selectedAccount.value?.length) {
        isSelectedAccountValid.value = isValidEntityId(selectedAccount.value ?? "")
      } else {
        isSelectedAccountValid.value = false
        selectedAccount.value = null
      }
    })

    const selectedNode = ref<number|null>(null)
    const selectedNodeDescription = computed(() => {
      return (selectedNode.value && nodes.value) ? makeNodeDescription(nodes.value[selectedNode.value]) : null
    })
    watch(accountId, () => {
      if ( isNodeSelected.value && selectedNode.value == null) {
        selectedNode.value = props.account?.staked_node_id ?? null
      }
    })

    const declineChoice = ref(false)
    watch(accountId, () => declineChoice.value = props.account?.decline_reward ?? false)

    const enableChangeButton = computed(() => {
      return (isAccountSelected.value && isSelectedAccountValid.value && props.account?.staked_account_id != selectedAccount.value)
          || (isNodeSelected.value  && selectedNode.value && props.account?.staked_node_id != selectedNode.value)
          || (props.account?.decline_reward != declineChoice.value)
    })

    const handleCancel = () => {
      context.emit('update:showDialog', false)
    }

    const handleChange = () => {
      context.emit('update:showDialog', false)
      showConfirmDialog.value = true
    }

    const handleCancelChange = () => {
      context.emit('update:showDialog', true)
    }

    const handleConfirmChange = () => {
      const declineReward = declineChoice.value != props.account?.decline_reward ? declineChoice.value : null;
      context.emit("changeStaking", selectedNode.value, selectedAccount.value, declineReward)
    }

    const isValidEntityId = (entity: string) => {
      return EntityID.parse(entity, true) != null
    }

    //
    // Nodes
    //
    const nodes = ref<Array<NetworkNode> | null>([])

    const totalStaked = computed(() => {
      let result = 0
      if (nodes.value) {
        for (const n of nodes.value) {
          if (n.stake) {
            result += n.stake
          }
        }
      }
      return result
    })

    const fetchNodes = (nextUrl: string | null = null) => {
      const url = nextUrl ?? "api/v1/network/nodes"
      axios
          .get<NetworkNodesResponse>(url, {params: {limit: 25}})
          .then(result => {
            if (result.data.nodes) {
              nodes.value = nodes.value ? nodes.value.concat(result.data.nodes) : result.data.nodes
            }
            const next = result.data.links?.next
            if (next) {
              fetchNodes(next)
            }
          })
    }

    onMounted(() => fetchNodes())

    const makeNodeDescription = (node: NetworkNode) => {
      let result
      if (node.description) {
        result = node.description
      } else {
        result = node.node_account_id ? operatorRegistry.lookup(node.node_account_id)?.getDescription() : null
      }
      return result
    }

    return {
      accountId,
      showConfirmDialog,
      confirmMessage,
      stakeChoice,
      isNodeSelected,
      isAccountSelected,
      selectedAccount,
      selectedNode,
      selectedNodeDescription,
      declineChoice,
      enableChangeButton,
      nodes,
      totalStaked,
      handleCancel,
      handleChange,
      handleCancelChange,
      handleConfirmChange,
      makeNodeDescription
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

