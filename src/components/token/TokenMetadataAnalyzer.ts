/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2024 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {computed, ref, Ref, watch, WatchStopHandle} from "vue";
import {TopicMessagesResponse} from "@/schemas/HederaSchemas";
import {EntityID} from "@/utils/EntityID";
import axios from "axios";
import {Timestamp} from "@/utils/Timestamp";
import {TopicMessageCache} from "@/utils/cache/TopicMessageCache";
import {CID} from "multiformats";

export interface NftAttribute {
    trait_type: string
    display_type: string | undefined
    value: string | number | boolean
    max_value: string | number | undefined
}

export interface NftFile {
    uri: string                       // "uri to file - REQUIRED",
    url: string                       // we compute this
    checksum: string | undefined      // "cryptographic hash of the representation of the resource the author expects to load - OPTIONAL",
    type: string                      // "mime type - REQUIRED",
    is_default_file: boolean | undefined
    metadata: string | undefined      // "metadata object - OPTIONAL",
    metadata_uri: string | undefined  // "uri to metadata - OPTIONAL"
}

export class TokenMetadataAnalyzer {

    private watchHandle: WatchStopHandle | null = null
    private privateAxios = axios.create({timeout: 10000});
    private metadataContentRef = ref<any>(null)

    //
    // Public
    //

    public readonly rawMetadata: Ref<string>
    public readonly ipfsGatewayPrefix: string

    public constructor(rawMetadata: Ref<string>, ipfsGatewayPrefix: string) {
        this.rawMetadata = rawMetadata
        this.ipfsGatewayPrefix = ipfsGatewayPrefix
    }

    public mount(): void {
        this.watchHandle = watch(
            this.rawMetadata,
            (value) => this.metadataDidChange(value),
            {
                immediate: true
            }
        )
    }

    public unmount() {
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
    }

    public loadSuccess = computed(() => this.loadSuccessRef.value)
    public loadError = computed(() => this.loadErrorRef.value)

    public readonly metadata = ref('')

    public metadataInfo = computed(() => {
        let result: string | null
        if (!this.loadSuccess.value && !this.loadError.value) {
            result = 'The NFT metadata property is not usable.'
        } else if (this.loadSuccess.value && !this.isHIP412.value) {
            result = 'The metadata content does not follow the schema defined in HIP 412.'
        } else {
            result = null
        }
        return result
    })

    public metadataWarning = computed(() => {
        let result: string | null
        if (this.loadError.value) {
            result = 'The metadata content could not be loaded. '
            if (this.metadata.value.startsWith('ipfs://')) {
                result += 'This might be transient due to the nature of the IPFS network. ' +
                    'Try to reload the page in a few moments.'
            }
        } else {
            result = null
        }
        return result
    })

    public isHIP412 = computed<boolean>(
        () => (this.format.value && this.format.value?.startsWith('HIP412@2'))
            || (this.name.value != null && this.image.value != null && this.type.value != null)
    )

    public metadataContent = computed<any>(() => this.metadataContentRef.value)

    public metadataString = computed<string | null>(
        () => this.metadataContent.value !== null
            ? JSON.stringify(this.metadataContent.value)
            : null
    )

    public metadataKeys = computed(
        () => this.metadataContent.value !== null
            ? Object.keys(this.metadataContent.value)
            : []
    )

    public name = computed<string | null>(() => this.getProperty('name'))
    public creator = computed<string | null>(() => this.getProperty('creator'))
    public creatorDID = computed<string | null>(() => this.getProperty('creatordid'))
    public description = computed<string | null>(() => this.getProperty('description'))
    public image = computed<string | null>(() => this.getProperty('image'))
    public checksum = computed<string | null>(() => this.getProperty('checksum'))
    public type = computed<string | null>(() => this.getProperty('type'))
    public format = computed<string | null>(() => this.getProperty('format'))

    public properties = computed<string | null>(() => {
        let result = this.getProperty('properties')
        if (result != null) {
            result = JSON.stringify(result)
            if (result === '{}') {
                result = null
            }
        }
        return result
    })

    public files = computed<NftFile[]>(() => {
        const result: NftFile[] = []
        const files = this.getProperty('files')
        if (Array.isArray(files)) {
            for (const file of files) {
                if (file.uri != undefined && file.type != undefined) {
                    let url
                    if (file.uri.startsWith("ipfs://") && file.uri.length > 7) {
                        url = `${this.ipfsGatewayPrefix}${file.uri.substring(7)}`
                    } else {
                        url = file.uri
                    }

                    result.push({
                        uri: file.uri,
                        url: url,
                        checksum: file.checksum,
                        type: file.type,
                        is_default_file: file.is_default_file,
                        metadata: file.rawMetadata,
                        metadata_uri: file.metadata_uri
                    })
                }
            }
        }
        return result
    })

    public attributes = computed<NftAttribute[]>(() => {
        const result: NftAttribute[] = []
        const attributes = this.getProperty('attributes')
        if (Array.isArray(attributes)) {
            for (const attr of attributes) {
                if (attr.trait_type != undefined && attr.value != undefined) {
                    result.push({
                        trait_type: attr.trait_type,
                        display_type: attr.display_type,
                        value: attr.value,
                        max_value: attr.max_value
                    })
                }
            }
        }
        return result
    })

    public imageUrl = computed<string | null>(
        () => {
            let result = this.getProperty('image') ?? this.getProperty(('picture'))

            if (result != null && result.startsWith("ipfs://") && result.length > 7) {
                result = `${this.ipfsGatewayPrefix}${result.substring(7)}`
            }
            return result
        })

    //
    // Private
    //

