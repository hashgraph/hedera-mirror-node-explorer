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
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">

import {defineComponent, h} from "vue";
import Prism from 'prismjs'


export default defineComponent({
  name: "SolidityCode",


  setup(props, ctx) {

    return () => {
      const attrs = {...ctx.attrs, class: "language-solidity"}
      const slot = ctx.slots.default ? ctx.slots.default() : null
      const slotChildren = slot !== null && slot.length >= 1 ? slot[0].children : null
      const code = typeof slotChildren == "string" ? slotChildren : ""
      const children = Prism.highlight(code, Prism.languages.solidity, 'solidity')
      return h("pre", attrs, h("code", {innerHTML: children}))
    }
  }
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      STYLE                                                      -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style>
pre.language-solidity {
  .number {
    vertical-align: baseline;
    font-size: 0.8rem;
    background-color: inherit;
    min-width: 0;
    padding: 0;
    margin: 0;
  }
}
</style>
