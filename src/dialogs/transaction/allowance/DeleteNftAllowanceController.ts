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
import {walletManager} from "@/router.ts";
import {TransactionController} from "@/dialogs/transaction/TransactionController.ts";
import {TokenInfo} from "@/schemas/MirrorNodeSchemas.ts";
import {EntityLookup} from "@/utils/cache/base/EntityCache.ts";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache.ts";

export class DeleteNftAllowanceController extends TransactionController {

    private readonly tokenLookup: EntityLookup<string, TokenInfo|null>


    //
    // Public
    //

    public constructor(showDialog: Ref<boolean>,
                       public readonly tokenId: Ref<string | null>,
                       public readonly spenderId: Ref<string | null>,
                       public readonly serial: Ref<number|null>) {
        super(showDialog)
        this.tokenLookup = TokenInfoCache.instance.makeLookup(this.tokenId)
    }

    public dialogStartShowing(): void {
        this.tokenLookup.mount()
    }

    public dialogStopShowing(): void {
        this.tokenLookup.unmount()
    }

    public readonly tokenName = computed(() => this.tokenLookup.entity.value?.name ?? null)


    //
    // TaskController
    //

    public canBeExecuted(): boolean {
        return this.spenderId.value !== null && this.tokenId.value !== null
    }

    public async executeTransaction(): Promise<string|null> {
        let result: string | null

        const tokenId = this.tokenId.value!
        const spenderId = this.spenderId.value!
        const serial = this.serial.value
        if (serial !== null) {
            result = await walletManager.deleteNftAllowance(tokenId, serial)
        } else {
            result = await walletManager.deleteNftAllSerialsAllowance(tokenId, spenderId)
        }
        return result
    }

}
