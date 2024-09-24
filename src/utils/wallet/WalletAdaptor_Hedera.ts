// noinspection DuplicatedCode

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


import {
    AccountAllowanceApproveTransaction,
    AccountAllowanceDeleteTransaction,
    AccountId,
    AccountUpdateTransaction,
    ContractExecuteTransaction,
    NftId,
    TokenAssociateTransaction,
    TokenDissociateTransaction,
    TokenId,
    TokenRejectTransaction,
    TransactionId,
    TransactionResponse,
    TransactionResponseJSON
} from "@hashgraph/sdk";
import {ContractResultDetails, Transaction} from "@/schemas/HederaSchemas";
import {waitFor} from "@/utils/TimerUtils";
import {TransactionByIdCache} from "@/utils/cache/TransactionByIdCache";
import {WalletAdaptor, WalletAdaptorCancelError} from "@/utils/wallet/WalletAdaptor";
import {hexToByte} from "@/utils/B64Utils";
import {ContractResultByTransactionIdCache} from "@/utils/cache/ContractResultByTransactionIdCache";
import {ExplorerSignClient} from "@/utils/wallet/ExplorerSignClient";

export class WalletAdapter_Hedera extends WalletAdaptor {

    //
    // Public
    //

    public async rejectTokens(tokenIds: string[]): Promise<string> {
        const trans = new TokenRejectTransaction()
        trans.setTokenIds(tokenIds.map(tokenId => TokenId.fromString(tokenId)))
        trans.setOwnerId(AccountId.fromString(this.accountId))
        const result = await this.executeTransaction(trans)
        await this.waitForTransactionSurfacing(result)
        return Promise.resolve(result)
    }

    public async changeStaking(stakedNodeId: number | null, stakedAccountId: string | null, declineReward: boolean | null): Promise<string> {

        const trans = new AccountUpdateTransaction()
        trans.setAccountId(this.accountId)
        if (stakedNodeId !== null) {
            trans.setStakedNodeId(stakedNodeId)
        } else if (stakedAccountId !== null) {
            trans.setStakedAccountId(stakedAccountId)
        } else {
            trans.setStakedNodeId(-1)
            trans.setStakedAccountId("0.0.0")
        }
        if (declineReward !== null) {
            trans.setDeclineStakingReward(declineReward)
        }

        const result = await this.executeTransaction(trans)

        return Promise.resolve(result)
    }

    public async approveHbarAllowance(spender: string, amount: number): Promise<string> {

        const trans = new AccountAllowanceApproveTransaction()
        trans.approveHbarAllowance(this.accountId, spender, amount)
        const result = await this.executeTransaction(trans)

        return Promise.resolve(result)
    }

    public async approveTokenAllowance(token: string, spender: string, amount: number): Promise<string> {

        const trans = new AccountAllowanceApproveTransaction()
        trans.approveTokenAllowance(token, this.accountId, spender, amount)
        const result = await this.executeTransaction(trans)

        return Promise.resolve(result)
    }

    public async approveNFTAllowance(token: string, spender: string, serialNumbers: number[]): Promise<string> {

        const trans = new AccountAllowanceApproveTransaction()
        if (1 <= serialNumbers.length && serialNumbers.length <= 20) {
            const tid = TokenId.fromString(token)
            for (const sn of serialNumbers) {
                trans.approveTokenNftAllowance(new NftId(tid, sn), this.accountId, spender)
            }
        } else if (serialNumbers.length == 0) {
            trans.approveTokenNftAllowanceAllSerials(token, this.accountId, spender)
        } else {
            throw this.callFailure("Invalid serial number count (" + serialNumbers.length + ")")
        }
        const result = await this.executeTransaction(trans)

        return Promise.resolve(result)
    }

    public async deleteNftAllowance(token: string, serial: number): Promise<string> {

        const trans = new AccountAllowanceDeleteTransaction()
        const tokenId = TokenId.fromString(token)
        trans.deleteAllTokenNftAllowances(new NftId(tokenId, serial), this.accountId)
        const result = await this.executeTransaction(trans)

        return Promise.resolve(result)
    }

