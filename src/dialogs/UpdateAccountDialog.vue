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
  <Dialog :controller="controller" :width="624">

    <!-- title -->
    <template #dialogTitle>
      <DialogTitle>Account Update</DialogTitle>
    </template>

    <!-- input -->
    <template #dialogInput>

      <!-- Account Memo -->
      <ContentCell>
        <template #cellTitle>Account Memo</template>
        <template #cellContent>
          <TextFieldView v-model="memo"
                         placeholder="Memo (string)"
                         style="width: 100%"
          />
        </template>
      </ContentCell>


      <!-- Auto Renew Period -->
      <ContentCell>

        <template #cellTitle>
          Auto Renew Period
          <InfoTooltip
              label="Account auto-renew is not turned on yet. This value is not taken into account for the time being."
          />
        </template>

        <template #cellContent>
          <div style="display: flex; column-gap: 8px; width: 100%">
            <TextFieldView v-model="selectedAutoRenewPeriod"
                           id="selectedAutoRenewPeriod"
                           placeholder="> 0"
                           type="number"
                           min="1"
                           step="1"
                           style="width: 100%"
            />
            <SelectView v-model="selectedUnit" width="100%">
              <option v-for="p in PeriodUnit" :key="p" :value="p"
                      style="background-color: var(--h-theme-page-background-color)">
                {{ p }}
              </option>
            </SelectView>
            <div class="icon is-small ml-2">
              <i v-if="isAutoRenewPeriodValid" class="fas fa-check has-text-success"/>
              <i v-else-if="autoRenewPeriodFeedbackMessage" class="fas fa-xmark has-text-danger"/>
              <i v-else/>
            </div>
          </div>
        </template>

      </ContentCell>

      <hr/>

      <!-- Max. Auto. Associations -->
      <ContentCell>

        <template #cellTitle>
          Max. Auto. Associations
          <span class="ml-1"/>
          <InfoTooltip
              label="Max.Auto.Associations sets the amount of available airdrop slots. Unlimited(-1), Limited(>0), No airdrop slots(0)."
          />
        </template>

        <template #cellContent>
          <div style="display: flex; width: 100%">
            <SelectView v-model="autoAssociationMode" width="100%">
              <option :key="0" :value="0" style="background-color: var(--h-theme-page-background-color)">
                No Automatic Association
              </option>
              <option :key="1" :value="1" style="background-color: var(--h-theme-page-background-color)">
                Limited Automatic Association
              </option>
              <option :key="-1" :value="-1" style="background-color: var(--h-theme-page-background-color)">
                Unlimited Automatic Association
              </option>
            </SelectView>
            <input v-if="autoAssociationMode==AutoAssociationMode.LimitedAutoAssociation"
                   class="input input-field is-small has-text-white ml-2"
                   style="width: 100px"
                   :class="{'is-invisible':autoAssociationMode!=AutoAssociationMode.LimitedAutoAssociation}"
                   v-model="maxAutoAssociations"
                   placeholder="≥ 0"
                   type="number"
                   min="1"
                   step="1"
            >
            <div v-if="autoAssociationMode!=AutoAssociationMode.UnlimitedAutoAssociation"
                 class="icon is-small ml-2"
            >
              <i v-if="isMaxAutoAssociationsValid" class="fas fa-check has-text-success"/>
              <i v-else-if="maxAutoAssociationsFeedbackMessage" class="fas fa-xmark has-text-danger"/>
              <i v-else/>
            </div>
          </div>
        </template>

      </ContentCell>


      <!-- Receiver Signature Required -->

      <ContentCell direction="horizontal">

        <template #cellTitle>
          <div class="is-flex has-text-weight-light mb-1">
            Receiver Signature Required
          </div>
        </template>

        <template #cellContent>
          <o-switch class="ml-2 h-is-text-size-4" v-model="recSigRequired"/>
        </template>

      </ContentCell>

      <template v-if="enableStaking">

        <hr/>

        <!-- Staking -->

        <ContentCell>

          <template #cellTitle>Staking</template>

          <template #cellContent>
            <div class="h-is-text-size-4">
              <label class="radio h-radio-button">
                <input type="radio" name="stakeTarget" :value="StakeChoice.StakeToNode" v-model="stakeChoice"/>
                To Node
              </label>
              <label class="radio h-radio-button ml-5">
                <input type="radio" name="stakeTarget" :value="StakeChoice.StakeToAccount" v-model="stakeChoice"/>
                To Account
              </label>
              <label class="radio h-radio-button ml-5">
                <input type="radio" name="stakeTarget" :value="StakeChoice.NotStaking" v-model="stakeChoice"/>
                Not Staking
              </label>
            </div>
          </template>

        </ContentCell>

        <!-- Staked Node ID -->

        <template v-if="stakeChoice===StakeChoice.StakeToNode">

          <ContentCell>

            <template #cellTitle>Staked Node ID</template>

            <template #cellContent>
              <SelectView v-model="stakedNode">
                <optgroup label="Hedera council nodes">
                  <option v-for="n in networkAnalyzer.nodes.value" :key="n.node_id" :value="n.node_id"
                          style="background-color: var(--h-theme-page-background-color)"
                          v-show="isCouncilNode(n)"
                  >
                    {{ makeNodeSelectorDescription(n) }}
                  </option>
                </optgroup>
                <optgroup v-if="networkAnalyzer.hasCommunityNode.value" label="Community nodes">
                  <option v-for="n in networkAnalyzer.nodes.value" :key="n.node_id" :value="n.node_id"
                          style="background-color: var(--h-theme-page-background-color)"
                          v-show="!isCouncilNode(n)"
                  >
                    {{ makeNodeSelectorDescription(n) }}
                  </option>
                </optgroup>
              </SelectView>
            </template>

          </ContentCell>

        </template>

        <!-- Staked Account ID -->

        <template v-if="stakeChoice===StakeChoice.StakeToAccount">

          <ContentCell>

            <template #cellTitle>Staked Account ID</template>/>

            <template #cellContent>
              <div style="display:flex; align-items: center;">
                <input :value="stakedAccount"
                       class="input input-field is-small has-text-white"
                       placeholder="Account ID (0.0.1234)"
                       type="text"
                       @input="event => onStakedAccountInput(event)"
                >
                <div class="icon is-small ml-2">
                  <i v-if="isStakedAccountValid" class="fas fa-check has-text-success"/>
                  <i v-else-if="stakedAccountFeedbackMessage" class="fas fa-xmark has-text-danger"/>
                  <i v-else/>
                </div>
              </div>
            </template>

          </ContentCell>


        </template>

        <!-- Filler -->

        <template v-if="stakeChoice===StakeChoice.NotStaking">
          <div style="visibility: hidden">
            <ContentCell>
              <template #cellTitle>Filler</template>
              <template #cellContent>Filler</template>
            </ContentCell>
          </div>
        </template>

        <div class="mb-4"/>

        <!-- Decline Rewards -->

        <div :class="{'is-invisible':stakeChoice !== StakeChoice.StakeToNode}" style="width: 100%">
          <ContentCell direction="horizontal">
            <template #cellTitle>Decline Rewards</template>
            <template #cellContent>
              <o-switch class="ml-2 h-is-text-size-4" v-model="declineRewards"/>
            </template>
          </ContentCell>
        </div>

      </template>

    </template>

    <!-- busy -->
    <template #dialogBusy>
      <div class="h-is-tertiary-text mb-4">
        Connecting to Hedera Network using your wallet…
      </div>
      <div class="h-is-property-text">
        Check your wallet for any approval request
      </div>
    </template>

    <!-- success -->
    <template #dialogSuccess>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-success ml-0">
          <i class="fas fa-check"/>
        </div>
        <div class="h-is-tertiary-text mb-4">
          Operation completed
        </div>
      </div>
      <div v-if="formattedTransactionId" class="h-is-property-text">
        {{ 'With transaction ID: ' + formattedTransactionId }}
      </div>
    </template>

    <!-- error -->
    <template #dialogError>
      <div class="is-flex is-align-items-baseline">
        <div class="icon is-medium has-text-danger">
          <span style="font-size: 18px; font-weight: 900">X</span>
        </div>
        <div class="h-is-tertiary-text mb-4">
          {{ errorMessage }}
        </div>
      </div>
      <div class="h-is-property-text">
        {{ errorMessageDetails }}
      </div>
    </template>

    <!-- user feedback -->
    <template #dialogFeedback>
      <div class="h-is-property-text">
        {{ stakedAccountFeedbackMessage ?? autoRenewPeriodFeedbackMessage ?? maxAutoAssociationsFeedbackMessage }}
      </div>
    </template>

    <template #dialogInputButtons>
      <DialogButton :controller="controller">CANCEL</DialogButton>
      <CommitButton :controller="controller" :enabled="isInputValid" @action="onUpdate">UPDATE</CommitButton>
    </template>

  </Dialog>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {computed, onBeforeUnmount, onMounted, PropType, ref, watch, WatchStopHandle} from "vue";
