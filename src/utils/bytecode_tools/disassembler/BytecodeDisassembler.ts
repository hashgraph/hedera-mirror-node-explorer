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

import { DisassembledOpcodeOutput, Helpers } from './utils/helpers';

export class Disassembler {
  /**
   * @dev disassembles bytecode into EVM opcodes
   * @param bytecode: string
   * @return DisassembledOpcodeOutput[]
   */
  public static disassemble(bytecode: string) {
    const properBytecode = Helpers.prepBytecode(bytecode);
    if (!properBytecode) return null;
    const disassembly: DisassembledOpcodeOutput[] = [];

    for (let i = 0; i < properBytecode.length; i += 2) {
      const hex = properBytecode.substring(i, i + 2);
      const parsedOpcodeResult = Helpers.parseBytecode(properBytecode, hex, i);

      disassembly.push(parsedOpcodeResult.opcodeRepresentation);

      i = parsedOpcodeResult.index;
    }

    return disassembly;
  }
}