    public async deleteNftAllSerialsAllowance(token: string, spender: string): Promise<string> {

        const trans = new AccountAllowanceApproveTransaction()
        trans.deleteTokenNftAllowanceAllSerials(token, this.accountId, spender)
        const result = await this.executeTransaction(trans)

        return Promise.resolve(result)
    }


    //
    // WalletAdapter
    //

    public async associateToken(tokenId: string): Promise<string> {
        // https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service/associate-tokens-to-an-account
        const trans = new TokenAssociateTransaction()
        trans.setAccountId(this.accountId)
        trans.setTokenIds([tokenId])
        const result = await this.executeTransaction(trans)
        await this.waitForTransactionSurfacing(result)
        return Promise.resolve(result)
    }

    public async dissociateToken(tokenId: string): Promise<string> {
        // https://docs.hedera.com/hedera/sdks-and-apis/sdks/token-service/dissociate-tokens-from-an-account
        const trans = new TokenDissociateTransaction()
        trans.setAccountId(AccountId.fromString(this.accountId))
        trans.setTokenIds([tokenId])
        const result = await this.executeTransaction(trans)
        await this.waitForTransactionSurfacing(result)
        return Promise.resolve(result)
    }

    public async callContract(contractId: string, functionData: string): Promise<ContractResultDetails | string> {
        let result: string | ContractResultDetails

        const fp = hexToByte(functionData)
        if (fp !== null) {
            const trans = new ContractExecuteTransaction()
            trans.setContractId(contractId)
            trans.setFunctionParameters(fp)
            trans.setGas(75000)
            const transactionId = await this.executeTransaction(trans)
            result = await this.waitForContractResultSurfacing(transactionId)
        } else {
            throw this.callFailure("invalid function data")
        }

        return Promise.resolve(result)
    }

    //
    // Private
    //

    private async executeTransaction(
        transaction: AccountAllowanceApproveTransaction
            | AccountUpdateTransaction
            | AccountAllowanceDeleteTransaction
            | TokenAssociateTransaction
            | TokenDissociateTransaction
            | TokenRejectTransaction
            | ContractExecuteTransaction): Promise<string> {

        let result: string

        try {
            transaction.setNodeAccountIds([new AccountId(3), new AccountId(4), new AccountId(5)])
            transaction.setTransactionId(TransactionId.generate(AccountId.fromString(this.accountId)))
            transaction.freeze()
            const transactionBytes = transaction.toBytes()
            const transactionBase64 = Buffer.from(transactionBytes).toString('base64')

            const r = await this.signClient.signAndExecute_hedera(this.session, this.network, this.accountId, transactionBase64)
            const tr = TransactionResponse.fromJSON(r as TransactionResponseJSON)
            result = tr.transactionId.toString()
        } catch(reason) {
            if (ExplorerSignClient.isUserRejectError(reason)) {
                throw new WalletAdaptorCancelError()
            } else {
                throw this.callFailure(reason)
            }
        }

        return Promise.resolve(result)
    }


    private async waitForTransactionSurfacing(transactionId: string): Promise<Transaction | string> {
        let result: Promise<Transaction | string>

        try {
            let counter = 10
            let transaction: Transaction | null = null
            while (counter > 0 && transaction === null) {
                await waitFor(3000)
                transaction = await TransactionByIdCache.instance.lookup(transactionId, true)
                counter -= 1
            }
            result = Promise.resolve(transaction ?? transactionId)
        } catch {
            result = Promise.resolve(transactionId)
        }

        return result
    }



    protected async waitForContractResultSurfacing(transactionId: string): Promise<ContractResultDetails | string> {
        let result: Promise<ContractResultDetails | string>

        try {
            let counter = 10
            let contractResult: ContractResultDetails | null = null
            while (counter > 0 && contractResult === null) {
                await waitFor(3000)
                contractResult = await ContractResultByTransactionIdCache.instance.lookup(transactionId, true)
                counter -= 1
            }
            result = Promise.resolve(contractResult ?? transactionId)
        } catch {
            result = Promise.resolve(transactionId)
        }

        return result
    }

}
