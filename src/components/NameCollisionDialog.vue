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

  <Dialog :controller="controller">
    <template v-slot:dialogTitle>
      <span class="h-is-primary-title">Multiple Registrations</span>
    </template>
    <template v-slot:dialogInput>
      <div class="is-flex is-flex-direction-column h-is-tertiary-text mb-3">
        <p class="mb-2">
          Domain name "{{ matchedDomain }}" is registered with multiple naming services.
        </p>
        <p class="mb-5">Choose which one you want to use:</p>
          <template v-for="r in nameRecords">
            <div class="columns">
              <div class="column is-one-quarter">
                <label class="radio">
                  <input type="radio" class="mr-1" name="provider" :value="r" v-model="selectedRecord"/>
                  {{ r.entityId }}
                </label>
              </div>
              <div class="column has-text-grey">
                {{ findProviderDescription(r.providerAlias) }}
              </div>
            </div>
          </template>
      </div>
    </template>
    <template v-slot:dialogInputButtons>
      <DialogButton :controller="controller"
                    :auto-close="false"
                    @action="onCancel">CANCEL</DialogButton>
      <DialogButton :controller="controller"
                    :auto-close="false"
                    @action="onOK">OK</DialogButton>
    </template>

  </Dialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import {computed, defineComponent, PropType, ref} from 'vue';
import {NameRecord, NameService} from "@/utils/name_service/NameService";
import {DialogController} from "@/components/dialog/DialogController";
import DialogButton from "@/components/dialog/DialogButton.vue";
import Dialog from "@/components/dialog/Dialog.vue";
import {routeManager} from "@/router";
import {AppStorage} from "@/AppStorage";

export default defineComponent({
  name: 'NameCollisionDialog',
  components: {Dialog, DialogButton},
  emits: ["update:nameRecords"],
  props: {
    controller: {
      type: Object as PropType<DialogController>,
      required: true
    },
    nameRecords: {
      type: Object as PropType<NameRecord[]>,
      required: true
    }
  },
  setup(props, ctx) {

    const matchedDomain = computed(
        () => props.nameRecords[0].name)

    const selectedRecord = ref(props.nameRecords[0])

    const onOK = () => {
      const targetAccountId = selectedRecord.value.entityId
      const network = routeManager.currentNetwork.value
      onCancel()
      routeManager.routeToAccount(targetAccountId)
      AppStorage.setNameRecord(targetAccountId, network, selectedRecord.value)
    }

    const onCancel = () => {
      ctx.emit("update:nameRecords", []) // will hide the dialog
    }

    const findProviderDescription = (providerAlias: string): string => {
      const p = NameService.instance.lookupProvider(providerAlias)
      return p?.providerDisplayName ?? providerAlias
    }

    return {
      matchedDomain,
      selectedRecord,
      onCancel,
      onOK,
      findProviderDescription,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped/>
