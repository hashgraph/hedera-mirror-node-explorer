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

<!--

  USAGE NOTES

  <template>
    ...
    <PlayPauseButton v-bind:controller="TableControllerV3"/>
    ...
  </template>

  <script>
    ...
    const xxxTableController = new XXXTableController()
    ...

    return {
      TableControllerV3: xxxTableController
    }
  </script>

  -->

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE   v-on:click="clicked"                                                  -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <div class="is-flex is-align-items-center">
    <span v-if="isAutoStopped" class="h-is-text-size-1 h-is-dense">REFRESH PAUSED</span>
    <button
        class="button is-small has-text-white ml-2"
        data-cy="playPauseButton"
        style="background-color: #202532; width: 26px; height: 26px; border:1px solid white; border-radius: 0"
        v-on:click="handleClick()">
      <i :class="{ 'fa-play': !isPlaying, 'fa-pause': isPlaying}" class="fas" style="background-color: #202532"/>
    </button>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, PropType} from "vue";
import {TableController} from "@/utils/table/TableController";

export default defineComponent({
  name: "PlayPauseButton",

  props: {
    controller: Object as PropType<TableController<unknown, unknown>>
  },

  setup(props) {

    const isPlaying = computed(() => {
      return props.controller && props.controller.autoRefresh.value
    })
    const isAutoStopped = computed(() => {
      return props.controller && props.controller.autoStopped.value
    })

    const handleClick = () => {
      if (props.controller) {
        const controller = props.controller
        if (controller.autoRefresh.value) {
          controller.stopAutoRefresh()
        } else {
          controller.startAutoRefresh()
        }
      } else {
        console.log("Ignoring click because props.controller is undefined")
      }
    }


    return {
      isPlaying,
      isAutoStopped,
      handleClick
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>