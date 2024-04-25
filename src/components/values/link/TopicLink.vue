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

  <div class="is-inline-block">

    <EntityLink :route="topicRoute">
      <TopicIOL :topic-id="topicId"/>
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
import TokenIOL from "@/components/values/link/TokenIOL.vue";
import EntityLink from "@/components/values/link/EntityLink.vue";

export default defineComponent({
  name: "TopicLink",
  components: {EntityLink, TokenIOL, TopicIOL},

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

<style/>

