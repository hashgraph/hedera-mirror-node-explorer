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

export const DISASSEMBLER_TESTING_ASSETS = [
    {
        bytecode:
            '6080604052603e80600f5f395ff3fe60806040525f80fdfea2646970667358221220d8c7d282abb0ffe5ffaa3ade3e8405fff7c89ef4a3da325e2c9ea1c09924b7c264736f6c63430008150033',
        expectedDisassembly: [
            {index16: '0x0000', hex: '60', mnemonic: 'PUSH1', operand: ['80']},
            {index16: '0x0002', hex: '60', mnemonic: 'PUSH1', operand: ['40']},
            {index16: '0x0004', hex: '52', mnemonic: 'MSTORE', operand: []},
            {index16: '0x0005', hex: '60', mnemonic: 'PUSH1', operand: ['3e']},
            {index16: '0x0007', hex: '80', mnemonic: 'DUP1', operand: []},
            {index16: '0x0008', hex: '60', mnemonic: 'PUSH1', operand: ['0f']},
            {index16: '0x000a', hex: '5f', mnemonic: 'PUSH0', operand: []},
            {index16: '0x000b', hex: '39', mnemonic: 'CODECOPY', operand: []},
            {index16: '0x000c', hex: '5f', mnemonic: 'PUSH0', operand: []},
            {index16: '0x000d', hex: 'f3', mnemonic: 'RETURN', operand: []},
            {index16: '0x000e', hex: 'fe', mnemonic: 'INVALID', operand: []},
            {index16: '0x000f', hex: '60', mnemonic: 'PUSH1', operand: ['80']},
            {index16: '0x0011', hex: '60', mnemonic: 'PUSH1', operand: ['40']},
            {index16: '0x0013', hex: '52', mnemonic: 'MSTORE', operand: []},
            {index16: '0x0014', hex: '5f', mnemonic: 'PUSH0', operand: []},
            {index16: '0x0015', hex: '80', mnemonic: 'DUP1', operand: []},
            {index16: '0x0016', hex: 'fd', mnemonic: 'REVERT', operand: []},
            {index16: '0x0017', hex: 'fe', mnemonic: 'INVALID', operand: []},
        ],
    },
    {
        bytecode:
            '6080604052348015600e575f80fd5b50603e80601a5f395ff3fe60806040525f80fdfea264697066735822122050e5031fe7e93a1922e48aa845237cf82fc6f3ab36fc1a876ad6fbeda900307a64736f6c63430008150033',
        expectedDisassembly: [
            {index16: '0x0000', hex: '60', mnemonic: 'PUSH1', operand: ['80']},
            {index16: '0x0002', hex: '60', mnemonic: 'PUSH1', operand: ['40']},
            {index16: '0x0004', hex: '52', mnemonic: 'MSTORE', operand: []},
            {index16: '0x0005', hex: '34', mnemonic: 'CALLVALUE', operand: []},
            {index16: '0x0006', hex: '80', mnemonic: 'DUP1', operand: []},
            {index16: '0x0007', hex: '15', mnemonic: 'ISZERO', operand: []},
            {index16: '0x0008', hex: '60', mnemonic: 'PUSH1', operand: ['0e']},
            {index16: '0x000a', hex: '57', mnemonic: 'JUMPI', operand: []},
            {index16: '0x000b', hex: '5f', mnemonic: 'PUSH0', operand: []},
            {index16: '0x000c', hex: '80', mnemonic: 'DUP1', operand: []},
            {index16: '0x000d', hex: 'fd', mnemonic: 'REVERT', operand: []},
            {index16: '0x000e', hex: '5b', mnemonic: 'JUMPDEST', operand: []},
            {index16: '0x000f', hex: '50', mnemonic: 'POP', operand: []},
            {index16: '0x0010', hex: '60', mnemonic: 'PUSH1', operand: ['3e']},
            {index16: '0x0012', hex: '80', mnemonic: 'DUP1', operand: []},
            {index16: '0x0013', hex: '60', mnemonic: 'PUSH1', operand: ['1a']},
            {index16: '0x0015', hex: '5f', mnemonic: 'PUSH0', operand: []},
            {index16: '0x0016', hex: '39', mnemonic: 'CODECOPY', operand: []},
            {index16: '0x0017', hex: '5f', mnemonic: 'PUSH0', operand: []},
            {index16: '0x0018', hex: 'f3', mnemonic: 'RETURN', operand: []},
            {index16: '0x0019', hex: 'fe', mnemonic: 'INVALID', operand: []},
            {index16: '0x001a', hex: '60', mnemonic: 'PUSH1', operand: ['80']},
            {index16: '0x001c', hex: '60', mnemonic: 'PUSH1', operand: ['40']},
            {index16: '0x001e', hex: '52', mnemonic: 'MSTORE', operand: []},
            {index16: '0x001f', hex: '5f', mnemonic: 'PUSH0', operand: []},
            {index16: '0x0020', hex: '80', mnemonic: 'DUP1', operand: []},
            {index16: '0x0021', hex: 'fd', mnemonic: 'REVERT', operand: []},
            {index16: '0x0022', hex: 'fe', mnemonic: 'INVALID', operand: []},
        ],
    },
];