import {DialogController, DialogMode} from "@/dialogs/core/dialog/DialogController.ts";
import {extractChecksum, isCouncilNode, stripChecksum, waitForTransactionRefresh} from "@/schemas/MirrorNodeUtils.ts";
import {TransactionID} from "@/utils/TransactionID.ts";
import {WalletClientError, WalletClientRejectError} from "@/utils/wallet/client/WalletClient.ts";
import {AccountInfo, makeNodeSelectorDescription} from "@/schemas/MirrorNodeSchemas.ts";
import DialogButton from "@/dialogs/core/dialog/DialogButton.vue";
import CommitButton from "@/dialogs/core/dialog/CommitButton.vue";
import {routeManager, walletManager} from "@/router.ts";
import Dialog from "@/dialogs/core/dialog/Dialog.vue";
import {AccountUpdateTransaction} from "@hashgraph/sdk";
import {inputEntityID} from "@/utils/InputUtils.ts";
import {NetworkAnalyzer} from "@/utils/analyzer/NetworkAnalyzer.ts";
import {EntityID} from "@/utils/EntityID.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache.ts";
import {isSuccessfulResult} from "@/utils/TransactionTools.ts";
import InfoTooltip from "@/components/InfoTooltip.vue";
import {TokenRelationshipCache} from "@/utils/cache/TokenRelationshipCache.ts";
import DialogTitle from "@/dialogs/core/dialog/DialogTitle.vue";
import ContentCell from "@/dialogs/core/ContentCell.vue";
import SelectView from "@/components/SelectView.vue";
import TextFieldView from "@/components/TextFieldView.vue";

