// SPDX-License-Identifier: Apache-2.0

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                     TEMPLATE                                                    -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<template>

  <div class="is-inline-block">
    <span>{{ transactionId }}</span>
  </div>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, PropType, ref, watch} from "vue";
import {TransactionID} from "@/utils/TransactionID";

export default defineComponent({
  name: "TransactionIdValue",
  props: {
    id: {
      type: String as PropType<string | null>,
      default: null
    }
  },
  setup(props) {
    const transactionId = ref(TransactionID.normalizeForDisplay(props.id ?? ''))
    watch([() => props.id, TransactionID.useAtForm], () =>
            transactionId.value = TransactionID.normalizeForDisplay(props.id ?? ''), {immediate: true}
    )
    return {
      transactionId
    }
  }
});

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style/>

