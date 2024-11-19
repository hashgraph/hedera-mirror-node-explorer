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

import {computed, ref, Ref, watch, WatchStopHandle} from "vue"
import {NftTransactionTransfer, TokenRelationship, TransactionType,} from "@/schemas/MirrorNodeSchemas"
import {EntityDescriptor} from "@/utils/EntityDescriptor"
import {TokenRelationshipCache} from "@/utils/cache/TokenRelationshipCache"

export class NftTransactionAnalyzer {
    public readonly transaction: Ref<NftTransactionTransfer | null>
    public readonly entityDescriptor = ref(
        EntityDescriptor.DEFAULT_ENTITY_DESCRIPTOR,
    )
    public readonly tokenRelationships: Ref<TokenRelationship[]> = ref([])
    private readonly watchHandles: WatchStopHandle[] = []

    //
    // Public
    //

    public constructor(transaction: Ref<NftTransactionTransfer | null>) {
        this.transaction = transaction
    }

    public mount(): void {
        this.watchHandles.push(
            watch(this.transaction, this.transactionDidChange, {
                immediate: true,
            }),
        )
    }

    public unmount(): void {
        this.watchHandles.map((wh) => wh())
        this.watchHandles.splice(0)
    }

    public readonly consensusTimestamp = computed(
        () => this.transaction.value?.consensus_timestamp ?? null,
    )

    public readonly transactionType = computed(
        () => this.transaction.value?.type ?? null,
    )

    public readonly entityId = computed(
        () => this.transaction.value?.sender_account_id ?? null,
    )

    public readonly isTokenAssociation = computed(
        () => this.transactionType.value === TransactionType.TOKENASSOCIATE,
    )

    public readonly tokens = computed(() => {
        const result: string[] = []
        for (const r of this.tokenRelationships.value) {
            if (r.token_id) {
                result.push(r.token_id)
            }
        }
        return result
    })

    //
    // Private
    //

    private readonly transactionDidChange = async () => {
        if (this.transaction.value !== null) {
            if (
                this.isTokenAssociation.value &&
                this.consensusTimestamp.value !== null &&
                this.entityId.value !== null
            ) {
                const r = await TokenRelationshipCache.instance.lookup(
                    this.entityId.value,
                )
                this.tokenRelationships.value = this.filterTokenRelationships(
                    r ?? [],
                    this.consensusTimestamp.value,
                )
            } else {
                this.tokenRelationships.value = []
            }
        } else {
            this.tokenRelationships.value = []
        }
    }

    private filterTokenRelationships(
        relationships: TokenRelationship[],
        createdTimestamp: string,
    ): TokenRelationship[] {
        const result: TokenRelationship[] = []
        for (const r of relationships) {
            if (r.created_timestamp === createdTimestamp && r.token_id) {
                result.push(r)
            }
        }
        return result
    }
}