const props = defineProps({
  accountInfo: {
    type: Object as PropType<AccountInfo | null>,
    default: null
  },
  controller: {
    type: Object as PropType<DialogController>,
    required: true
  },
})

const emit = defineEmits(["updated"])

const enableStaking = routeManager.enableStaking
const network = routeManager.currentNetwork.value
const nr = NetworkConfig.inject()
const autoRenewPeriodFeedbackMessage = ref<string | null>(null)
const maxAutoAssociationsFeedbackMessage = ref<string | null>(null)
const stakedAccountFeedbackMessage = ref<string | null>(null)

//
// Receiver Signature Required
//
const recSigRequired = ref<boolean>(false)

//
// Auto Renew Period
//
const selectedAutoRenewPeriod = ref<string>("")

enum PeriodUnit {
  Seconds = "seconds",
  Days = 'days',
}

const selectedUnit = ref<PeriodUnit>(PeriodUnit.Seconds)
let periodWatchHandle: WatchStopHandle | null = null
let unitWatchHandle: WatchStopHandle | null = null
onMounted(() => {
  periodWatchHandle = watch(selectedAutoRenewPeriod, () => {
    validateAutoRenewPeriod()
  })
  unitWatchHandle = watch(selectedUnit, () => {
    selectedAutoRenewPeriod.value = ""
    document.getElementById("selectedAutoRenewPeriod")?.focus()
  })
})
onBeforeUnmount(() => {
  if (periodWatchHandle !== null) {
    periodWatchHandle()
    periodWatchHandle = null
  }
  if (unitWatchHandle !== null) {
    unitWatchHandle()
    unitWatchHandle = null
  }
})

//
// Account Memo
//
const memo = ref<string>("")

//
// Max Auto Association
//
const maxAutoAssociations = ref<number | null>(null)

enum AutoAssociationMode {
  UnlimitedAutoAssociation = -1,
  LimitedAutoAssociation = 1,
  NoAutoAssociation = 0
}

const autoAssociationMode = ref<AutoAssociationMode>(AutoAssociationMode.NoAutoAssociation)
let modeWatchHandle: WatchStopHandle | null = null
onMounted(() => {
  modeWatchHandle = watch(autoAssociationMode, (newValue) => {
    switch (newValue) {
      case AutoAssociationMode.LimitedAutoAssociation:
        maxAutoAssociations.value = Math.max(1, initialMaxAutoAssociations ?? 0, usedAutoAssociations.value)
        break
      case AutoAssociationMode.NoAutoAssociation:
        maxAutoAssociations.value = 0
        break
      case AutoAssociationMode.UnlimitedAutoAssociation:
        maxAutoAssociations.value = -1
        break
    }
  })
})
onBeforeUnmount(() => {
  if (modeWatchHandle !== null) {
    modeWatchHandle()
    modeWatchHandle = null
  }
})

