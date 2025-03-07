// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <div class="is-inline-block">
    <EntityLink :route="topicRoute">
      <TopicIOL :topic-id="topicId" />
    </EntityLink>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent} from "vue";
import {routeManager} from "@/router";
import TopicIOL from "@/components/values/link/TopicIOL.vue";
import EntityLink from "@/components/values/link/EntityLink.vue";

export default defineComponent({
  name: "TopicLink",
  components: {EntityLink, TopicIOL},

  props: {
    topicId: String,
  },

  setup(props) {
    const topicRoute = computed(() => props.topicId ? routeManager.makeRouteToTopic(props.topicId) : null)
    return {topicRoute}
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style />

