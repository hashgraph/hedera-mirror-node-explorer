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

import {computed, ComputedRef, ref, Ref} from "vue";
import {TaskController} from "@/dialogs/core/task/TaskController.ts";
import {SourcifyUtils, SourcifyVerifyCheckedContract} from "@/utils/sourcify/SourcifyUtils.ts";
import {gtagVerifyContract} from "@/gtag.ts";
import {ContractSourceAnalyzer, ContractSourceAnalyzerItem} from "@/utils/analyzer/ContractSourceAnalyzer.ts";

export class ContractVerificationController extends TaskController {


    public readonly contractId: Ref<string|null>
    public readonly items:  ComputedRef<ContractSourceAnalyzerItem[]>
    private readonly contractSourceAnalyzer: ContractSourceAnalyzer


    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>, contractId: Ref<string | null>) {
        super(showDialog)
        this.contractId = contractId
        this.contractSourceAnalyzer = new ContractSourceAnalyzer(this.contractId)
        this.items = this.contractSourceAnalyzer.items

    }


    public readonly matchingContractName = computed(
        () => this.contractSourceAnalyzer.matchingContract.value?.name ?? null)

    public readonly newMatchingContract = ref<SourcifyVerifyCheckedContract|null>(null)
    public readonly verificationError = ref<unknown>(null)

    //
    // Status
    //

    public readonly status = computed(() => {
        let result: string
        if (this.contractSourceAnalyzer.analyzing.value) {
            result = "Analyzing…"
        } else if (this.contractSourceAnalyzer.failure.value) {
            result = "Analysis failed"
        } else if (this.contractSourceAnalyzer.matchingContract.value !== null) {
            const matchingContract = this.contractSourceAnalyzer.matchingContract.value
            const note = matchingContract.status == "perfect" ? "full match" : "partial match"
            result = "Ready to verify contract \"" + this.contractSourceAnalyzer.matchingContractName.value + "\" (" + note + ")"
        } else if (this.contractSourceAnalyzer.contractCount.value == 0 && this.contractSourceAnalyzer.unusedCount.value >= 1) {
            result = "Add contract metadata json"
        } else {
            result = "Drop files…"
        }
        return result
    })

    //
    // Public (success)
    //

    public readonly mainSuccessMessage = computed(() => {
        let result: string|null
        if (this.newMatchingContract.value !== null) {
            const status = this.newMatchingContract.value.status
            if (status == "perfect" || status == "partial") {
                result = "Verification succeeded"
            } else {
                result = "Verification failed"
            }
        } else {
            result = null
        }
        return result
    })

    public readonly extraSuccessMessage = computed(() => {
        let result: string|null
        if (this.newMatchingContract.value !== null) {
            const status = this.newMatchingContract.value.status
            if (status == "perfect" || status == "partial") {
                result = status == "perfect" ? "Full Match" : "Partial Match"
            } else {
                result = this.newMatchingContract.value.statusMessage ?? null
            }
        } else {
            result = null
        }
        return result
    })

    //
    // Public (error)
    //

    public readonly extraErrorMessage = computed(() => {
        let result: string|null
        if (this.verificationError.value !== null) {
            result = (this.verificationError.value as any).toString()
        } else {
            result = null
        }
        return result
    })

    //
    // User actions
    //

    public async handleClearAllFiles(): Promise<void> {
        await this.contractSourceAnalyzer.reset()
    }

    public async chooseFiles(fileList: FileList): Promise<void> {
        await this.contractSourceAnalyzer.chooseFiles(fileList)
    }

    public async dropFiles(transferList: DataTransferItemList): Promise<void> {
        await this.contractSourceAnalyzer.dropFiles(transferList)
    }

    //
    // TaskController
    //

    public canBeExecuted(): boolean {
        return !this.contractSourceAnalyzer.analyzing.value
            && this.contractSourceAnalyzer.matchingContractName.value !== null
    }

    public async execute(): Promise<void> {
        const contractId = this.contractId.value!
        const matchingContract = this.contractSourceAnalyzer.matchingContract.value!

        try {
            const verificationIds = [matchingContract.verificationId]
            const response = await SourcifyUtils.sessionVerifyChecked(contractId, verificationIds, true)
            this.newMatchingContract.value = SourcifyUtils.fetchMatchingContract(response)
            this.verificationError.value = null
        } catch (reason) {
            this.newMatchingContract.value = null
            this.verificationError.value = reason
            throw reason
        } finally {
            gtagVerifyContract(this.mainSuccessMessage.value ?? "Verification failed")
        }
    }

    public dialogStopShowing(): void {
        this.contractSourceAnalyzer.reset().catch()
    }
}
