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

import {Transaction, TransactionType} from "@/schemas/HederaSchemas";

export class EntityDescriptor {

    constructor(
        readonly label: string,
        readonly routeName: string | null
    ) {
    }

    static makeEntityDescriptor(row: Transaction): EntityDescriptor {
        let result: EntityDescriptor
        switch (row.name) {

            case TransactionType.CONSENSUSCREATETOPIC:
            case TransactionType.CONSENSUSUPDATETOPIC:
            case TransactionType.CONSENSUSDELETETOPIC:
            case TransactionType.CONSENSUSSUBMITMESSAGE:
                result = new EntityDescriptor("Topic ID", "TopicDetails")
                break;

            case TransactionType.CONTRACTCALL:
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

            case TransactionType.TOKENBURN:
            case TransactionType.TOKENCREATION:
            case TransactionType.TOKENDELETION:
            case TransactionType.TOKENUPDATE:
            case TransactionType.TOKENFEESCHEDULEUPDATE:
            case TransactionType.TOKENFREEZE:
            case TransactionType.TOKENGRANTKYC:
            case TransactionType.TOKENMINT:
            case TransactionType.TOKENPAUSE:
            case TransactionType.TOKENREVOKEKYC:
            case TransactionType.TOKENUNFREEZE:
            case TransactionType.TOKENUNPAUSE:
            case TransactionType.TOKENWIPE:
                result = new EntityDescriptor("Token ID", "TokenDetails");
                break;

            case TransactionType.SYSTEMDELETE:
            case TransactionType.SYSTEMUNDELETE:
            case TransactionType.UNCHECKEDSUBMIT:
            case TransactionType.ETHEREUMTRANSACTION:
            default:
                result = new EntityDescriptor("Entity ID", null);
                break;
        }

        return result
    }
}