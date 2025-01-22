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

import {computed, ref, Ref} from "vue";
import {walletManager} from "@/router.ts";
import {TransactionController} from "@/dialogs/transaction/TransactionController.ts";
import {
    AccountTextFieldController,
    AccountTextFieldState
} from "@/dialogs/transaction/common/AccountTextFieldController.ts";
import {TokenTextFieldController, TokenTextFieldState} from "@/dialogs/transaction/common/TokenTextFieldController.ts";
import {NetworkConfig} from "@/config/NetworkConfig.ts";
import {CryptoTextFieldController, HbarTextFieldState} from "@/dialogs/transaction/common/CryptoTextFieldController.ts";
import {
    TokenAmountTextFieldController,
    TokenAmountTextFieldState
} from "@/dialogs/transaction/common/TokenAmountTextFieldController.ts";

export class ApproveAllowanceController extends TransactionController {

    public readonly spenderController: AccountTextFieldController
    public readonly tokenController: TokenTextFieldController
    public readonly nftController: TokenTextFieldController
    public readonly cryptoController: CryptoTextFieldController
    public readonly tokenAmountController: TokenAmountTextFieldController

    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>, networkConfig: NetworkConfig) {
        super(showDialog)
        this.spenderController = new AccountTextFieldController(networkConfig)
        this.tokenController = new TokenTextFieldController(networkConfig, walletManager.accountId)
        this.nftController = new TokenTextFieldController(networkConfig, walletManager.accountId)
        this.cryptoController = new CryptoTextFieldController(true)
        this.tokenAmountController = new TokenAmountTextFieldController(this.tokenId, true)
    }

    public mount() {
        this.spenderController.mount()
        this.tokenController.mount()
        this.nftController.mount()
        // no mount() for this.cryptoController
        this.tokenAmountController.mount()
    }

    public unmount() {
        this.spenderController.input.value = ""
        this.tokenController.input.value = ""
        this.nftController.input.value = ""
        this.cryptoController.input.value = ""
        this.tokenAmountController.input.value = ""

        this.spenderController.unmount()
        this.tokenController.unmount()
        this.nftController.unmount()
        // no unmount() for this.cryptoController
        this.tokenAmountController.unmount()
    }


    public readonly allowanceChoice = ref("crypto") // crypto, token, nft

    public readonly feedbackMessage = computed(() => {
        let result: string|null
        if (this.spenderFeedbackMessage.value !== null) {
            result = this.spenderFeedbackMessage.value
        } else {
            switch(this.allowanceChoice.value) {
                case "crypto":
                    result = this.crytpoFeedbackMessage.value
                    break
                case "token":
                    result = this.tokenFeedbackMessage.value ?? this.tokenAmountFeedbackMessage.value
                    break
                case "nft":
                    result = this.nftFeedbackMessage.value ?? this.nftSerialsFeedbackMessage.value
                    break
                default:
                    result = null
                    break
            }
        }
        return result
    })

    //
    // TaskController
    //

    public canBeExecuted(): boolean {
        let result: boolean
        switch(this.allowanceChoice.value) {
            case "crypto":
                result = this.cryptoOK.value
                break
            case "token":
                result = this.tokenOK.value && this.tokenAmountOK.value
                break
            case "nft":
                result = this.nftOK.value && this.nftSerialsOK.value
                break
            default:
                result = false
                break
        }
        return result && this.spenderOK.value
    }

    public async executeTransaction(): Promise<string|null> {
        let result: string|null

        const spender = this.spender.value!
        switch(this.allowanceChoice.value) {
            case "crypto": {
                const cryptoUserAmount = this.cryptoUserAmount.value!
                result = await walletManager.approveHbarAllowance(spender, Number(cryptoUserAmount))
                break
            }
            case "token": {
                const tokenId = this.tokenId.value!
                const tokenAmount = this.tokenAmount.value!
                result = await walletManager.approveTokenAllowance(tokenId, spender, Number(tokenAmount))
                break
            }
            case "nft": {
                const nftId = this.nftId.value!
                const nftSerials = this.nftSerials.value!
                result = await walletManager.approveNFTAllowance(nftId, spender, nftSerials)
                break
            }
            default: {
                result = null
                break
            }
        }

        return Promise.resolve(result)
    }

    //
    // Private
    //

    //
    // sender
    //

    private readonly spender = computed(() => this.spenderController.accountId.value)

    private readonly spenderOK = computed(() =>
        this.spenderController.accountId.value !== null &&
        this.spenderController.accountId.value !== walletManager.accountId.value &&
        this.spenderController.accountInfo.value !== null)

    private readonly spenderFeedbackMessage = computed(() => {
        let result: string|null
        switch(this.spenderController.state.value) {
            case AccountTextFieldState.empty:
                result = null
                break
            case AccountTextFieldState.invalid:
                result = "Invalid spender ID"
                break
            case AccountTextFieldState.ok:
                if (this.spenderController.accountInfo.value === null && this.spenderController.isLoaded.value) {
                    result = "Unknown spender"
                } else {
                    result = null
                }
                break
            default:
                result = null
                break
        }
        return result
    })

    //
    // crypto
    //

    private readonly cryptoOK = computed(() => this.cryptoController.tinyAmount.value !== null)

    private readonly cryptoUserAmount = computed(() => this.cryptoController.userAmount.value)

    private readonly crytpoFeedbackMessage = computed(() => {
        let result: string|null
        switch(this.cryptoController.state.value) {
            case HbarTextFieldState.empty:
                result = null
                break
            case HbarTextFieldState.invalidSyntax:
                result = "Invalid HBAR amount"
                break
            case HbarTextFieldState.unexpectedNegative:
                result = "Positive amount is expected"
                break;
            case HbarTextFieldState.unexpectedZero:
                result = "Amount cannot be zero"
                break;
            case HbarTextFieldState.ok:
            default:
                result = null
                break
        }
        return result
    })

    //
    // token id
    //

    private readonly tokenOK = computed(() =>
        this.tokenController.tokenId.value !== null &&
        this.tokenController.tokenInfo.value !== null &&
        this.tokenController.tokenInfo.value.type == "FUNGIBLE_COMMON" &&
        this.tokenController.isTokenAssociated.value)

    private readonly tokenId = computed(() => this.tokenController.tokenId.value)

    private readonly tokenFeedbackMessage = computed(() => {
        let result: string|null
        switch(this.tokenController.state.value) {
            case TokenTextFieldState.empty:
                result = null
                break
            case TokenTextFieldState.invalid:
                result = "Invalid token ID"
                break
            case TokenTextFieldState.ok: {
                const tokenInfo = this.tokenController.tokenInfo.value
                if (tokenInfo !== null) {
                    if (tokenInfo.type !== "FUNGIBLE_COMMON") {
                        result = "Token is not fungible"
                    } else {
                        const isAssociated = this.tokenController.isTokenAssociated.value
                        const isAssociationLoaded = this.tokenController.isTokenAssociationLoaded.value
                        if (isAssociationLoaded && !isAssociated) {
                            result = "Not associated with this account"
                        } else {
                            result = null
                        }
                    }
                } else if (this.tokenController.isLoaded.value) {
                    result = "Unknown token ID"
                } else {
                    result = null
                }
                break
            }
            default:
                result = null
                break
        }
        return result
    })

    //
    // token amount
    //

    private readonly tokenAmountOK = computed(() => this.tokenAmount.value !== null)

    private readonly tokenAmount = computed(() => this.tokenAmountController.tinyAmount.value)

    private readonly tokenAmountFeedbackMessage = computed(() => {
        let result: string|null
        switch(this.tokenAmountController.state.value) {
            case TokenAmountTextFieldState.empty:
                result = null
                break
            case TokenAmountTextFieldState.invalidSyntax:
                result = "Invalid token amount"
                break
            case TokenAmountTextFieldState.unexpectedNegative:
                result = "Positive amount is expected"
                break
            case TokenAmountTextFieldState.unexpectedZero:
                result = "Amount cannot be zero"
                break
            case TokenAmountTextFieldState.ok:
                result = null
                break
        }
        return result
    })

    //
    // nft id
    //

    private readonly nftOK = computed(() =>
        this.nftController.tokenId.value !== null &&
        this.nftController.tokenInfo.value !== null &&
        this.nftController.tokenInfo.value.type == "NON_FUNGIBLE_UNIQUE")

    private readonly nftId = computed(() => this.nftController.tokenId.value)

    private readonly nftFeedbackMessage = computed(() => {
        let result: string|null
        switch(this.nftController.state.value) {
            case TokenTextFieldState.empty:
                result = null
                break
            case TokenTextFieldState.invalid:
                result = "Invalid token ID"
                break
            case TokenTextFieldState.ok: {
                const tokenInfo = this.tokenController.tokenInfo.value
                if (tokenInfo !== null) {
                    result = tokenInfo.type === "NON_FUNGIBLE_UNIQUE" ? null : "Token is not an NFT"
                } else if (this.tokenController.isLoaded.value) {
                    result = "Unknown token"
                } else {
                    result = null
                }
                break
            }
            default:
                result = null
                break
        }
        return result
    })

    //
    // nft serials
    //

    private readonly nftSerialsOK = computed(() => false)

    private readonly nftSerials = computed(() => null)

    private readonly nftSerialsFeedbackMessage = computed(() => "To be implemented")


}