//
// Staking
//
const stakedNode = ref<number | null>(null)
const stakedAccount = ref<string | null>("")

enum StakeChoice {
  NotStaking = "not-staking",
  StakeToNode = "node",
  StakeToAccount = "account"
}

const stakeChoice = ref<StakeChoice>(StakeChoice.NotStaking)
const declineRewards = ref<boolean>(false)
let stakedAccountWatchHandle: WatchStopHandle | null = null
let stakeChoiceWatchHandle: WatchStopHandle | null = null
let validationTimerId = -1
onMounted(() => {
  stakedAccountWatchHandle = watch(stakedAccount, () => {
    isStakedAccountValid.value = false
    stakedAccountFeedbackMessage.value = null
    if (validationTimerId != -1) {
      window.clearTimeout(validationTimerId)
      validationTimerId = -1
    }
    if (stakedAccount.value?.length) {
      validationTimerId = window.setTimeout(() => validateAccount(), 500)
    } else {
      stakedAccount.value = null
    }
  })
  stakeChoiceWatchHandle = watch(stakeChoice, (newValue) => {
    stakedAccountFeedbackMessage.value = null
    if (newValue === StakeChoice.StakeToAccount) {
      validateAccount()
    }
  })
})
onBeforeUnmount(() => {
  if (stakedAccountWatchHandle !== null) {
    stakedAccountWatchHandle()
    stakedAccountWatchHandle = null
  }
  if (stakeChoiceWatchHandle !== null) {
    stakeChoiceWatchHandle()
    stakeChoiceWatchHandle = null
  }
})

//
// Saving initial values
//
let initialRecSigRequired = false
let initialAutoRenewPeriod: number | null = 0
let initialMemo = ""
let initialMaxAutoAssociations: number | null = null
let initialStakeChoice = StakeChoice.NotStaking
let initialStakedNode: number | null = null
let initialStakedAccount = ""
let initialDeclineRewards = false

//
// Dialog initialization
//
let visibleWatchHandle: WatchStopHandle | null = null
onMounted(() => {
  visibleWatchHandle = watch(props.controller?.visible, async (newValue) => {
    if (newValue) {
      usedAutoAssociations.value = await findUsedAutoAssociations()
      recSigRequired.value = props.accountInfo?.receiver_sig_required ?? false
      selectedAutoRenewPeriod.value = props.accountInfo?.auto_renew_period?.toString() ?? ""
      selectedUnit.value = PeriodUnit.Seconds
      memo.value = props.accountInfo?.memo ?? ""
      maxAutoAssociations.value = props.accountInfo?.max_automatic_token_associations ?? null
      autoAssociationMode.value =
          props.accountInfo?.max_automatic_token_associations === -1 ? AutoAssociationMode.UnlimitedAutoAssociation
              : (props.accountInfo?.max_automatic_token_associations ?? 0) > 0 ? AutoAssociationMode.LimitedAutoAssociation
                  : AutoAssociationMode.NoAutoAssociation
      stakedNode.value = props.accountInfo?.staked_node_id ?? null
      stakedAccount.value = props.accountInfo?.staked_account_id ?? ""
      stakeChoice.value =
          (props.accountInfo?.staked_node_id ?? null) !== null ? StakeChoice.StakeToNode
              : (props.accountInfo?.staked_account_id ?? null) !== null ? StakeChoice.StakeToAccount
                  : StakeChoice.NotStaking
      declineRewards.value = props.accountInfo?.decline_reward ?? false

      initialRecSigRequired = recSigRequired.value
      initialAutoRenewPeriod = props.accountInfo?.auto_renew_period ?? null
      initialMemo = memo.value
      initialMaxAutoAssociations = maxAutoAssociations.value
      initialStakeChoice = stakeChoice.value
      initialStakedNode = stakedNode.value
      initialStakedAccount = stakedAccount.value
      initialDeclineRewards = declineRewards.value
    } else {
      usedAutoAssociations.value = 0
      recSigRequired.value = false
      selectedAutoRenewPeriod.value = ""
      selectedUnit.value = PeriodUnit.Seconds
      memo.value = ""
      maxAutoAssociations.value = null
      autoAssociationMode.value = AutoAssociationMode.NoAutoAssociation
      stakeChoice.value = StakeChoice.NotStaking
      stakedNode.value = null
      stakedAccount.value = ""
      declineRewards.value = false
    }
  }, {immediate: true})
})
onBeforeUnmount(() => {
  if (visibleWatchHandle !== null) {
    visibleWatchHandle()
    visibleWatchHandle = null
  }
})

