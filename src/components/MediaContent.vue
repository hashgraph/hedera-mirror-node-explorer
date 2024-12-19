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

  <div class="media-container mt-1"
       :class="{'media-container-background': !mediaLoaded}"
       :style="containerStyle"
       @click="onClick"
  >

    <!--  PLACE-HOLDER  -->
    <div id="media-placeholder"
         :class="{'is-invisible': !showPlaceHolder}"
         class="media-content is-flex is-align-items-center"
    >
      <slot name="placeHolder"></slot>
    </div>

    <!--  SPINNER  -->
    <span :class="{'is-invisible': !showSpinner, 'h-is-primary-title': size >= 100}"
          class="media-content loader is-inline-block"
    />

    <!--  IMAGE PREVIEW  -->
    <template v-if="imageUrl">
      <figure
          id="image-content"
          class="media-content">
        <img :class="{'is-invisible': !mediaLoaded}" alt=""
             :style="contentStyle"
             :src="imageUrl"
             @error="onLoadError"
             @load="onLoadSuccess"
        >
      </figure>
    </template>

    <!--  VIDEO PREVIEW  -->
    <template v-else-if="videoUrl">
      <video
          id="video-content"
          class="media-content"
          :style="contentStyle"
          :autoplay="auto"
          :controls="!auto && size >= 100"
          loop
          @error="onLoadError"
          @loadeddata="onLoadSuccess"
      >
        <source :src="videoUrl" :type="type ?? ''"/>
      </video>
    </template>

    <!--  NO USABLE CONTENT (place-holder will be shown)  -->
    <template v-else/>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, ComputedRef, defineComponent, onBeforeUnmount, onMounted, PropType, ref} from "vue";

const MEDIA_LOAD_TIMEOUT = 10000

export default defineComponent({
  name: "MediaContent",
  components: {},

  props: {
    url: {
      type: String as PropType<string | null>,
      default: null
    },
    type: {
      type: String as PropType<string | null>,
      default: null
    },
    size: {
      type: Number,
      default: 50
    },
    auto: {
      type: Boolean,
      default: false
    },
    noAnchor: {
      type: Boolean,
      default: false
    },
  },

  emits: ['onLoadSuccess', 'onLoadError'],

  setup(props, ctx) {

    const videoUrl: ComputedRef<string | null> = computed(
        () => props.type?.startsWith('video') || props.type?.startsWith('audio')
            ? props.url
            : null
    )
    const imageUrl: ComputedRef<string | null> = computed(
        () => videoUrl.value === null || props.type?.startsWith('image')
            ? props.url
            : null
    )
    const plainFileUrl: ComputedRef<string | null> = computed(
        () => videoUrl.value === null && imageUrl.value === null
            ? props.url
            : null
    )

    const containerStyle = computed(() => {
      return {
        width: props.size + 'px',
        height: props.size + "px"
      }
    })

    const contentStyle = computed(() => {
      return {
        'width': '100%',
        'max-width': props.size - 2 + 'px',
        'max-height': props.size - 2 + 'px'
      }
    })

    const mediaLoaded = ref(false)
    const onLoadSuccess = () => {
      mediaLoaded.value = true
      stopTimeout()
      ctx.emit('onLoadSuccess')
    }

    const mediaError = ref(false)
    const onLoadError = () => {
      mediaError.value = true
      ctx.emit('onLoadError')
    }

    const showSpinner = computed(
        () => (props.url) && !mediaLoaded.value && !mediaError.value
    )

    const showPlaceHolder = computed(
        () => !props.url || mediaError.value
    )

    const onClick = () => {
      if (props.url && !props.noAnchor) {
        window.location.assign(props.url)
      }
    }

    onMounted(() => {
      startTimeout()
    })
    onBeforeUnmount(() => {
      stopTimeout()
    })

    let timeoutID = -1
    const startTimeout = () => {
      if (props.url !== null && timeoutID === -1) {
        timeoutID = window.setTimeout(() => {
          mediaError.value = true
          timeoutID = -1
        }, MEDIA_LOAD_TIMEOUT)
      }
    }
    const stopTimeout = () => {
      if (timeoutID !== -1) {
        window.clearTimeout(timeoutID)
        timeoutID = -1
      }
    }

    return {
      videoUrl,
      imageUrl,
      plainFileUrl,
      containerStyle,
      contentStyle,
      mediaLoaded,
      mediaError,
      showSpinner,
      showPlaceHolder,
      onLoadSuccess,
      onLoadError,
      onClick,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.media-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr;
  place-items: center;
}

.media-container-background {
  background-color: var(--background-primary);
  border: solid 1px grey;
}

.media-content {
  grid-column-start: 1;
  grid-row-start: 1;
}

video, img {
  object-fit: contain;
  object-position: center;
}

</style>
