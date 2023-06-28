/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2022 Hedera Hashgraph, LLC
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


import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";
import {BlockByTsCache} from "@/utils/cache/BlockByTsCache";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {ContractResultByHashCache} from "@/utils/cache/ContractResultByHashCache";
import {TransactionByHashCache} from "@/utils/cache/TransactionByHashCache";
import {TransactionByIdCache} from "@/utils/cache/TransactionByIdCache";
import {TransactionByTsCache} from "@/utils/cache/TransactionByTsCache";
import {TransactionGroupCache} from "@/utils/cache/TransactionGroupCache";
import {TokenInfoCache} from "@/utils/cache/TokenInfoCache";
import {TopicMessageCache} from "@/utils/cache/TopicMessageCache";
import {BlockByNbCache} from "@/utils/cache/BlockByNbCache";
import {BlockByHashCache} from "@/utils/cache/BlockByHashCache";
import {StakeCache} from "@/utils/cache/StakeCache";
import {AccountByAliasCache} from "@/utils/cache/AccountByAliasCache";
import {AccountByAddressCache} from "@/utils/cache/AccountByAddressCache";
import {TransactionGroupByBlockCache} from "@/utils/cache/TransactionGroupByBlockCache";
import {TokenRelationshipCache} from "@/utils/cache/TokenRelationshipCache";
import {AssetCache} from "@/utils/cache/AssetCache";
import {BalanceCache} from "@/utils/cache/BalanceCache";
import {NetworkCache} from "@/utils/cache/NetworkCache";
import {ContractByAddressCache} from "@/utils/cache/ContractByAddressCache";
import {HbarPriceCache} from "@/utils/cache/HbarPriceCache";
import {ContractResultByTransactionIdCache} from "@/utils/cache/ContractResultByTransactionIdCache";
import {ContractResultByTsCache} from "@/utils/cache/ContractResultByTsCache";
import {SourcifyCache} from "@/utils/cache/SourcifyCache";

export class CacheUtils {

    public static clearAll(): void {
        AccountByAddressCache.instance.clear()
        AccountByAliasCache.instance.clear()
        AccountByIdCache.instance.clear()
        AssetCache.instance.clear()
        BalanceCache.instance.clear()
        BlockByNbCache.instance.clear()
        BlockByHashCache.instance.clear()
        BlockByTsCache.instance.clear()
        ContractByIdCache.instance.clear()
        ContractByAddressCache.instance.clear()
        ContractResultByHashCache.instance.clear()
        ContractResultByTransactionIdCache.instance.clear()
        ContractResultByTsCache.instance.clear()
        HbarPriceCache.instance.clear()
        // IPFSCache.instance => no clear: we preserve it because IPFS content is valid for all networks
        NetworkCache.instance.clear()
        SourcifyCache.instance.clear()
        StakeCache.instance.clear()
        TokenInfoCache.instance.clear()
        TokenRelationshipCache.instance.clear()
        TransactionByHashCache.instance.clear()
        TransactionByIdCache.instance.clear()
        TransactionByTsCache.instance.clear()
        TransactionGroupCache.instance.clear()
        TransactionGroupByBlockCache.instance.clear()
        TopicMessageCache.instance.clear()
    }
}
