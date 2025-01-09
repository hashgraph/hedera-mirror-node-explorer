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
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <button
      class="button-view"
      :class="{'is-small': props.isSmall,'is-default': props.isDefault}"
      :disabled="!props.enabled"
      @click="handleClick"
  >
    <slot/>
  </button>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

const props = defineProps({
  enabled: {
    type: Boolean,
    default: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isSmall: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(["action"])

const handleClick = () => {
  emit("action")
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

button.button-view {
  appearance: none;
  color: var(--button-text-secondary);
  background-color: var(--button-background-secondary);
  border-radius: 32px;
  font-family: "Styrene A Web", sans-serif;
  font-size: 14px;
  font-weight: 500;
  height: 48px;
  padding: 15px 24px 15px 24px;
}

button.button-view.is-small {
  border-radius: 24px;
  height: 40px;
  padding: 11px 24px 11px 24px;
}

button.button-view:disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

button.button-view.is-default {
  color: var(--button-text-primary);
  background-color: var(--button-background-primary);
}

</style>
