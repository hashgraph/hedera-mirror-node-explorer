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

  <div
      id="notificationBanner"
      class="notification-banner"
      :class="{'notification-error': props.isError, 'notification-success': !props.isError}"
  >
    <div
        class="notification-text"
        v-html="props.message"
    />
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  isError: {
    type: Boolean,
    default: true
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>

div.notification-banner {
  padding-top: 9px;
  padding-bottom: 11px;
}

.notification-error {
  background-color: var(--status-error-color);
}

.notification-success {
  background-color: var(--text-accent2);
}

.notification-text {
  color: white;
  font-family: "Styrene A Web", sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
}

</style>