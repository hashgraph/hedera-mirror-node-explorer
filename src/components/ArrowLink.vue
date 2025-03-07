// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <router-link :to="props.route">
    <div class="arrow-link">
      <span class="link-text">{{ props.text }}</span>
      <ArrowRight :size="16" />
    </div>
  </router-link>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {PropType} from "vue";
import {ArrowRight} from "lucide-vue-next";
import {RouteLocationRaw} from "vue-router";

const props = defineProps({
  text: {
    type: String,
    required: true
  },
  route: {
    type: Object as PropType<RouteLocationRaw>,
    required: true
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.arrow-link {
  align-items: center;
  color: var(--icon-default-color);
  display: flex;
  gap: 2px;
  height: 18px;
}

span.link-text {
  font-family: var(--font-family-heading), sans-serif;
  font-size: 14px;
  font-weight: 400;
}

</style>
