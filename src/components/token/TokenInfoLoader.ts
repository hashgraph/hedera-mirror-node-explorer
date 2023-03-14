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

import {TokenInfo} from "@/schemas/HederaSchemas";
import {EntityLoader} from "@/utils/loader/EntityLoader";
import axios, {AxiosResponse} from "axios";
import {computed, Ref} from "vue";
import {makeEthAddressForToken, makeTokenSymbol} from "@/schemas/HederaUtils";

export class TokenInfoLoader extends EntityLoader<TokenInfo> {

    public readonly tokenId: Ref<string|null>

    //
    // Public
    //

    public constructor(tokenId: Ref<string|null>) {
        super()
        this.tokenId = tokenId
        this.watchAndReload([this.tokenId])
    }

    public readonly ethereumAddress = computed(
        () => this.entity.value !== null ? makeEthAddressForToken(this.entity.value) : null)

    public readonly tokenSymbol = computed(
        () => makeTokenSymbol(this.entity.value, 11))

    public readonly isFungible = computed(
        () => this.entity.value != null ? this.entity.value.type == "FUNGIBLE_COMMON" : null)

    public readonly isNft = computed(
        () => this.entity.value != null ? this.entity.value.type == "NON_FUNGIBLE_UNIQUE" : null)

    public readonly hasFixedFees = computed(
        () => this.entity.value?.custom_fees?.fixed_fees && this.entity.value.custom_fees.fixed_fees.length > 0
    )

    public readonly hasFractionalFees = computed(
        () => this.entity.value?.custom_fees?.fractional_fees && this.entity.value.custom_fees.fractional_fees.length > 0
    )

    public readonly hasRoyaltyFees = computed(
        () => this.entity.value?.custom_fees?.royalty_fees && this.entity.value.custom_fees.royalty_fees.length > 0
    )

    public readonly hasCustomFees = computed(
        () => this.hasFixedFees.value || this.hasFractionalFees.value || this.hasRoyaltyFees.value
    )

    public readonly fixedFees = computed(
        () => this.hasFixedFees ? this.entity.value?.custom_fees?.fixed_fees : null)

    public readonly fractionalFees = computed(
        () => this.hasFractionalFees ? this.entity.value?.custom_fees?.fractional_fees : null)

    public readonly royaltyFees = computed(
        () => this.hasRoyaltyFees ? this.entity.value?.custom_fees?.royalty_fees : null)

    public readonly customFees = computed(() => this.entity.value?.custom_fees)

    //
    // EntityLoader
    //

    protected async load(): Promise<AxiosResponse<TokenInfo>|null> {
        let result: Promise<AxiosResponse<TokenInfo>|null>
        if (this.tokenId.value != null) {
            result = axios.get<TokenInfo>("api/v1/tokens/" + this.tokenId.value)
        } else {
            result = Promise.resolve(null)
        }
        return result
    }

}
