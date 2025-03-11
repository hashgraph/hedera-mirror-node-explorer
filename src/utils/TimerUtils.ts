// SPDX-License-Identifier: Apache-2.0

// Wraps window.setTimeout() in an async function
export async function waitFor(milliseconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}


export async function timeGuard<T>(p: Promise<T>, milliseconds: number): Promise<T> {
    const timeout = new Promise<T>((resolve, reject) => {
        window.setTimeout(() => reject(new TimeGuardError()), milliseconds)
    })
    return Promise.race<T>([p, timeout])
}

export class TimeGuardError extends Error {
    constructor() {
        super("TimeGuardError")
    }
}
