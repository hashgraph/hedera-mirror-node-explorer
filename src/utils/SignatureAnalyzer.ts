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

import {computed, ComputedRef, ref, Ref, watch, WatchStopHandle} from "vue";
import {AxiosResponse} from "axios";
import {ContractAction} from "@/schemas/HederaSchemas";
import {SignatureResponse} from "@/schemas/SignatureResponse";
import {SignatureCollector} from "@/utils/collector/SignatureCollector";
import {byteToHex, hexToByte} from "@/utils/B64Utils";
import {EntityID} from "@/utils/EntityID";
import {systemContractRegistry} from "@/schemas/SystemContractRegistry";

export class SignatureAnalyzer {

    private readonly action: Ref<ContractAction|null>
    private watchHandle: WatchStopHandle|null = null
    private functionHashRef: Ref<string|null> = ref(null)
    private signatureRef: Ref<string|null> = ref(null)

    //
    // Public
    //

    public constructor(action: Ref<ContractAction|null>) {
        this.action = action
    }

    public mount(): void {
        this.watchHandle = watch(this.action, this.actionDidChange, { immediate: true})
    }

    public unmount(): void {
        if (this.watchHandle !== null) {
            this.watchHandle()
            this.watchHandle = null
        }
        this.functionHashRef.value = null
        this.signatureRef.value = null
    }

    public readonly functionHash: ComputedRef<string|null> = computed(() => {
        return this.functionHashRef.value
    })

    public readonly signature: ComputedRef<string|null> = computed(() => this.signatureRef.value)

    //
    // Private
    //

    private readonly actionDidChange = () => {
        this.functionHashRef.value = null
        this.signatureRef.value = null

        if (this.action.value !== null) {
            switch(this.action.value.call_type) {
                case "NO_ACTION":
                    // Leaves function hash and signature to null
                    break;
                case "CALL":
                case "CREATE": {
                    this.functionHashRef.value = this.makeInputPrefix()
                    if (this.functionHashRef.value !== null) {
                        SignatureCollector.instance.fetch(this.functionHashRef.value).then((r: AxiosResponse<SignatureResponse>) => {
                            const results = r.data?.results
                            this.signatureRef.value = results && results.length >= 1 ? results[0].text_signature : null
                        })
                    }
                    break;
                }
                case "PRECOMPILE": {
                    const contractID = this.action.value.recipient ? EntityID.parse(this.action.value.recipient) : null
                    if (contractID !== null && contractID.isEthereumPrecompiledContract()) {
                        this.functionHashRef.value = "Ethereum pre-compiled contract"
                        this.signatureRef.value = "tbd"
                    }
                    break;
                }
                case "SYSTEM": {
                    this.functionHashRef.value = this.makeInputPrefix()
                    if (this.functionHashRef.value !== null) {
                        const contractID = this.action.value.recipient ? EntityID.parse(this.action.value.recipient) : null
                        const contractEntry = contractID !== null ? systemContractRegistry.lookup(contractID.toString()) : null
                        if (contractEntry !== null) {
                            this.signatureRef.value = contractEntry.signatures.get(this.functionHashRef.value) ?? null
                        }
                    }
                }
            }
        }
        // else leaves function hash and signature to null

    }

    private makeInputPrefix() : string| null {
        let result: string|null
        if (this.action.value?.input) {
            const bytes = hexToByte(this.action.value.input)?.slice(0, 4)
            result = bytes && bytes.length >= 1 ? "0x" + byteToHex(bytes) : null
        } else {
            result = null
        }
        return result
    }
}