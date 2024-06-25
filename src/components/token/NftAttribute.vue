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

  <Property
      :id="attribute.trait_type"
      :full-width="true"
  >
    <template #name>
      {{ attribute.trait_type }}
    </template>

    <template #value>
      <template v-if="isPercentage">
        {{ attribute.value + '%' }}
      </template>
      <template v-else-if="isDateTime">
        <TimestampValue :timestamp="timestamp"/>
      </template>
      <template v-else>
        {{ attribute.value }}
      </template>
    </template>
  </Property>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import {computed, defineComponent, PropType,} from "vue"
import {NftAttribute} from "@/components/token/TokenMetadataAnalyzer";
import Property from "@/components/Property.vue";
import TimestampValue from "@/components/values/TimestampValue.vue";

export default defineComponent({
  name: "NftAttribute",

  components: {TimestampValue, Property},

  props: {
    attribute: {
      type: Object as PropType<NftAttribute>,
      required: true,
    }
  },

  setup(props) {
    const isPercentage = computed(() => props.attribute.display_type === 'percentage')
    const isDateTime = computed(() => props.attribute.display_type === 'datetime')
    const timestamp = computed(
        () => isDateTime.value ? props.attribute.value.toString() + '.000000000' : null
    )
    return {
      isPercentage,
      isDateTime,
      timestamp
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
</style>
