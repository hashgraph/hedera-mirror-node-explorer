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
  <div class="switch"
       @click="checked = !checked"
       :class="{'unchecked': !checked, 'checked': checked}"
  >
    <div/>
  </div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

const checked = defineModel({
  type: Boolean,
  default: false
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

div.switch {
  height: 24px;
  width: 44px;
  border-width: 0;
  border-radius: 12px;
  padding: 3px;
  display: flex;
  align-items: center;
  cursor: pointer;
}

div.switch.unchecked {
  justify-content: flex-start;
  background-color: var(--border-secondary);
}

div.switch.checked {
  justify-content: flex-end;
  background-color: var(--network-theme-color)
}

div.switch > div {
  height: 18px;
  width: 18px;
  background-color: var(--text-secondary);
  border-width: 0;
  border-radius: 9px;
}

</style>
