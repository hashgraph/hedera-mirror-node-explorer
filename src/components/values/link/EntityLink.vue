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

    <template v-if="route === null">
      <slot/>
    </template>

    <template v-else>
<!--  https://v3.router.vuejs.org/fr/api/#router-link -->
      <router-link :to="route" custom v-slot="{href, navigate}">
        <a :href="href" @click.prevent="willNavigate();navigate()">
          <span class="h-is-hoverable">
            <slot/>
          </span>
        </a>
      </router-link>
    </template>

  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType} from "vue";
import {RouteLocationRaw} from "vue-router";

export default defineComponent({
  name: "EntityLink",
  props: {
    route: {
      type: Object as PropType<RouteLocationRaw|null>,
      default: null
    },
    willNavigate: {
      type: Function as PropType<() => void>,
      default: () => {}
    }
  },
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

