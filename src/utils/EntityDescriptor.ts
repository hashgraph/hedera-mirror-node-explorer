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

import {Transaction, TransactionType} from "@/schemas/HederaSchemas";
import {ContractByIdCache} from "@/utils/cache/ContractByIdCache";
import {AccountByIdCache} from "@/utils/cache/AccountByIdCache";

export class EntityDescriptor {

    static DEFAULT_ENTITY_DESCRIPTOR = new EntityDescriptor("Entity ID", null)

    constructor(
        readonly label: string,
        readonly routeName: string | null
    ) {
    }

    static async makeEntityDescriptor(row: Transaction): Promise<EntityDescriptor> {
        let result: EntityDescriptor
        switch (row.name) {

            case TransactionType.CONSENSUSCREATETOPIC:
            case TransactionType.CONSENSUSUPDATETOPIC:
            case TransactionType.CONSENSUSDELETETOPIC:
            case TransactionType.CONSENSUSSUBMITMESSAGE:
                result = new EntityDescriptor("Topic ID", "TopicDetails")
                break;

            case TransactionType.ETHEREUMTRANSACTION:
                if (row.entity_id && await ContractByIdCache.instance.lookup(row.entity_id)) {
                    result = new EntityDescriptor("Contract ID", "ContractDetails")
                } else if (row.entity_id && await AccountByIdCache.instance.lookup(row.entity_id)) {
                    result = new EntityDescriptor("Account ID", "AccountDetails")
                } else {
                    result = new EntityDescriptor("Token ID", "TokenDetails")
                }
                break;

            case TransactionType.CONTRACTCALL:
                if (row.entity_id && await ContractByIdCache.instance.lookup(row.entity_id)) {
                    result = new EntityDescriptor("Contract ID", "ContractDetails")
                } else {
                    result = new EntityDescriptor("Token ID", "TokenDetails")
                }
                break;

            case TransactionType.CONTRACTDELETEINSTANCE:
            case TransactionType.CONTRACTCREATEINSTANCE:
            case TransactionType.CONTRACTUPDATEINSTANCE:
                result = new EntityDescriptor("Contract ID", "ContractDetails")
                break;

            case TransactionType.CRYPTOADDLIVEHASH:
            case TransactionType.CRYPTOCREATEACCOUNT:
            case TransactionType.CRYPTODELETE:
            case TransactionType.CRYPTOUPDATEACCOUNT:
            case TransactionType.CRYPTODELETELIVEHASH:
            case TransactionType.CRYPTOTRANSFER:
            case TransactionType.TOKENASSOCIATE:
            case TransactionType.TOKENDISSOCIATE:
            case TransactionType.CRYPTOAPPROVEALLOWANCE:
            case TransactionType.CRYPTODELETEALLOWANCE:
            case TransactionType.TOKENGRANTKYC:
            case TransactionType.TOKENREVOKEKYC:
            case TransactionType.TOKENFREEZE:
            case TransactionType.TOKENUNFREEZE:
            case TransactionType.TOKENREJECT:
                result = new EntityDescriptor("Account ID", "AccountDetails")
                break;

            case TransactionType.FILECREATE:
            case TransactionType.FILEDELETE:
            case TransactionType.FILEAPPEND:
            case TransactionType.FILEUPDATE:
            case TransactionType.FREEZE:
                result = new EntityDescriptor("File ID", null);
                break;

            case TransactionType.SCHEDULECREATE:
            case TransactionType.SCHEDULEDELETE:
            case TransactionType.SCHEDULESIGN:
                result = new EntityDescriptor("Schedule ID", null);
                break;

            case TransactionType.TOKENAIRDROP:
            case TransactionType.TOKENBURN:
            case TransactionType.TOKENCANCELAIRDROP:
            case TransactionType.TOKENCLAIMAIRDROP:
            case TransactionType.TOKENCREATION:
            case TransactionType.TOKENDELETION:
            case TransactionType.TOKENUPDATE:
            case TransactionType.TOKENUPDATENFTS:
            case TransactionType.TOKENFEESCHEDULEUPDATE:
            case TransactionType.TOKENMINT:
            case TransactionType.TOKENPAUSE:
            case TransactionType.TOKENUNPAUSE:
            case TransactionType.TOKENWIPE:
                result = new EntityDescriptor("Token ID", "TokenDetails");
                break;

            case TransactionType.SYSTEMDELETE:
            case TransactionType.SYSTEMUNDELETE:
            case TransactionType.UNCHECKEDSUBMIT:
            default:
                result = EntityDescriptor.DEFAULT_ENTITY_DESCRIPTOR;
                break;
        }

        return Promise.resolve(result)
    }
}