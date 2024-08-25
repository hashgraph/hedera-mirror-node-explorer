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

import {computed, Ref} from "vue";
import {makeEthAddressForToken, makeTokenSymbol} from "@/schemas/HederaUtils";
import {TokenInfo, TokenType} from "@/schemas/HederaSchemas";
import {networkRegistry} from "@/schemas/NetworkRegistry";
import router, {walletManager} from "@/router";
import {TokenAssociationCache} from "@/utils/cache/TokenAssociationCache";

export class TokenInfoAnalyzer {

    private readonly tokenInfo: Ref<TokenInfo | null>

    //
    // Public
    //

    public constructor(tokenInfo: Ref<TokenInfo | null>) {
        this.tokenInfo = tokenInfo
    }

    public mount() {
        this.associationLookup.mount()
    }

    public unmount() {
        this.associationLookup.unmount()
    }

    public readonly tokenId = computed(
        () => this.tokenInfo.value?.token_id ?? null)

    public readonly ethereumAddress = computed(
        () => this.tokenInfo.value !== null ? makeEthAddressForToken(this.tokenInfo.value) : null)

    public readonly tokenSymbol = computed(
        () => makeTokenSymbol(this.tokenInfo.value))

    public readonly decimals = computed(
        () => this.tokenInfo.value?.decimals ?? null)

    public readonly isFungible = computed(
        () => this.tokenInfo.value != null ? this.tokenInfo.value.type == TokenType.FUNGIBLE_COMMON : null)

    public readonly isNft = computed(
        () => this.tokenInfo.value != null ? this.tokenInfo.value.type == TokenType.NON_FUNGIBLE_UNIQUE : null)

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

    public readonly treasuryAccount = computed(() => this.tokenInfo.value?.treasury_account_id)

    public readonly tokenChecksum = computed(() =>
        this.tokenInfo.value?.token_id ? networkRegistry.computeChecksum(
            this.tokenInfo.value?.token_id,
            router.currentRoute.value.params.network as string
        ) : null)

    public readonly associationStatus = computed(() => {
        let result: TokenAssociationStatus
        const relationships = this.associationLookup.entity.value
        if (relationships !== null) {
            result = relationships.length == 1 ? TokenAssociationStatus.Associated : TokenAssociationStatus.Dissociated
        } else {
            result = TokenAssociationStatus.Unknown
        }
        return result
    })

    public tokenAssociationDidChange(): void {
        if (walletManager.accountId.value !== null && this.tokenId.value !== null) {
            TokenAssociationCache.instance.forgetTokenAssociation(walletManager.accountId.value, this.tokenId.value)
            this.associationLookup.unmount()
            this.associationLookup.mount()
        }
    }

    //
    // Private
    //

    private readonly associationLookup
        = TokenAssociationCache.instance.makeTokenAssociationLookup(walletManager.accountId, this.tokenId)

}

export enum TokenAssociationStatus {
    Unknown,
    Associated,
    Dissociated
}