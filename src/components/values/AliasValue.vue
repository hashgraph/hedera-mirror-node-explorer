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
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>
  <div v-if="hexValue" class="should-wrap">
    <div :class="{'is-flex': isSmallScreen}" class="is-inline-block h-is-text-size-3 is-family-monospace"
         style="line-height: 20px">
      <Copyable :content-to-copy="hexValue">
        <template v-slot:content>
          <span>{{ hexValue }}</span>
        </template>
      </Copyable>
    </div>
  </div>
  <div v-else-if="initialLoading"/>
  <div v-else class="has-text-grey">None</div>
</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, ref} from "vue";
import {base32ToAlias, byteToHex} from "@/utils/B64Utils";
import {initialLoadingKey} from "@/AppKeys";
import Copyable from "@/components/Copyable.vue";

export default defineComponent({
  name: "AliasValue",
  components: {Copyable},
  props: {
    aliasValue: String,
  },
  setup(props) {
    const initialLoading = inject(initialLoadingKey, ref(false))
    const isSmallScreen = inject('isSmallScreen', ref(false))

    const hexValue = computed(() => {
      let result
      if (props.aliasValue) {
        const alias = base32ToAlias(props.aliasValue)
        result = alias ? byteToHex(alias) : null
      } else {
        result = null
      }
      return result
    })

    return {
      initialLoading,
      isSmallScreen,
      hexValue,
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
