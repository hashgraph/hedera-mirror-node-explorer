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
      { index16: '0x0000', hex: '60', mnemonic: 'PUSH1', operand: ['80'] },
      { index16: '0x0004', hex: '60', mnemonic: 'PUSH1', operand: ['40'] },
      { index16: '0x0008', hex: '52', mnemonic: 'MSTORE', operand: [] },
      { index16: '0x000a', hex: '60', mnemonic: 'PUSH1', operand: ['3e'] },
      { index16: '0x000e', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x0010', hex: '60', mnemonic: 'PUSH1', operand: ['0f'] },
      { index16: '0x0014', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x0016', hex: '39', mnemonic: 'CODECOPY', operand: [] },
      { index16: '0x0018', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x001a', hex: 'f3', mnemonic: 'RETURN', operand: [] },
      { index16: '0x001c', hex: 'fe', mnemonic: 'INVALID', operand: [] },
      { index16: '0x001e', hex: '60', mnemonic: 'PUSH1', operand: ['80'] },
      { index16: '0x0022', hex: '60', mnemonic: 'PUSH1', operand: ['40'] },
      { index16: '0x0026', hex: '52', mnemonic: 'MSTORE', operand: [] },
      { index16: '0x0028', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x002a', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x002c', hex: 'fd', mnemonic: 'REVERT', operand: [] },
      { index16: '0x002e', hex: 'fe', mnemonic: 'INVALID', operand: [] },
    ],
  },
  {
    bytecode:
      '6080604052348015600e575f80fd5b50603e80601a5f395ff3fe60806040525f80fdfea264697066735822122050e5031fe7e93a1922e48aa845237cf82fc6f3ab36fc1a876ad6fbeda900307a64736f6c63430008150033',
    expectedDisassembly: [
      { index16: '0x0000', hex: '60', mnemonic: 'PUSH1', operand: ['80'] },
      { index16: '0x0004', hex: '60', mnemonic: 'PUSH1', operand: ['40'] },
      { index16: '0x0008', hex: '52', mnemonic: 'MSTORE', operand: [] },
      { index16: '0x000a', hex: '34', mnemonic: 'CALLVALUE', operand: [] },
      { index16: '0x000c', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x000e', hex: '15', mnemonic: 'ISZERO', operand: [] },
      { index16: '0x0010', hex: '60', mnemonic: 'PUSH1', operand: ['0e'] },
      { index16: '0x0014', hex: '57', mnemonic: 'JUMPI', operand: [] },
      { index16: '0x0016', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x0018', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x001a', hex: 'fd', mnemonic: 'REVERT', operand: [] },
      { index16: '0x001c', hex: '5b', mnemonic: 'JUMPDEST', operand: [] },
      { index16: '0x001e', hex: '50', mnemonic: 'POP', operand: [] },
      { index16: '0x0020', hex: '60', mnemonic: 'PUSH1', operand: ['3e'] },
      { index16: '0x0024', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x0026', hex: '60', mnemonic: 'PUSH1', operand: ['1a'] },
      { index16: '0x002a', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x002c', hex: '39', mnemonic: 'CODECOPY', operand: [] },
      { index16: '0x002e', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x0030', hex: 'f3', mnemonic: 'RETURN', operand: [] },
      { index16: '0x0032', hex: 'fe', mnemonic: 'INVALID', operand: [] },
      { index16: '0x0034', hex: '60', mnemonic: 'PUSH1', operand: ['80'] },
      { index16: '0x0038', hex: '60', mnemonic: 'PUSH1', operand: ['40'] },
      { index16: '0x003c', hex: '52', mnemonic: 'MSTORE', operand: [] },
      { index16: '0x003e', hex: '5f', mnemonic: 'PUSH0', operand: [] },
      { index16: '0x0040', hex: '80', mnemonic: 'DUP1', operand: [] },
      { index16: '0x0042', hex: 'fd', mnemonic: 'REVERT', operand: [] },
      { index16: '0x0044', hex: 'fe', mnemonic: 'INVALID', operand: [] },
    ],
  },
];
