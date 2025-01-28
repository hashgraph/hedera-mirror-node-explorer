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

import {TransactionGroupController} from "@/dialogs/core/transaction/TransactionGroupController.ts";
import {computed, Ref, ref, watch, WatchStopHandle} from "vue";
import {FreezeStatus, Nft, Token} from "@/schemas/MirrorNodeSchemas.ts";
import {tokenOrNftId} from "@/schemas/MirrorNodeUtils.ts";
import {NftId, TokenId, TokenRejectTransaction} from "@hashgraph/sdk";
import {TokenAssociationCache} from "@/utils/cache/TokenAssociationCache.ts";
import {walletManager} from "@/router.ts";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache.ts";

export class RejectTokenController extends TransactionGroupController {

    private readonly rejectCandidates = ref<(Token | Nft)[]>([])
    private readonly treasuryTokens = ref<string[]>([])
    private readonly pausedTokens = ref<string[]>([])
    private readonly frozenTokens = ref<string[]>([])
    private readonly zeroBalanceTokens = ref<string[]>([])
    public readonly filtering = ref(false)

    private watchStopHandle: WatchStopHandle|null = null


    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>, public readonly tokens: Ref<(Token|Nft)[]>) {
        super(showDialog)
    }

    public readonly isNft = computed(() => {
        let nftCount = 0
        for (const t of this.tokens.value ?? []) {
            if ((t as Nft).serial_number) {
                // t is an NFT
                nftCount += 1
            }
        }
        return this.tokens.value.length >= 1 && nftCount === this.tokens.value.length
    })

    public readonly inputMessage = computed(() => {
        let result: string
        if (this.rejectCandidates.value.length === 0) {
            if (this.tokens.value.length > 1) {
                result = `None of the selected ${this.isNft.value ? "NFT" : "token"} can be rejected.`
            } else {
                result = `The selected ${this.isNft.value ? "NFT" : "token"} cannot be rejected.`
            }
        } else if (this.rejectCandidates.value.length === 1) {
            result = `Do you want to reject ${this.isNft.value ? "NFT" : "token"} ${tokenOrNftId(this.rejectCandidates.value[0])}`
        } else {
            result = `Do you want to reject ${this.rejectCandidates.value.length} ${this.isNft.value ? "NFT" : "token"}s`
        }
        if (this.rejectCandidates.value.length < this.tokens.value.length) {
            result += ` (out of the ${this.tokens.value.length} selected)?`
        } else {
            result += '?'
        }
        return result
    })

    public readonly inputMessageDetails1 = computed(() => {
        let result: string | null
        if (this.inputMessageDetails2.value
            || this.inputMessageDetails3.value
            || this.inputMessageDetails4.value
            || this.inputMessageDetails5.value
        ) {
            result = (this.rejectCandidates.value.length >= 1)
                ? `The remaining selected ${this.isNft.value ? 'NFTs' : 'tokens'} cannot be rejected because:`
                : 'This is because:'
        } else {
            result = null
        }
        return result
    })

    public readonly inputMessageDetails2 = computed(() => {
        let result: string|null
        if (this.treasuryTokens.value.length >= 1) {
            result = `Your account is treasury for: ${this.treasuryTokens.value.splice(0, 4).join(', ')}`
            result += (this.treasuryTokens.value.length > 4 ? '…' : '')
        } else {
            result = null
        }
        return result
    })

    public readonly inputMessageDetails3 = computed(() => {
        let result: string|null
        if (this.pausedTokens.value.length >= 1) {
            result = this.pausedTokens.value.length === 1 ? `This ${this.isNft.value ? "collection" : "token"} is paused: ` : "These are paused: "
            result += this.pausedTokens.value.splice(0, 4).join(', ')
            result += (this.pausedTokens.value.length > 4 ? '…' : '')
        } else {
            result = null
        }
        return result
    })

    public readonly inputMessageDetails4 = computed(() => {
        let result: string|null
        if (this.frozenTokens.value.length >= 1) {
            result = this.frozenTokens.value.length === 1 ? `This ${this.isNft.value ? "collection" : "token"} is frozen: ` : "These are frozen: "
            result += this.frozenTokens.value.splice(0, 4).join(', ')
            result += (this.frozenTokens.value.length > 4 ? '…' : '')
        } else {
            result = null
        }
        return result
    })

    public readonly inputMessageDetails5 = computed(() => {
        let result: string|null
        if (this.zeroBalanceTokens.value.length >= 1) {
            result = this.zeroBalanceTokens.value.length === 1 ? "This token has a 0 balance: " : "These have a 0 balance: "
            result += this.zeroBalanceTokens.value.splice(0, 4).join(', ')
            result += (this.zeroBalanceTokens.value.length > 4 ? '…' : '')
        } else {
            result = null
        }
        return result
    })


    //
    // TransactionController
    //

    public canBeExecuted(): boolean {
        return this.rejectCandidates.value.length >= 1
    }

    protected dialogStartShowing(): void {
        this.watchStopHandle = watch(this.tokens, this.tokensDidChange, {immediate: true})
    }

    protected dialogStopShowing(): void {

        if (this.watchStopHandle !== null) {
            this.watchStopHandle()
            this.watchStopHandle = null
        }

        this.rejectCandidates.value = []
        this.treasuryTokens.value = []
        this.pausedTokens.value = []
        this.frozenTokens.value = []
        this.zeroBalanceTokens.value = []
    }

    //
    // TransactionGroupController
    //

    protected makeTransactions(): Promise<string | null>[] {
        const result: Promise<string | null>[] = []

        const MAX_TOKENS_PER_REJECT = 10
        const nbRequiredTransactions = Math.ceil(this.rejectCandidates.value.length / MAX_TOKENS_PER_REJECT)

        for (let i = 0; i < nbRequiredTransactions; i += 1) {

            const start = i * MAX_TOKENS_PER_REJECT
            const end = Math.min(this.rejectCandidates.value.length, start + MAX_TOKENS_PER_REJECT)
            console.log(`rejecting tokens from ${start} to ${end}`)
            const rejected = this.rejectCandidates.value.slice(start, end)
            const transaction = new TokenRejectTransaction()

            for (const t of rejected) {
                if ((t as Nft).serial_number) {
                    transaction.addNftId(new NftId(TokenId.fromString(t.token_id!), (t as Nft).serial_number))
                } else {
                    transaction.addTokenId(TokenId.fromString(t.token_id!))
                }
                TokenAssociationCache.instance.forgetTokenAssociation(walletManager.accountId.value!, t.token_id!)
            }

            result.push(walletManager.rejectTokens(transaction))
        }

        return result
    }


    //
    // Private
    //

    private readonly tokensDidChange = async () => {

        this.rejectCandidates.value = []
        this.treasuryTokens.value = []
        this.pausedTokens.value = []
        this.frozenTokens.value = []
        this.zeroBalanceTokens.value = []

        this.filtering.value = true

        try {
            for (const t of this.tokens.value) {
                let isTreasury = false
                let isPaused = false

                if ((await TokenInfoCache.instance.lookup(t.token_id!))?.treasury_account_id === walletManager.accountId.value) {
                    isTreasury = true
                    this.treasuryTokens.value.push(t.token_id!)
                }
                if ((await TokenInfoCache.instance.lookup(t.token_id!))?.pause_status === 'PAUSED') {
                    isPaused = true
                    this.pausedTokens.value.push(t.token_id!)
                }
                const associations = await TokenAssociationCache.instance.lookup(
                    TokenAssociationCache.makeAssociationKey(walletManager.accountId.value!, t.token_id!)
                )
                const isFrozen = associations && associations.length >= 1 && associations[0].freeze_status === FreezeStatus.FROZEN
                if (isFrozen) {
                    this.frozenTokens.value.push((t.token_id!))
                }
                const balance = (associations && associations.length >= 1) ? associations[0].balance : 0
                if (balance === 0) {
                    this.zeroBalanceTokens.value.push(t.token_id!)
                }
                if (!isTreasury && !isPaused && !isFrozen && balance > 0) {
                    console.log(`Adding token ${t.token_id} to the TokenRejectTransaction`)
                    this.rejectCandidates.value.push(t)
                }
            }
        } finally {
            this.filtering.value = false
        }
    }

}
