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


import {ethers} from "ethers";
import {ContractCallRequest, ContractCallResponse} from "@/schemas/MirrorNodeSchemas.ts";
import axios from "axios";

export class ERCUtils {


    //
    // Public (ERC20, ERC721)
    //

    public static async loadName(contractAddress: string):Promise<string|null> {
        // https://eips.ethereum.org/EIPS/eip-20
        const abi = "function name() public view returns (string)"
        const results = await this.call(contractAddress, abi, [])
        const result = results !== null ? results[0] as string : null
        return Promise.resolve(result)
    }

    public static async loadSymbol(contractAddress: string): Promise<string|null> {
        // https://eips.ethereum.org/EIPS/eip-20
        const abi = "function symbol() public view returns (string)"
        const results = await this.call(contractAddress, abi, [])
        const result = results !== null ? results[0] as string : null
        return Promise.resolve(result)
    }

    //
    // Public (ERC20)
    //

    public static async loadDecimals(contractAddress: string): Promise<number|null> {
        // https://eips.ethereum.org/EIPS/eip-20
        const abi = "function decimals() public view returns (uint8)"
        const results = await this.call(contractAddress, abi, [])
        const result = results !== null ? Number(results[0]) : null
        return Promise.resolve(result)
    }

    public static async loadTotalSupply(contractAddress: string): Promise<string|null> {
        // https://eips.ethereum.org/EIPS/eip-20
        const abi = "function totalSupply() public view returns (uint256)"
        const results = await this.call(contractAddress, abi, [])
        const result = results !== null ? results[0] as string : null
        return Promise.resolve(result)
    }



    //
    // Private
    //

    private static async call(targetAddress: string, abi: string, values: unknown[]): Promise<unknown[]|null> {
        let result: unknown[] | null
        const itf = new ethers.Interface([abi])
        const functionData = itf.encodeFunctionData(abi, values)
        const url = "api/v1/contracts/call"
        const body: ContractCallRequest = {
            data: functionData,
            to: targetAddress,
        }
        try {
            const response = await axios.post<ContractCallResponse>(url, body)
            result = itf.decodeFunctionResult(abi, response.data.result)
        } catch(error) {
            result = null
        }
        return result
    }
}
