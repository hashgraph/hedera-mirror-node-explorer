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

  <DashboardCard
      id="metadata-section"
      class="h-card"
      collapsible-key="metadataSection"
      :collapsed="true"
  >
    <template #title>
      <span class="h-is-secondary-title">Metadata Details</span>
    </template>

    <template #control>
      <div v-if="metadataString" class="is-flex is-align-items-baseline is-justify-content-end">
        <p class="has-text-weight-light">Raw content</p>
        <label class="checkbox pt-1 ml-3">
          <input type="checkbox" v-model="showRawMetadata">
        </label>
      </div>
    </template>

    <template #content>

      <Property id="raw-metadata-property" :full-width="true">
        <template #name>
          Raw Metadata
        </template>
        <template #value>
          <BlobValue :blob-value="rawMetadata" :show-none="true"/>
        </template>
      </Property>
      <Property v-if="rawMetadata" id="metadata-location" :full-width="true">
        <template #name>Content Location</template>
        <template #value>
          <BlobValue
              class="is-inline-block"
              :blob-value="metadata"
              :show-none="true"
          />
          <InfoTooltip
              v-if="metadataWarning || metadataInfo"
              :warning-label="metadataWarning"
              :label="metadataInfo"
              class="ml-2"
          />
        </template>
      </Property>

      <template v-if="showRawMetadata">
        <Property id="raw-content" :full-width="true">
          <template #name>
            Content
          </template>
          <template #value>
            <BlobValue
                :blob-value="metadataString"
                :pretty="true"
            />
          </template>
        </Property>
      </template>

      <template v-else>
        <Property v-if="format" id="format" :full-width="true">
          <template #name>
            Format
          </template>
          <template #value>
            <BlobValue :blob-value="format" :show-none="true"/>
          </template>
        </Property>
        <Property v-if="image" id="image" :full-width="true">
          <template #name>
            Image
          </template>
          <template #value>
            <BlobValue :blob-value="image" :show-none="true"/>
          </template>
        </Property>
        <Property v-if="type" id="type" :full-width="true">
          <template #name>
            Type
          </template>
          <template #value>
            <BlobValue :blob-value="type" :show-none="true"/>
          </template>
        </Property>
        <Property v-if="checksum" id="checksum" :full-width="true">
          <template #name>
            Checksum
          </template>
          <template #value>
            <BlobValue :blob-value="checksum" :show-none="true"/>
          </template>
        </Property>
        <Property v-if="creatorDID" id="creator-did" :full-width="true">
          <template #name>
            Creator DID
          </template>
          <template #value>
            <BlobValue :blob-value="creatorDID" :show-none="true"/>
          </template>
        </Property>
        <Property v-if="properties" id="properties" :full-width="true">
          <template #name>
            Properties
          </template>
          <template #value>
            <BlobValue :blob-value="properties" :pretty="true" :show-none="true"/>
          </template>
        </Property>

        <template v-if="attributes.length">
          <p class="h-is-tertiary-text mt-5 mb-3">Attributes</p>
          <template v-for="attr in attributes" :key="attr.trait_type">
            <NftAttribute :attribute="attr"/>
          </template>
        </template>

        <template v-if="files.length">
          <p class="h-is-tertiary-text mt-5 mb-3">Files</p>
          <div id="file-container-area" class="file-container">
            <NftFile
                v-for="(file) in files" :key="file.uri"
                class="file-container-item mt-3"
                :type="file.type"
                :url="file.url"
                :size="200"
            />
          </div>
        </template>
      </template>

    </template>

  </DashboardCard>

</template>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                      SCRIPT                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<script lang="ts">
import {defineComponent, inject, PropType, ref,} from "vue"
import DashboardCard from "@/components/DashboardCard.vue"
import BlobValue from "@/components/values/BlobValue.vue"
import Property from "@/components/Property.vue"
import {TokenMetadataAnalyzer} from "@/components/token/TokenMetadataAnalyzer";
import NftAttribute from "@/components/token/NftAttribute.vue";
import InfoTooltip from "@/components/InfoTooltip.vue";
import NftFile from "@/components/token/NftFile.vue";

export default defineComponent({
  name: "MetadataSection",

  components: {
    NftFile,
    InfoTooltip,
    NftAttribute,
    BlobValue,
    Property,
    DashboardCard,
  },

  props: {
    metadataAnalyzer: {
      type: Object as PropType<TokenMetadataAnalyzer>,
      required: true,
    }
  },

  setup(props) {
    const isMediumScreen = inject('isMediumScreen', true)

    const showRawMetadata = ref(false)

    return {
      isMediumScreen,
      showRawMetadata,
      metadataInfo: props.metadataAnalyzer.metadataInfo,
      metadataWarning: props.metadataAnalyzer.metadataWarning,
      metadata: props.metadataAnalyzer.metadata,
      rawMetadata: props.metadataAnalyzer.rawMetadata,
      metadataString: props.metadataAnalyzer.metadataString,
      attributes: props.metadataAnalyzer.attributes,
      creatorDID: props.metadataAnalyzer.creatorDID,
      checksum: props.metadataAnalyzer.checksum,
      image: props.metadataAnalyzer.image,
      type: props.metadataAnalyzer.type,
      format: props.metadataAnalyzer.format,
      properties: props.metadataAnalyzer.properties,
      files: props.metadataAnalyzer.files,
    }
  },
})

</script>

<!-- --------------------------------------------------------------------------------------------------------------- -->
<!--                                                       STYLE                                                     -->
<!-- --------------------------------------------------------------------------------------------------------------- -->

<style scoped>

.file-container {
  display: flex;
  flex-wrap: wrap;
  overflow-x: auto;

  max-height: 520px;
  margin-bottom: 20px;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  /*
  &::-webkit-scrollbar {
    display: none;
  }
  */

  .file-container-item {
    flex: 0 0 auto;
    margin-right: 10px;
    margin-top: 10px;
    border: 0.5px solid grey;
    padding: 0.5px;
    background-color: var(--background-primary);
  }

  .file-container-item:hover {
    border: 1px solid grey;
    padding: 0;
  }

  .file-container-item:active {
    border: 1px solid white;
    padding: 0;
  }

  .file-container-item.selectedItem {
    border: 1px solid var(--network-theme-color);
    padding: 0;
  }
}

</style>
