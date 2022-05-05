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
<!--                                                     TEMPLATE   v-on:click="clicked"                                                  -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <div class="is-flex is-align-items-center">
    <span v-if="isAutoPaused" class="h-is-text-size-1 h-is-dense">REFRESH PAUSED</span>
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

export default defineComponent({
  name: "PlayPauseButton",

  props: {
    modelValue: String as PropType<PlayPauseState>
  },

  setup(props, context) {

    const isPlaying = computed(() => {
      return (props.modelValue ?? PlayPauseState.Pause) == PlayPauseState.Play
    })
    const isAutoPaused = computed(() => {
      return (props.modelValue ?? PlayPauseState.Pause) == PlayPauseState.AutoPause
    })

    const handleClick = () => {
      let newValue: PlayPauseState
      switch(props.modelValue) {
        default:
        case PlayPauseState.Play:
          newValue = PlayPauseState.Pause
          break
        case PlayPauseState.Pause:
        case PlayPauseState.AutoPause:
          newValue = PlayPauseState.Play
          break
      }
      // modelValueState.value = newValue
      context.emit('update:modelValue', newValue) // => loopback will update props.modelValue
    }


    return {
      isPlaying,
      isAutoPaused,
      handleClick
    }
  }
});

export enum PlayPauseState { Play = "PLAY", Pause = "PAUSE", AutoPause = "AUTO_PAUSE" }

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>