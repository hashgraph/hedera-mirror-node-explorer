/*-
 *
 * Hedera Mirror Node Explorer
 *
 * Copyright (C) 2021 - 2023 Hedera Hashgraph, LLC
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
      { index16: '0x0', hex: '60', mnemonic: 'PUSH1', operand: ['80'] },
      { index16: '0x4', hex: '60', mnemonic: 'PUSH1', operand: ['40'] },
      { index16: '0x8', hex: '52', mnemonic: 'MSTORE', operand: [] },
      { index16: '0xa', hex: '60', mnemonic: 'PUSH1', operand: ['3e'] },
      { index16: '0xe', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x10', hex: '60', mnemonic: 'PUSH1', operand: ['0f'] },
      { index16: '0x14', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x16', hex: '39', mnemonic: 'CODECOPY', operand: [] },
      { index16: '0x18', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x1a', hex: 'f3', mnemonic: 'RETURN', operand: [] },
      { index16: '0x1c', hex: 'fe', mnemonic: 'INVALID', operand: [] },
      { index16: '0x1e', hex: '60', mnemonic: 'PUSH1', operand: ['80'] },
      { index16: '0x22', hex: '60', mnemonic: 'PUSH1', operand: ['40'] },
      { index16: '0x26', hex: '52', mnemonic: 'MSTORE', operand: [] },
      { index16: '0x28', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x2a', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x2c', hex: 'fd', mnemonic: 'REVERT', operand: [] },
      { index16: '0x2e', hex: 'fe', mnemonic: 'INVALID', operand: [] },
    ],
  },
  {
    bytecode:
      '6080604052348015600e575f80fd5b50603e80601a5f395ff3fe60806040525f80fdfea264697066735822122050e5031fe7e93a1922e48aa845237cf82fc6f3ab36fc1a876ad6fbeda900307a64736f6c63430008150033',
    expectedDisassembly: [
      { index16: '0x0', hex: '60', mnemonic: 'PUSH1', operand: ['80'] },
      { index16: '0x4', hex: '60', mnemonic: 'PUSH1', operand: ['40'] },
      { index16: '0x8', hex: '52', mnemonic: 'MSTORE', operand: [] },
      { index16: '0xa', hex: '34', mnemonic: 'CALLVALUE', operand: [] },
      { index16: '0xc', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0xe', hex: '15', mnemonic: 'ISZERO', operand: [] },
      { index16: '0x10', hex: '60', mnemonic: 'PUSH1', operand: ['0e'] },
      { index16: '0x14', hex: '57', mnemonic: 'JUMPI', operand: [] },
      { index16: '0x16', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x18', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x1a', hex: 'fd', mnemonic: 'REVERT', operand: [] },
      { index16: '0x1c', hex: '5b', mnemonic: 'JUMPDEST', operand: [] },
      { index16: '0x1e', hex: '50', mnemonic: 'POP', operand: [] },
      { index16: '0x20', hex: '60', mnemonic: 'PUSH1', operand: ['3e'] },
      { index16: '0x24', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x26', hex: '60', mnemonic: 'PUSH1', operand: ['1a'] },
      { index16: '0x2a', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x2c', hex: '39', mnemonic: 'CODECOPY', operand: [] },
      { index16: '0x2e', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x30', hex: 'f3', mnemonic: 'RETURN', operand: [] },
      { index16: '0x32', hex: 'fe', mnemonic: 'INVALID', operand: [] },
      { index16: '0x34', hex: '60', mnemonic: 'PUSH1', operand: ['80'] },
      { index16: '0x38', hex: '60', mnemonic: 'PUSH1', operand: ['40'] },
      { index16: '0x3c', hex: '52', mnemonic: 'MSTORE', operand: [] },
      { index16: '0x3e', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x40', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x42', hex: 'fd', mnemonic: 'REVERT', operand: [] },
      { index16: '0x44', hex: 'fe', mnemonic: 'INVALID', operand: [] },
    ],
  },
];
