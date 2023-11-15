<!--
  -
  - Hedera Mirror Node Explorer
  -
  - Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

  <div v-if="value">
    <EVMAddress v-if="addressValue" :address="addressValue" :compact="!isSmallScreen && !isMediumScreen"/>
    <div v-else :class="{'has-text-grey': lowContrast}" class="is-family-monospace h-is-text-size-3 should-wrap">{{ value }}</div>
    <div v-if="!hideType" class="h-is-extra-text h-is-text-size-3">{{ type }}</div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else class="has-text-grey">None</div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import EVMAddress from "@/components/values/EVMAddress.vue";
import {NameTypeValue} from "@/utils/analyzer/FunctionCallAnalyzer";

export default defineComponent({
  name: 'FunctionValue',
  components: {EVMAddress},
  props: {
    ntv: Object as PropType<NameTypeValue>,
    hideType: {
      type: Boolean,
      default: false,
      required: false,
    },
    lowContrast: {
      type: Boolean,
      default: false,
      required: false
    }
  },

  setup(props) {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const initialLoading = inject(initialLoadingKey, ref(false))

    const addressValue = computed(() => {
      return props.ntv?.type === 'address' ? props.ntv.value as string : null
    })

    return {
      isSmallScreen,
      isMediumScreen,
      initialLoading,
      type: props.ntv?.type,
      value: props.ntv?.value,
      addressValue,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>