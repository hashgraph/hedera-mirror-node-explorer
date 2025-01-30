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
  <div class="shy-scope">
    <slot name="content"/>
    <div v-if="enableCopy && contentToCopy" id="shyCopyButton" class="shy">
      <div class="copy-mask"/>
      <div v-if="enableCopy" class="copy-button-container">
        <button class="copy-button" v-on:click.stop="copyToClipboard">Copy</button>
      </div>
    </div>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

const props = defineProps({
  contentToCopy: String,
  enableCopy: {
    type: Boolean,
    default: true
  },
})

const emit = defineEmits(['copyMade'])

const copyToClipboard = (): void => {
  if (props.contentToCopy?.length) {
    navigator.clipboard.writeText(props.contentToCopy)
    emit('copyMade')
  }
}

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.shy-scope {
  display: inline-block;
  position: relative;
}

div.shy {
  display: none;
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%
}

div.shy-scope:hover > div.shy {
  display: block;
}

div.copy-mask {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.50);
  border-width: 0;
  border-radius: 4px;
}

div.copy-button-container {
  position: absolute;
  display: inline-block;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

button.copy-button {
  background-color: var(--copy-button-background);
  border-radius: 16px;
  color: var(--copy-button-text);
  font-size: 12px;
  height: 28px;
  padding: 6px 12px;
  width: 100px;
}

button.copy-button:active {
  opacity: 75%;
}

</style>
