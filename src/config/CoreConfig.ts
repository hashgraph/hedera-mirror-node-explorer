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

import axios from "axios";
import {fetchString, fetchURL} from "@/config/ConfigUtils";
import {inject} from "vue";
import {coreConfigKey} from "@/AppKeys";


export class CoreConfig {

    public static FALLBACK = CoreConfig.parse({})

    //
    // Public
    //

    public static async load(url: string): Promise<CoreConfig> {
        let result: CoreConfig
        const response = await axios.get<unknown>(url)
        if (response.status === 200 && typeof response.data === "object" && response.data !== null) {
            result = this.parse(response.data)
        } else {
            throw new Error("core-config.json is missing or cannot be decoded")
        }
        return result
    }

    public static inject(): CoreConfig {
        return inject<CoreConfig>(coreConfigKey, this.FALLBACK)
    }

    public static make(): CoreConfig { // For unit testing
        return CoreConfig.parse({ })
    }

    //
    // Private
    //

    private constructor(
        // The name of the product as shown in the short form of the footer tagline
        public readonly productName: string,

        // The URL of the product logo located at the left of the top navigation bar
        public readonly productLogoURL: string|null,

        // The prefix used in the document title
        public readonly documentTitlePrefix: string|null,

        // The description of the product as shown in the long form of the footer tagline
        public readonly productDescription: string|null,

        // The content of meta tag: name="description"
        public readonly metaDescription: string|null,

        // The content of meta tag: property="og:url"
        public readonly metaURL: string|null,

        // The URL of the 'BUILT ON' logo located at the left of the footer
        public readonly builtOnLogoURL: string|null,

        // The URL to which a click on the bottom-left 'BUILT ON' logo will navigate
        public readonly builtOnURL: string|null,

        // The URL of the sponsor logo located at the right of the footer
        public readonly sponsorLogoURL: string|null,

        // The URL to which a click on the bottom-right sponsor logo will navigate
        public readonly sponsorURL: string|null,

        // The URL of the 'Terms of Use' page
        public readonly termsOfUseURL: string|null,

        // The HTML content of the disclaimer notice displayed on the Rewards Estimator
        public readonly estimatorNotice: string|null, // Unused when enabledStaking is false

        // The HTML content of the disclaimer popup dialog displayed by the Wallet Chooser
        public readonly walletChooserDisclaimerPopup: string|null,

        // Global site tag ID for Google Analytics
        public readonly googleTagID: string|null,

        // The URL prefix of the IPFS gateway
        public readonly ipfsGatewayUrlPrefix: string,

        // The URL of the popular token index
        public readonly popularTokenIndexURL: string|null,

        // The HTML content used as crypto unit symbol
        public readonly cryptoSymbol: string|null

    ) {}


    private static parse(obj: object): CoreConfig {
        return new CoreConfig(
            fetchString(obj, "productName") ??  "Hedera Mirror Node Explorer",
            fetchURL(obj, "productLogoURL"),
            fetchString(obj, "documentTitlePrefix"),
            fetchString(obj, "productDescription"),
            fetchString(obj, "metaDescription"),
            fetchURL(obj, "metaURL"),
            fetchURL(obj, "builtOnLogoURL"),
            fetchURL(obj, "builtOnURL"),
            fetchURL(obj, "sponsorLogoURL"),
            fetchURL(obj, "sponsorURL"),
            fetchURL(obj, "termsOfUseURL"),
            fetchString(obj, "estimatorNotice"),
            fetchString(obj, "walletChooserDisclaimerPopup"),
            fetchString(obj, "googleTagID"),
            fetchURL(obj, "ipfsGatewayUrlPrefix") ?? "https://gateway.pinata.cloud/ipfs/",
            fetchURL(obj, "popularTokenIndexURL"),
            fetchString(obj, "cryptoSymbol")
        )
    }
}