const findUsedAutoAssociations = async () : Promise<number> => {
  let count = 0
  const relationships = (await TokenRelationshipCache.instance.lookup(walletManager.accountId.value!)) ?? []
  for (const r of relationships) {
    if (r.automatic_association) {
      count += 1
    }
  }
  return Promise.resolve(count)
}

//
// Validation
//
const isAccountEdited = computed(() =>
    (recSigRequired.value !== initialRecSigRequired)
    || (autoRenewPeriodInSeconds.value !== initialAutoRenewPeriod)
    || (memo.value !== initialMemo)
    || (maxAutoAssociations.value !== initialMaxAutoAssociations)
    || (stakedNode.value !== initialStakedNode)
    || (stakedAccount.value !== initialStakedAccount)
    || (declineRewards.value !== initialDeclineRewards)
)
const isInputValid = computed(() =>
    isAccountEdited.value
    && isAutoRenewPeriodValid.value
    && isMaxAutoAssociationsValid.value
    && isStakingValid.value
)

//
// StakedAccount validation
//
const networkAnalyzer = new NetworkAnalyzer()
onMounted(() => networkAnalyzer.mount())
onBeforeUnmount(() => networkAnalyzer.unmount())
const onStakedAccountInput = (event: Event) => {
  const newValue = inputEntityID(event, stakedAccount.value)
  if (newValue === stakedAccount.value) {
    stakedAccount.value = null // to force reactivity
  }
  stakedAccount.value = newValue
}
const validateAccount = async () => {
  if (stakedAccountEntity.value === null) {
    stakedAccountFeedbackMessage.value = "Invalid account ID"
  } else if (stakedAccountEntity.value === walletManager.accountId.value) {
    stakedAccountFeedbackMessage.value = "Staking needs to be to a different account"
  } else if (stakedAccountChecksum.value !== null
      && !nr.isValidChecksum(stakedAccountEntity.value, stakedAccountChecksum.value, network)) {
    stakedAccountFeedbackMessage.value = "Invalid account checksum"
  } else {
    if (await AccountByIdCache.instance.lookup(stakedAccountEntity.value)) {
      isStakedAccountValid.value = true
    } else {
      stakedAccountFeedbackMessage.value = "Unknown account ID"
    }
  }
}
const stakedAccountEntity = computed(() =>
    EntityID.normalize(stripChecksum(stakedAccount.value ?? ""))
)
const stakedAccountChecksum = computed(() =>
    extractChecksum(stakedAccount.value ?? "")
)
const isStakedAccountValid = ref<boolean>(false)
const isStakingValid = computed(() =>
    isStakedAccountValid.value || stakeChoice.value !== StakeChoice.StakeToAccount
)

//
// MaxAutoAssociation validation
//
const isMaxAutoAssociationsValid = ref(false)
const usedAutoAssociations = ref(0)
let maxAutoAssociationsWatchHandle: WatchStopHandle | null = null
onMounted(() => {
  maxAutoAssociationsWatchHandle = watch(maxAutoAssociations, async (max) => {
    if (max === null) {
      isMaxAutoAssociationsValid.value = false
      maxAutoAssociationsFeedbackMessage.value = null
    } else {
      isMaxAutoAssociationsValid.value = max >= usedAutoAssociations.value || max === -1
      if (!isMaxAutoAssociationsValid.value) {
        maxAutoAssociationsFeedbackMessage.value =
            `Your account already uses ${usedAutoAssociations.value} automatic associations.`
      } else {
        maxAutoAssociationsFeedbackMessage.value = null
      }
    }
  })
})
onBeforeUnmount(() => {
  if (maxAutoAssociationsWatchHandle !== null) {
    maxAutoAssociationsWatchHandle()
    maxAutoAssociationsWatchHandle = null
  }
})

