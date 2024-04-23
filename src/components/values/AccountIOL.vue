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

  <div v-if="accountId === null">
    {{ nullLabel }}
  </div>

  <div v-else-if="accountId" class="is-inline-block">

    <template v-if="label !== null">
      <EntityLabel
          :id="accountId"
          :compact="true"
      />
    </template>

    <template v-else>
      <span class="is-numeric">
        {{ accountId ?? "" }}
      </span>
    </template>

  </div>

  <span v-else-if="showNone && !initialLoading" class="has-text-grey">
    None
  </span>

  <span v-else/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, onBeforeUnmount, onMounted, PropType, ref} from "vue";
import EntityLabel from "@/components/values/EntityLabel.vue";
import {LabelByIdCache} from "@/utils/cache/LabelByIdCache";
import {initialLoadingKey} from "@/AppKeys";

export default defineComponent({
  name: "AccountIOL",
  components: {EntityLabel},
  props: {
    accountId: {
      type: String as PropType<string | null>,
      default: null
    },
    showNone: {
      type: Boolean,
      default: false
    },
    nullLabel: {
      type: String,
      default: "O"
    }
  },
  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))

    const labelLookup = LabelByIdCache.instance.makeLookup(computed(() => props.accountId))
    onMounted(
        () => labelLookup.mount()
    )
    onBeforeUnmount(
        () => labelLookup.unmount()
    )
    return {
      initialLoading,
      label: labelLookup.entity,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
