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
  <div :class="{'box': !isTouchDevice && isSmallScreen, 'h-box-border': !isTouchDevice && isSmallScreen}" style="height: 100%">
    <div class="is-flex is-align-items-center is-justify-content-space-between">
      <div>
        <slot name="title"></slot>
      </div>
      <div>
        <slot name="control"></slot>
      </div>
    </div>

    <hr class="h-card-separator mb-3"/>

    <div class="h-is-property-text">
      <slot name="content"></slot>
    </div>

    <div class="columns is-multiline h-is-property-text">

      <div class="column" :class="{'is-full': !isMediumScreen}">
          <slot name="leftContent"></slot>
      </div>
      <div class="column" :class="{'h-has-column-separator':slots.rightContent&&isMediumScreen}">
          <slot name="rightContent"></slot>
      </div>

    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, inject, useSlots} from "vue";

export default defineComponent({
  name: "DashboardCard",

  props: {
    subtitle: Boolean
  },

  setup() {
    const isSmallScreen = inject('isSmallScreen', true)
    const isMediumScreen = inject('isMediumScreen', true)
    const isTouchDevice = inject('isTouchDevice', false)
    const slots = useSlots()
    return { isSmallScreen, isMediumScreen, isTouchDevice, slots }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

td {
  border: black
}

</style>
