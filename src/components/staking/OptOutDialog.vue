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
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <ModalDialog :show-dialog="showDialog" :icon-class="iconClass">
    <template v-slot:dialogMessage>
      <slot name="dialogMessage"/>
    </template>
    <template v-slot:dialogDetails>
      <slot name="dialogDetails"/>

      <div class="is-flex is-justify-content-end is-align-items-center">
        <span>Please don't show me this next time</span>
        <label class="checkbox ml-2 mt-1">
          <input type="checkbox">
        </label>
      </div>
    </template>
  </ModalDialog>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent} from "vue";
import ModalDialog from "@/components/ModalDialog.vue";

export default defineComponent({
  name: "OptOutDialog",
  components: {ModalDialog},
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    iconClass: String
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>
</style>

