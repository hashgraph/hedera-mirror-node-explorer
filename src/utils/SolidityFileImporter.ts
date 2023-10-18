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

import {computed, ref} from "vue";
import {SolcUtils} from "@/utils/solc/SolcUtils";
import {SolcMetadata} from "@/utils/solc/SolcMetadata";

export class SolidityFileImporter {

    public readonly started = ref(false)
    public readonly files = ref<Map<string, string|SolcMetadata>>(new Map())
    public readonly failure = ref<unknown>(null)

    //
    // Public
    //

    public start(transferList: DataTransferItemList) {
        if (this.started.value) {
            console.log("SolidityFileImporter aborts because it's already importing")
        } else {
            this.started.value = true
            const newFiles = new Map<string, string>()
            SolidityFileImporter.importItems(transferList, newFiles)
                .then(() => {
                    this.files.value = mergeMap(this.files.value, newFiles)
                    this.failure.value = null

                })
                .catch((reason: unknown) => {
                    // this.files.value is left unchanged
                    this.failure.value = reason
                    console.log("SolidityFileImporter.start did crash:" + reason)
                })
                .finally( () => {
                    this.started.value = false
                })
        }
    }

    public reset() {
        this.files.value = new Map()
        this.failure.value = null
    }

    public readonly metadataFileCount = computed(() => {
        let result = 0
        for (const content of this.files.value.values()) {
            if (typeof content === "object") {
                result += 1
            }
        }
        return result
    })
    //
    // public readonly solcInput = computed<SolcInput|null>(() => {
    //     let result: SolcInput|null
    //     if (this.files.value.size >= 1 && this.metadataFileCount.value == 1) {
    //         result = {
    //             language: "Solidity",
    //             sources: {},
    //             settings: {
    //                 outputSelection: {
    //                     '*': {
    //                         '*': [ "metadata", "evm.deployedBytecode.object" ],
    //                     },
    //                 },
    //             },
    //         }
    //         for (const [path, content] of this.files.value) {
    //             if (typeof content == "string") {
    //                 result.sources[path] = { content: content }
    //             }
    //         }
    //     } else {
    //         result = null
    //     }
    //     return result
    // })

    //
    // Private
    //

    private static async importItems(l: DataTransferItemList, output: Map<string, string|SolcMetadata>): Promise<void> {
        for (const i of l) {
            const e = i.webkitGetAsEntry()
            if (e !== null) {
                const topFolder = e.isDirectory ? "/" + e.name + "/" : "/"
                await this.importItem(e, output, topFolder)
            }
        }
    }

    private static async importItem(e: FileSystemEntry, output: Map<string, string|SolcMetadata>, topFolder: string): Promise<void> {
        if (e !== null) {
            if (e.isFile) {
                const fileName = e!.name
                if (hasExtension(fileName, ".sol")) {
                    const path = removeTopFolder(e.fullPath, topFolder)
                    const content = await asyncReadText(e as FileSystemFileEntry)
                    output.set(path, content)
                } else if (hasExtension(fileName, ".json")) {
                    const path = removeTopFolder(e.fullPath, topFolder)
                    const content = await asyncReadText(e as FileSystemFileEntry)
                    const metadata = SolcUtils.parseSolcMetadata(content)
                    if (metadata !== null) {
                        output.set(path, metadata)
                    }
                }
            } else if (e.isDirectory) {
                const d = e as FileSystemDirectoryEntry
                for (const c of await asyncReadEntries(d)) {
                    await this.importItem(c, output, topFolder)
                }
            } else {
                console.log("SolidityFileImporter ignored unexpected FileSystemEntry subclass: " + typeof e)
            }
        }
    }
}


async function asyncReadText(e: FileSystemFileEntry): Promise<string> {

    return new Promise<string>((resolve, reject) => {
        e.file((file: File) => {
            resolve(file.text())
        }, (error: unknown) => {
            reject(error)
        })
    })
}

async function asyncReadEntries(e: FileSystemDirectoryEntry): Promise<FileSystemEntry[]> {
    return new Promise<FileSystemEntry[]>((resolve, reject) => {
        e.createReader().readEntries((files: FileSystemEntry[]) => {
            resolve(files)
        }, (reason: unknown) => {
            reject(reason)
        })
    })
}

function mergeMap(m1: Map<string, string|SolcMetadata>, m2: Map<string, string|SolcMetadata>): Map<string,string|SolcMetadata> {
    const result = new Map<string, string|SolcMetadata>
    for (const [p, c] of m1) {
        result.set(p, c)
    }
    for (const [p, c] of m2) {
        result.set(p, c)
    }
    return result
}

function removeTopFolder(path: string, topFolder: string): string {
    let result: string
    if (path.startsWith(topFolder)) {
        result = path.substring(topFolder.length)
    } else {
        result = path
    }
    return result
}

function hasExtension(fileName: string, extension: string): boolean {
    const n = fileName.toLowerCase()
    const x = extension.toLowerCase()
    return n.lastIndexOf(x) == n.length - x.length
}
