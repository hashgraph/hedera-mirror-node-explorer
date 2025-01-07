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

  <span v-if="timestamp">
    <template v-if="isNever">
      <span class="has-text-grey">Never</span>
    </template>
    <template v-else-if="seconds != null">
      <span>
        <span v-if="timePart" class="mr-3 is-numeric">
          <span>{{ timePart.hour }}:{{ timePart.minute }}</span>
          <span class="h-is-text-size-3 has-text-grey">:{{ timePart.second }}.{{
              timePart.fractionalSecond
            }}&nbsp;{{ timePart.dayPeriod }}</span>
        </span>
        <span class="is-numeric">{{ datePart }}</span>
      </span>
    </template>
    <template v-else>
      <span class="icon-text">
        <span class="is-numeric">{{ timestamp }}</span>
        <span class="icon has-text-grey-light">
          <i class="fas fa-exclamation-triangle"></i>
        </span>
      </span>
    </template>
  </span>

  <span v-else-if="showNone && !initialLoading" class="has-text-grey">None</span>

  <span v-else/>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {computed, defineComponent, inject, PropType, ref} from "vue";
import {HMSF} from "@/utils/HMSF";
import {initialLoadingKey} from "@/AppKeys";
import {infiniteDuration} from "@/schemas/MirrorNodeSchemas";

export default defineComponent({
  name: "TimestampValue",

  props: {
    timestamp: {
      type: String as PropType<string | null>,
      default: null
    },
    nano: {
      type: Boolean,
      default: false
    },
    showNone: {
      type: Boolean,
      default: false
    }
  },

  setup(props) {

    const locale = "en-US"

    const seconds = computed(() => {
      return props.timestamp !== null ? parseSeconds(normalizedTimestamp(props.timestamp, props.nano)) : null
    })

    const isNever = computed(() => seconds.value && seconds.value >= infiniteDuration)

    const dateOptions: Intl.DateTimeFormatOptions = {
      // weekDay: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZoneName: "short",
      timeZone: HMSF.forceUTC ? "UTC" : undefined
    }
    const dateFormat = new Intl.DateTimeFormat(locale, dateOptions)
    const datePart = computed(() => {
      return (seconds.value != null && !isNever.value) ? dateFormat.format(seconds.value * 1000) : "?"
    })

    const timePart = computed(() => {
      return (seconds.value && !isNever.value) ? HMSF.extract(seconds.value, locale) : null
    })

    const initialLoading = inject(initialLoadingKey, ref(false))

    return {
      isNever,
      seconds,
      datePart,
      timePart,
      initialLoading
    }
  }
});

function parseSeconds(value: string): number | null {
  const seconds = Number.parseFloat(value);
  return isNaN(seconds) ? null : seconds;
}

function normalizedTimestamp(t: string, nano: boolean): string {
  let result: string

  if (nano) {
    // "1613954653165071000"
    //      => "1613954653.165071000"

    const fractionIndex = t.length - 9
    const fraction = t.substring(fractionIndex);
    const seconds = t.substring(0, fractionIndex);
    result = seconds + "." + fraction
  } else {
    result = t
  }

  return result
}


</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

