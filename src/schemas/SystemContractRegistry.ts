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

export class SystemContractRegistry {

    private readonly entries = new Map<string, SystemContractEntry>()

    constructor() {
        this.addEntry("0.0.359", "Hedera Token Service System Contract", [
            // https://github.com/hashgraph/hedera-services/blob/master/hedera-node/hedera-mono-service/src/main/java/com/hedera/services/store/contracts/precompile/AbiConstants.java

            // https://hips.hedera.com/hip/hip-206
            ["0x189a554c", "cryptoTransfer((address,(address,int64)[],(address,address,int64)[])[]) -> (int)"],
            ["0x82bba493", "transferTokens(address,address[],int64[]) -> (int)"],
            ["0xeca36917", "transferToken(address,address,address,int64) -> (int)"],
            ["0x2c4ba191", "transferNFTs(address,address[],address[],int64[]) -> (int)"],
            ["0x5cfc9011", "transferNFT(address,address,address,int64) -> (int)"],
            ["0x278e0b88", "mintToken(address,uint64,bytes[]) -> (int,uint64,int[])"],
            ["0xacb9cff9", "burnToken(address,uint64,int64[]) -> (int,uint64)"],
            ["0x2e63879b", "associateTokens(address,address[]) -> (int)"],
            ["0x49146bde", "associateToken(address,address[]) -> (int)"],
            ["0x78b63918", "dissociateTokens(address,address[]) -> (int)"],
            ["0x099794e8", "dissociateToken(address,address[]) -> (int)"],

            // https://hips.hedera.com/hip/hip-514
            ["0xf069f712", "deleteToken(address token)"],
            ["0x7c41ad2c", "pauseToken(address)"],
            ["0x3b3bff0f", "unpauseToken(address)"],
            ["0x927da105", "allowance(address, address, address) -> (int64, uint256)"],
            ["0xe1f21c67", "approve(address, address, uint256) -> (int64)"],
            ["0x7336aaf0", "approveNFT(address, address, uint256) -> (int64)"], // 0x10585c46 in HIP-514 : bug ?
            ["0x367605ca", "setApprovalForAll(address, address, bool) -> (int64)"],
            ["0x098f2366", "getApproved(address, uint256) -> (int64, address)"], // 0x01b2194b in HIP-514  bug ?
            ["0xf49f40db", "isApprovedForAll(address, address, address) -> (int64, bool)"],
            ["0x15dacbea", "transferFrom(address, address, address, uint256)"],
            ["0x9b23d3d9", "transferFromNFT(address, address, address, uint256)"],

            // https://hips.hedera.com/hip/hip-218
            // https://hips.hedera.com/hip/hip-376
            ["0x618dc65e", "redirectForToken(address token, bytes memory data)"],
            ["0x06fdde03", "name() -> (string)"],
            ["0x95d89b41", "symbol() -> (string)"],
            ["0x313ce567", "decimals() -> (uint8)"],
            ["0x18160ddd", "totalSupply() -> (uint256)"],
            ["0x70a08231", "balanceOf(address) -> (uint256)"],
            ["0xa9059cbb", "transfer(address, uint256) -> (bool)"],
            ["0x23b872dd", "transferFrom(address, address, uint256) -> (bool)"],
            ["0xdd62ed3e", "allowance(address, address) -> (uint256)"],
            ["0x095ea7b3", "approve(address to, uint256 tokenId) -> (bool)"],
            ["0xa22cb465", "setApprovalForAll(address, bool)"],
            ["0x081812fc", "getApproved(uint256) -> (address)"],
            ["0xe985e9c5", "isApprovedForAll(address, address) -> (bool)"],
            ["0x6352211e", "ownerOf(uint256)"],
            ["0xc87b56dd", "tokenURI(uint256)"],
            ["0x9790686d", "wipeTokenAccount(address, address, uint32)"],
            ["0xf7f38e26", "wipeTokenAccountNFT(address, address, int64[])"],
            ["0x46de0fb1", "isFrozen(address token, address account)"],
            ["0x5b8f8584", "freezeToken(address token, address account)"],
            ["0x52f91387", "unfreezeToken(address token, address account)"],
            ["0x2cccc36f", "updateTokenInfo(address token, HederaToken tokenInfo)"],
            ["0x18370d34", "updateTokenKeys(address token, TokenKey [])"],
            ["0x6fc3cbaf", "updateTokenKeys(address token, TokenKey [])"],
            ["0x3c4dd32e", "getTokenKey(address token, uint tokenType)"],

            // https://hips.hedera.com/hip/hip-358
            ["0x7812a04b", "createFungibleToken(HederaToken, uint, uint) -> (int, address)"],
            ["0xc23baeb6", "createFungibleToken(HederaToken, uint64, uint32) -> (int, address)"],
            ["0x4c381ae7", "createFungibleTokenWithCustomFees(HederaToken, uint64, uint32, FixedFee[], FractionalFee[]) -> (int, address)"],
            ["0xb937581a", "createFungibleTokenWithCustomFees(HederaToken, uint64, uint32, FixedFee[], FractionalFee[]) -> (int, address) // V2"],
            ["0x9dc711e0", "createNonFungibleToken(HederaToken) -> (int, address)"],
            ["0x9c89bb35", "createNonFungibleToken(HederaToken) -> (int, address) // V2"],
            ["0x5bc7c0e6", "createNonFungibleTokenWithCustomFees(HederaToken, FixedFee[], RoyaltyFee[]) -> (int, address)"],
            ["0x45733969", "createNonFungibleTokenWithCustomFees(HederaToken, FixedFee[], RoyaltyFee[], HederaToken) -> (int, address)"],

            // https://hips.hedera.com/hip/hip-514
            ["0x3f28a19b", "getFungibleTokenInfo(address) -> (int64, FungibleTokenInfo)"],
            ["0x1f69565f", "getTokenInfo(address) -> (int64, TokenInfo)"],
            ["0x287e1da8", "getNonFungibleTokenInfo(address, int64) -> (int64, NonFungibleTokenInfo)"],
            ["0xa7daa18d", "getTokenDefaultFreezeStatus(address) -> (int64, bool)"],
            ["0x335e04c1", "getTokenDefaultKycStatus(address) -> (int64, bool)"],
            ["0xf2c31ff4", "isKyc(address, address) -> (int64, bool)"],
            ["0x8f8d7f99", "grantTokenKyc(address, address) -> (int64)"],
            ["0xaf99c633", "revokeTokenKyc(address, address) -> (int64)"],
            ["0xae7611a0", "getTokenCustomFees(address) -> (int64, FixedFee[], FractionalFee[], RoyaltyFee[])"],
            ["0x19f37361", "isToken(address token) -> (int64, bool)"],
            ["0x93272baf", "getTokenType(address token) -> (int64, int32)"],
            ["0xd614cdb8", "getTokenExpiryInfo(address) -> (int64, Expiry)"],
            ["0x593d6e82", "updateTokenExpiryInfo(address, Expiry) -> (int64)"],
        ])

        this.addEntry("0.0.360", "Exchange Rate System Contract", [
            // https://hips.hedera.com/hip/hip-475
            // https://github.com/hashgraph/hedera-services/blob/master/hedera-node/hedera-mono-service/src/main/java/com/hedera/services/store/contracts/precompile/ExchangeRatePrecompiledContract.java#L54
            ["0x2e3cff6a", "tinycentsToTinybars(uint256) -> (uint256)"],
            ["0x43a88229", "tinybarsToTinycents(uint256) -> (uint256)"],
        ])

        this.addEntry("0.0.361", "PRNG Seed System Contract", [
            // https://hips.hedera.com/hip/hip-351
            // https://github.com/hashgraph/hedera-services/blob/master/hedera-node/hedera-mono-service/src/main/java/com/hedera/services/store/contracts/precompile/PrngSystemPrecompiledContract.java#L68
            ["0xd83bf9a1", "random256BitGenerator(uint256) -> ()"]
        ])
    }

    public lookup(contractId: string): SystemContractEntry | null {
        return this.entries.get(contractId) ?? null
    }

    private addEntry(contractId: string, description: string, signatures: [string, string][]) {
        if(!this.entries.get(contractId)) {
            this.entries.set(contractId, new SystemContractEntry(contractId, description, new Map(signatures)))
        }
    }
}

export class SystemContractEntry {

    public readonly contractId: string
    public readonly description: string
    public readonly signatures: Map<string, string>

    constructor(contractId: string, description: string, signatures: Map<string, string>) {
        this.contractId = contractId
        this.description = description
        this.signatures = signatures
    }
}

export const systemContractRegistry = new SystemContractRegistry()

