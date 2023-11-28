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


import { describe, test, expect } from 'vitest'
import {Utils} from '@/utils/bytecode_tools/disassembler/Utils/index.ts'
import { DISASSEMBLER_TESTING_ASSETS } from './bytecode_assets';
import {EVM_OPCODES} from '@/utils/bytecode_tools/disassembler/evm_opcodes/index.ts'
import {Disassembler} from '@/utils/bytecode_tools/disassembler/BytecodeDisassembler.ts'

describe('EVM Bytecode Disassembler Tests', () => {
  describe('Utility functions tests', () => {
    test('Should prepare a valid bytecode', () => {
      const BYTECODE = '  0x6080604052603e80600f5f395ff3fe ';
      const EXPECTED_SANITIZED_BYTECODE = '6080604052603e80600f5f395ff3fe';

      const sanitizedBytecode = Utils.prepBytecode(BYTECODE);

      expect(sanitizedBytecode).to.eq(EXPECTED_SANITIZED_BYTECODE);
    });

    test('Should return null if bytecode has odd length', () => {
      const BYTECODE = '0x40F';

      expect(Utils.prepBytecode(BYTECODE)).to.be.null;
    });

    test('Should get operands for opcodes in PUSH family', () => {
      const bytecode = '6380401abf2d5f'; // must be proper and clean bytecode
      const index = 0;
      const opcode = EVM_OPCODES.get(bytecode.substring(index, index + 2)); // PUSH4

      // @notice 63 = PUSH4 => this will push 4 bytes (4 * 2 letters) to the operands array.
      //         Therefore, offset will skip the first byte of the opcodes and 4 bytes of the operands
      const expectedOffset = index + 4 * 2;

      const operandObject = Utils.getPushOperands(opcode!, bytecode, index);

      const expectedOperand = ['80', '40', '1a', 'bf'];

      expect(operandObject.offset).to.eq(expectedOffset);
      expect(operandObject.operands.join(' ')).to.eq(expectedOperand.join(' '));
    });

    test('Should parse bytecode for opcodes in PUSH family', () => {
      const bytecode = '60406380401abf2d5f'; // must be proper bytecode
      const index = 4;
      const byte = bytecode.substring(index, index + 2); // PUSH4

      // @notice 63 = PUSH4 => this will push 4 bytes (4 * 2 letters) to the operands array.
      //         Therefore, offset will skip the first byte of the opcodes and 4 bytes of the operands
      const expectedOffset = index + 4 * 2;

      const expectedOperand = ['80', '40', '1a', 'bf'];

      const result = Utils.parseBytecode(bytecode, byte, index);

      expect(result.index).to.eq(expectedOffset);
      expect(result.opcodeRepresentation.hex).to.eq(byte);
      expect(result.opcodeRepresentation.index16).to.eq('0x4');
      expect(result.opcodeRepresentation.mnemonic).to.eq('PUSH4');
      expect(result.opcodeRepresentation.operand.join(' ')).to.eq(
        expectedOperand.join(' ')
      );
    });

    test('Should parse bytecode for opcodes that are NOT in PUSH family', () => {
      const bytecode = '6080604052'; // must be proper bytecode
      const index = 8;
      const byte = bytecode.substring(index, index + 2); // MSTORE

      const result = Utils.parseBytecode(bytecode, byte, index);

      expect(result.index).to.eq(index);
      expect(result.opcodeRepresentation.hex).to.eq(byte);
      expect(result.opcodeRepresentation.index16).to.eq('0x8');
      expect(result.opcodeRepresentation.mnemonic).to.eq('MSTORE');
      expect(result.opcodeRepresentation.operand.length).to.eq(0);
    });

    test('Should parse bytecode for opcodes that are INVALID', () => {
      const bytecode = '60806040fe'; // must be proper bytecode
      const index = 8;
      const byte = bytecode.substring(index, index + 2); // Invalid opcode

      const result = Utils.parseBytecode(bytecode, byte, index);

      expect(result.index).to.eq(index);
      expect(result.opcodeRepresentation.hex).to.eq(byte);
      expect(result.opcodeRepresentation.index16).to.eq('0x8');
      expect(result.opcodeRepresentation.mnemonic).to.eq('INVALID');
      expect(result.opcodeRepresentation.operand.length).to.eq(0);
    });

    test('Should remove CBOR-encoded metadata hash appended at the end of bytecode', () => {
      const BYTECODE =
        '0x608060405234801561000f575f80fd5b506101438061001d5f395ff3fe608060405234801561000f575f80fd5b5060043610610034575f3560e01c80636b06623714610038578063e69f19cd14610054575b5f80fd5b610052600480360381019061004d91906100ba565b610072565b005b61005c61007b565b60405161006991906100f4565b60405180910390f35b805f8190555050565b5f8054905090565b5f80fd5b5f819050919050565b61009981610087565b81146100a3575f80fd5b50565b5f813590506100b481610090565b92915050565b5f602082840312156100cf576100ce610083565b5b5f6100dc848285016100a6565b91505092915050565b6100ee81610087565b82525050565b5f6020820190506101075f8301846100e5565b9291505056fea26469706673582212203730408c8004d51639b6ff1e841d6944bb83c335c0fe79a602ee0066681b007664736f6c63430008150033';

      const EXPECTED_BYCODE =
        '0x608060405234801561000f575f80fd5b506101438061001d5f395ff3fe608060405234801561000f575f80fd5b5060043610610034575f3560e01c80636b06623714610038578063e69f19cd14610054575b5f80fd5b610052600480360381019061004d91906100ba565b610072565b005b61005c61007b565b60405161006991906100f4565b60405180910390f35b805f8190555050565b5f8054905090565b5f80fd5b5f819050919050565b61009981610087565b81146100a3575f80fd5b50565b5f813590506100b481610090565b92915050565b5f602082840312156100cf576100ce610083565b5b5f6100dc848285016100a6565b91505092915050565b6100ee81610087565b82525050565b5f6020820190506101075f8301846100e5565b9291505056fe';

      const noMetadataBycode = Utils.removeCBORMetadata(BYTECODE);

      expect(noMetadataBycode).to.eq(EXPECTED_BYCODE);
    });

    test('Should leave the bytecode as-is if there is no CBOR-encoded metadata', () => {
      const BYTECODE = '0x6080604052';

      const noMetadataBycode = Utils.removeCBORMetadata(BYTECODE);

      expect(noMetadataBycode).to.eq(BYTECODE);
    });
  });

  describe('Disassmebler tests', () => {
    test('Should disassemble a valid bytecode', () => {
      DISASSEMBLER_TESTING_ASSETS.forEach((asset) => {
        const disassembly = Disassembler.disassemble(asset.bytecode);

        for (let i = 0; i < disassembly!.length; i++) {
          expect(disassembly![i].index16).to.eq(
            asset.expectedDisassembly[i].index16
          );
          expect(disassembly![i].hex).to.eq(asset.expectedDisassembly[i].hex);
          expect(disassembly![i].mnemonic).to.eq(
            asset.expectedDisassembly[i].mnemonic
          );
          expect(disassembly![i].operand.join('')).to.eq(
            asset.expectedDisassembly[i].operand.join('')
          );
        }
      });
    });

    test('Should return null if bytecode is not valid', () => {
      const INVALID_BYTECODE = '0x30f';
      const disassembly = Disassembler.disassemble(INVALID_BYTECODE);
      expect(disassembly).to.be.null;
    });
  });
});
