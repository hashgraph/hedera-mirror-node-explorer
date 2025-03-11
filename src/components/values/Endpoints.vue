// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>

  <div v-if="props.endpoints && props.endpoints.length">
    <div v-for="s in props.endpoints" :key="s.ip_address_v4" class="h-is-monospace">
      <span v-if="s.ip_address_v4">{{ s.ip_address_v4 }}</span>
      <span v-if="s.ip_address_v4 && s.port != null" class="h-is-low-contrast">{{ ':' + s.port }}</span>
    </div>
  </div>

  <span v-else-if="initialLoading"/>

  <span v-else class="h-is-low-contrast">None</span>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script setup lang="ts">

import {inject, PropType, ref} from 'vue';
import {initialLoadingKey} from "@/AppKeys";
import {ServiceEndPoint} from "@/schemas/MirrorNodeSchemas";

const props = defineProps({
  endpoints: Object as PropType<Array<ServiceEndPoint> | undefined>,
})

const initialLoading = inject(initialLoadingKey, ref(false))

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>
