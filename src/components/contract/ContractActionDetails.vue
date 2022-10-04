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

  <div>{{ jsonText }}</div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

//
// defineComponent
//

import {computed, defineComponent, inject, PropType} from "vue";
import EmptyTable from "@/components/EmptyTable.vue";
import {ContractAction} from "@/schemas/HederaSchemas";
import {ORUGA_MOBILE_BREAKPOINT} from "@/App.vue";

export default defineComponent({
  name: 'ContractActionDetails',

  components: {EmptyTable},

  props: {
    action: Object as PropType<ContractAction | undefined>,
  },

  setup(props) {
    const isTouchDevice = inject('isTouchDevice', false)
    const isMediumScreen = inject('isMediumScreen', true)

    const jsonText = computed(() => JSON.stringify(props.action, null, 2))

    return {
      isTouchDevice,
      isMediumScreen,
      ORUGA_MOBILE_BREAKPOINT,
      jsonText,
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
</style>