//
// AutoRenewPeriod validation
//
const MAX_AUTO_RENEW_PERIOD = 8000001 // seconds
const MIN_AUTO_RENEW_PERIOD = 2592000 // seconds
const autoRenewPeriodInSeconds = computed(() =>
    normalizePeriod(parseInt(selectedAutoRenewPeriod.value), selectedUnit.value)
)
const isAutoRenewPeriodValid = ref<boolean>(false)
const validateAutoRenewPeriod = () => {
  if (autoRenewPeriodInSeconds.value >= MIN_AUTO_RENEW_PERIOD && autoRenewPeriodInSeconds.value <= MAX_AUTO_RENEW_PERIOD) {
    isAutoRenewPeriodValid.value = true
    autoRenewPeriodFeedbackMessage.value = null
  } else {
    isAutoRenewPeriodValid.value = false
    if (selectedUnit.value == PeriodUnit.Days) {
      autoRenewPeriodFeedbackMessage.value = `Auto Renew Period must be comprised between 30 and 92 days.`
    } else {
      autoRenewPeriodFeedbackMessage.value = `Auto Renew Period must be comprised between ${MIN_AUTO_RENEW_PERIOD} and ${MAX_AUTO_RENEW_PERIOD} seconds.`
    }
  }
}

//
// Handling the Account Update Transaction
//
const tid = ref<string | null>(null)
const formattedTransactionId = computed(() =>
    tid.value != null ? TransactionID.normalize(tid.value, true) : null
)
const errorMessage = ref<string | null>(null)
const errorMessageDetails = ref<string | null>(null)
const onUpdate = async () => {
  props.controller.mode.value = DialogMode.Busy
  tid.value = null

  try {

    const transaction = new AccountUpdateTransaction()
    if (memo.value !== initialMemo) {
      transaction.setAccountMemo(memo.value)
    }
    if (maxAutoAssociations.value !== initialMaxAutoAssociations) {
      transaction.setMaxAutomaticTokenAssociations(Number(maxAutoAssociations.value))
    }
    if (recSigRequired.value !== initialRecSigRequired) {
      transaction.setReceiverSignatureRequired(recSigRequired.value)
    }
    const updatedAutoRenewPeriod = normalizePeriod(parseInt(selectedAutoRenewPeriod.value), selectedUnit.value)
    if (updatedAutoRenewPeriod !== initialAutoRenewPeriod) {
      transaction.setAutoRenewPeriod(updatedAutoRenewPeriod)
    }
    if (stakeChoice.value !== initialStakeChoice
        || stakedAccount.value !== initialStakedAccount
        || stakedNode.value !== initialStakedNode) {
      switch (stakeChoice.value) {
        case StakeChoice.StakeToNode:
          transaction.setStakedNodeId(stakedNode.value)
          break
        case StakeChoice.StakeToAccount:
          transaction.setStakedAccountId(stakedAccount.value!)
          break
        case StakeChoice.NotStaking:
          transaction.setStakedNodeId(-1)
          transaction.setStakedAccountId("0.0.0")
          break
      }
    }
    if (declineRewards.value !== initialDeclineRewards) {
      transaction.setDeclineStakingReward(declineRewards.value)
    }

    tid.value = TransactionID.normalize(
        await walletManager.updateAccount(transaction)
    )
    if (tid.value) {
      const transaction: any = await waitForTransactionRefresh(tid.value, 10, 3000)
      if ('result' in transaction) {
        if (transaction.result != null && isSuccessfulResult(transaction.result)) {
          props.controller.mode.value = DialogMode.Success
          emit('updated')
        } else {
          props.controller.mode.value = DialogMode.Error
          errorMessage.value = "Transaction failed"
          errorMessageDetails.value = transaction.result
        }
      } else {
        props.controller.mode.value = DialogMode.Success
      }
    } else {
      props.controller.mode.value = DialogMode.Error
      errorMessage.value = "Operation did not complete"
      errorMessageDetails.value = "Cannot find resulting transaction"
    }

  } catch (reason) {

    console.warn("Transaction Error: " + reason)
    if (reason instanceof WalletClientRejectError) {
      props.controller.handleClose()
    } else {
      props.controller.mode.value = DialogMode.Error
      if (reason instanceof WalletClientError) {
        errorMessage.value = reason.message
        errorMessageDetails.value = reason.extra
      } else {
        errorMessage.value = "Operation did not complete"
        errorMessageDetails.value = reason instanceof Error ? JSON.stringify(reason.message) : JSON.stringify(reason)
      }
    }

  }
}

const normalizePeriod = (period: number, unit: PeriodUnit) => unit === PeriodUnit.Days ? period * 86400 : period

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.input-field {
  height: 38px;
  border-width: 1px;
  border-color: grey;
  background-color: var(--h-theme-page-background-color);
}

hr {
  height: 1px;
  background-color: var(--network-theme-color);
  width: 100%;
  margin: 0 0 0 0;
}

</style>
