/// <reference lib="webworker"/>

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

import {SolcReport, SolcWorkerInput, SolcWorkerOutput} from "@/utils/solc/SolcUtils";
import {SolcInput} from "@/utils/solc/SolcInput";

//
// Prefixing with self is very important.
// In vitest context, self.onmessage works but onmessage does not.
//

self.onmessage = (event: MessageEvent) => {
    handleMessage(event)
        .then((report: SolcReport) => {
            const response: SolcWorkerOutput = { report: report }
            self.postMessage(response)
        })
        .catch((reason: unknown) => {
            const response: SolcWorkerOutput = { error: reason }
            self.postMessage(response)
        })
}

async function handleMessage(event: MessageEvent): Promise<SolcReport> {
    const workerInput = event.data as SolcWorkerInput
    const solcInput = workerInput.input
    const solc = await makeSolc(workerInput.version)
    const resolution: Record<string, string> = {}
    const importCallback = (path: string) =>  {
        const result = {} as { contents?: string, error: unknown }
        const resolvedPath = resolvePath(path, solcInput)
        if (resolvedPath !== null) {
            result.contents = solcInput.sources[resolvedPath].content
            resolution[path] = resolvedPath
        } else {
            result.error = "File not found: " + path
        }
        return result
    }
    const options = { import: importCallback }
    const solcOutput = JSON.parse((solc as any).compile(JSON.stringify(workerInput.input), options))
    return { output: solcOutput, resolution: resolution}
}

async function makeSolc(version: string): Promise<unknown> {
    let result: unknown

    const useImportScripts = "importScripts" in self
    // true => inside browser
    // false => inside vitest context

    if (useImportScripts) {
        // 1) Ideal world:
        //      - just import solc
        //      - worker type can be "classic" or "module"
        //
        // Build:   OK
        //
        // Run:     KO
        //      - TypeError: solJson.cwrap is not a function :(
        //      - import statement crashes
        //

        // result = await import("solc")

        // 2) importScripts() + import() + wrapper() + classic worker
        //      2.1) importScripts("https://binaries.soliditylang.org/bin/soljson-v0.8.17+commit.8df45f5f.js"
        //      2.2) await import("solc/wrapper")
        //      2.3) wrapper(Module)
        //
        // Build:   OK
        //
        // Run:     KO
        //      - TypeError: wrapper is not a function
        //      - 2.2 returns an unusable module

        // const compilerURL = "https://binaries.soliditylang.org/bin/soljson-" + version + ".js"
        // self.importScripts(compilerURL)
        // const wrapper = (await import("solc/wrapper")).wrapper
        // result = wrapper((self as any).Module)

        // 2) importScripts() + importScripts() + wrapper() + classic worker
        //      2.1) importScripts("https://binaries.soliditylang.org/bin/soljson-v0.8.17+commit.8df45f5f.js"
        //      2.2) importScripts("solc/wrapper")
        //      2.3) wrapper(Module)
        //
        // Build:   OK
        //
        // Run:     KO
        //      - DOMException: Failed to execute 'importScripts' on 'WorkerGlobalScope': The script at 'https://localhost:5173/src/utils/solc/solc/wrapper'
        //      - 2.2 breaks

        // const compilerURL = "https://binaries.soliditylang.org/bin/soljson-" + version + ".js"
        // self.importScripts(compilerURL)
        // self.importScripts("solc/wrapper")
        // result = (self as any).wrapper((self as any).Module)

        // 4) import() + import() + wrapper() + module worker
        //      4.1) await import("https://binaries.soliditylang.org/bin/soljson-v0.8.17+commit.8df45f5f.js"
        //      4.2) await import("solc/wrapper")
        //      4.3) wrapper(Module)
        //
        // Build:   OK
        // Run:     KO
        //      - 4.1 returns undefined
        //      - 4.2 returns an unusable module

        // const compilerURL = "https://binaries.soliditylang.org/bin/soljson-" + version + ".js"
        // const soljson = (await import(compilerURL)).Module
        // const wrapper = (await import("solc/wrapper")).wrapper
        // result = wrapper(soljson)

        const compilerURL = "https://binaries.soliditylang.org/bin/soljson-" + version + ".js"
        self.importScripts(compilerURL)
        const wrapper = (await import("solc/wrapper")).default
        result = wrapper((self as any).Module)

    } else {
        const solc = await import("solc")
        result = new Promise<unknown>((resolve, reject) => {
            solc.loadRemoteVersion(version, function(err: unknown, solcSnapshot: typeof solc) {
                if (err) {
                    reject(err)
                } else {
                    resolve(solcSnapshot)
                }
            })
        })
    }
    return result
}

function resolvePath(path: string, input: SolcInput): string|null {
    let result: string|null
    if (path in input.sources) {
        result = path
    } else {
        result = null
        const targets = Object.keys(input.sources)
        for (const t of targets) {
            if (pathEndsWith(t, path)) {
                result = t
                break
            }
        }
        if (result == null) {
            const i = path.lastIndexOf("/")
            if (i != 1) {
                const fileName = path.substring(i+1)
                for (const t of targets) {
                    if (pathEndsWith(t, fileName)) {
                        result = t
                        break
                    }
                }
            }
        }
    }
    return result
}

function pathEndsWith(path: string, suffix: string): boolean {
    let result: boolean
    if (path == suffix) {
        result = true
    } else if (path.length >= suffix.length + 1) {
        const ss1 = "/" + suffix
        const ss2 = path.substring(path.length - ss1.length)
        result = ss1 == ss2
    } else {
        result = false
    }
    return result
}