    private loadSuccessRef = ref(false)
    private loadErrorRef = ref(false)

    /*

        Content type       | Example syntax                                                       | See token example
        ===================+======================================================================+================================================
        IPFS URL           | "ipfs://QmSoJYWXvds2qcPeRGJdirP7YTCYvZv4fo43TadwmbvV8H"              | https://hashscan.io/mainnet/token/0.0.5679552/1
        -------------------+----------------------------------------------------------------------+------------------------------------------------
        IPFS CID           | "QmSoJYWXvds2qcPeRGJdirP7YTCYvZv4fo43TadwmbvV8H"                     | https://hashscan.io/mainnet/token/0.0.5844106/1
        -------------------+----------------------------------------------------------------------+------------------------------------------------
        HCS URL            | "hcs://6/0.0.5671138"                                                | https://hashscan.io/mainnet/token/0.0.5671193/1
        -------------------+----------------------------------------------------------------------+------------------------------------------------
        Plain Topic ID     | "0.0.5679050"                                                        | https://hashscan.io/mainnet/token/0.0.5679054/1
        -------------------+----------------------------------------------------------------------+------------------------------------------------
        HCS SUBMIT MESSAGE | "1713509435.878762003"                                               | https://hashscan.io/mainnet/token/0.0.5488525/1
        tx timestamp       |                                                                      |
        -------------------+----------------------------------------------------------------------+------------------------------------------------
        Plain HTTPS URL    | "https://fliggs-nfts-metadata.s3.us-east-2.amazonaws.com/degen.json" | https://hashscan.io/mainnet/token/0.0.6029502/1
                           | (Note this one causes a CORS error)                                  |
        -------------------+----------------------------------------------------------------------+------------------------------------------------

     */

    private async metadataDidChange(value: string | null): Promise<void> {
        const content = this.metadataContentRef
        const metadata = this.metadata

        try {
            metadata.value = Buffer.from(value ?? '', 'base64').toString()
        } catch {
            metadata.value = value ?? ''
        }

        if (metadata.value !== null) {
            if (metadata.value.startsWith('ipfs://')) {
                content.value = await this.readMetadataFromUrl(`${this.ipfsGatewayPrefix}${metadata.value.substring(7)}`)
            } else if (metadata.value.startsWith('hcs://')) {
                const i = metadata.value.lastIndexOf('/');
                const id = metadata.value.substring(i + 1);
                if (EntityID.parse(id) !== null) {
                    content.value = await this.readMetadataFromTopic(id)
                } else {
                    content.value = null
                }
            } else if (metadata.value.startsWith('https://')) {
                content.value = await this.readMetadataFromUrl(metadata.value)
            } else if (EntityID.parse(metadata.value) !== null) {
                content.value = await this.readMetadataFromTopic(metadata.value)
            } else if (Timestamp.parse(metadata.value) !== null) {
                content.value = await this.readMetadataFromTimestamp(metadata.value)
            } else {
                try {
                    CID.parse(metadata.value)
                    content.value = await this.readMetadataFromUrl(`${this.ipfsGatewayPrefix}${metadata.value}`)
                } catch {
                    content.value = null
                }
            }
        } else {
            content.value = null
        }
    }

    private async readMetadataFromUrl(url: string): Promise<any> {
        // console.log(`readMetadataFromUrl: ${url}`)
        let result: any
        try {
            const response = await this.privateAxios.get(url)
            this.loadSuccessRef.value = true
            result = response.data ?? null
        } catch (reason) {
            console.warn(`Failed to read metadata from URL ${url} - error: ${reason}`)
            if (axios.isAxiosError(reason)) {
                console.warn(`status: ${reason.response?.status}`)
            }
            this.loadErrorRef.value = true
            result = null
        }
        // console.log(`readMetadataFromUrl - result: ${JSON.stringify(result)}`)
        return Promise.resolve(result)
    }

    private async readMetadataFromTopic(id: string): Promise<any> {
        // console.log(`readMetadataFromTopic: ${id}`)
        let result: any
        const url = "api/v1/topics/" + id + "/messages?limit=1&order=desc"
        try {
            const response = await this.privateAxios.get<TopicMessagesResponse>(url)
            this.loadSuccessRef.value = true
            if (response.data.messages && response.data.messages.length >= 0) {
                result = JSON.parse(Buffer.from(response.data.messages[0].message, 'base64').toString())
            } else {
                result = null
            }
        } catch (reason) {
            console.warn(`Failed to read metadata from topic ${id} - reason: ${reason}`)
            this.loadErrorRef.value = true
            result = null
        }
        // console.log(`readMetadataFromTopic - result: ${JSON.stringify(result)}`)
        return Promise.resolve(result)
    }

    private async readMetadataFromTimestamp(timestamp: string): Promise<any> {
        // console.log(`readMetadataFromTimestamp: ${timestamp}`)
        let result: any
        try {
            const topicMessage = await TopicMessageCache.instance.lookup(timestamp)
            this.loadSuccessRef.value = true
            if (topicMessage) {
                result = JSON.parse(Buffer.from(topicMessage.message, 'base64').toString())
            } else {
                result = null
            }
        } catch (reason) {
            console.warn(`Failed to read metadata from timestamp ${timestamp} - reason: ${reason}`)
            this.loadErrorRef.value = true
            result = null
        }
        // console.log(`readMetadataFromTimestamp - result: ${JSON.stringify(result)}`)
        return Promise.resolve(result)
    }

    private getProperty(name: string): any | null {
        let result: string | null = null
        for (const key of this.metadataKeys.value) {
            if (key.toLowerCase() === name) {
                result = this.metadataContent.value[key]
                break
            }
        }
        return result
    }
}
