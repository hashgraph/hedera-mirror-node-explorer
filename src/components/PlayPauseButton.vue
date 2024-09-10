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
    <span v-if="!isPlaying" class="h-is-text-size-1 h-is-dense mr-2">REFRESH PAUSED</span>

    <img v-if="!isPlaying" alt="Play" src="@/assets/play.svg" @click="handleClick" data-cy="playButton">
    <img v-else alt="Pause" src="@/assets/pause.svg" @click="handleClick" data-cy="pauseButton">
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, ComputedRef, defineComponent, onMounted, PropType, ref} from "vue";

export interface PlayPauseController {
  startAutoRefresh(): void

  stopAutoRefresh(): void

  autoRefresh: ComputedRef<boolean>
}

export default defineComponent({
  name: "PlayPauseButton",

  props: {
    controller: Object as PropType<PlayPauseController>
  },

  setup(props) {

    const isPlaying = computed(() => {
      return props.controller && props.controller.autoRefresh.value
    })
    const isAutoStopped = computed(() => {
      return !isPlaying.value && !userRequestedStop.value
    })

    const userRequestedStop = ref(false)
    onMounted(() => userRequestedStop.value = false)
    const handleClick = () => {
      if (props.controller) {
        const controller = props.controller
        if (controller.autoRefresh.value) {
          controller.stopAutoRefresh()
          userRequestedStop.value = true
        } else {
          controller.startAutoRefresh()
          userRequestedStop.value = false
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