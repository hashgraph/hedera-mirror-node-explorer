/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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

import {computed, Ref} from "vue";
import {makeEthAddressForToken, makeTokenSymbol} from "@/schemas/HederaUtils";
import {TokenInfo} from "@/schemas/HederaSchemas";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import router from "@/router";

export class TokenInfoAnalyzer {

    private readonly tokenInfo: Ref<TokenInfo|null>

    //
    // Public
    //

    public constructor(tokenInfo: Ref<TokenInfo|null>) {
        this.tokenInfo = tokenInfo
    }

    public readonly ethereumAddress = computed(
        () => this.tokenInfo.value !== null ? makeEthAddressForToken(this.tokenInfo.value) : null)

    public readonly tokenSymbol = computed(
        () => makeTokenSymbol(this.tokenInfo.value, 11))

    public readonly isFungible = computed(
        () => this.tokenInfo.value != null ? this.tokenInfo.value.type == "FUNGIBLE_COMMON" : null)

    public readonly isNft = computed(
        () => this.tokenInfo.value != null ? this.tokenInfo.value.type == "NON_FUNGIBLE_UNIQUE" : null)

    public readonly hasFixedFees = computed(
        () => this.tokenInfo.value?.custom_fees?.fixed_fees && this.tokenInfo.value.custom_fees.fixed_fees.length > 0
    )

    public readonly hasFractionalFees = computed(
        () => this.tokenInfo.value?.custom_fees?.fractional_fees && this.tokenInfo.value.custom_fees.fractional_fees.length > 0
    )

    public readonly hasRoyaltyFees = computed(
        () => this.tokenInfo.value?.custom_fees?.royalty_fees && this.tokenInfo.value.custom_fees.royalty_fees.length > 0
    )

    public readonly hasCustomFees = computed(
        () => this.hasFixedFees.value || this.hasFractionalFees.value || this.hasRoyaltyFees.value
    )

    public readonly fixedFees = computed(
        () => this.hasFixedFees ? this.tokenInfo.value?.custom_fees?.fixed_fees : null)

    public readonly fractionalFees = computed(
        () => this.hasFractionalFees ? this.tokenInfo.value?.custom_fees?.fractional_fees : null)

    public readonly royaltyFees = computed(
        () => this.hasRoyaltyFees ? this.tokenInfo.value?.custom_fees?.royalty_fees : null)

    public readonly customFees = computed(() => this.tokenInfo.value?.custom_fees)


    public readonly tokenChecksum = computed(() =>
        this.tokenInfo.value?.token_id ? networkRegistry.computeChecksum(
            this.tokenInfo.value?.token_id,
            router.currentRoute.value.params.network as string
        ) : null)

}