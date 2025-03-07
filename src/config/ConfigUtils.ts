// SPDX-License-Identifier: Apache-2.0

export function fetchBoolean(obj: any, key: string): boolean|null {
    let result: boolean|null
    if (key in obj) {
        const value = obj[key]
        if (value === null) {
            result = null
        } else if (typeof value === 'boolean') {
            result = value
        } else {
            throw new TypeError('Expected ' + key + ' to be boolean, got ' + typeof value)
        }
    } else {
        result = null
    }
    return result
}

export function fetchNumber(obj: any, key: string): number|null {
    let result: number|null
    if (key in obj) {
        const value = obj[key]
        if (value === null) {
            result = null
        } else if (typeof value === 'number') {
            result = value
        } else {
            throw new TypeError('Expected ' + key + ' to be number, got ' + typeof value)
        }
    } else {
        result = null
    }
    return result
}

export function fetchString(obj: any, key: string): string|null {
    let result: string|null
    if (key in obj) {
        const value = obj[key]
        if (value === null) {
            result = null
        } else if (typeof value === 'string') {
            result = value
        } else {
            throw new TypeError('Expected ' + key + ' to be string, got ' + typeof value)
        }
    } else {
        result = null
    }
    return result
}

export function fetchURL(obj: any, key: string): string|null {
    let result: string|null
    const s = fetchString(obj, key)
    if (s !== null) {
        try {
            const url = new URL(s, window.location.origin)
            result = url.toString()
        } catch {
            throw new TypeError('Expected ' + key + ' to be URL, got ' + obj)
        }
    } else {
        result = null
    }
    return result
}

export function fetchObject(obj: any, key: string): object|null {
    let result: object|null
    if (key in obj) {
        const value = obj[key]
        if (value === null) {
            result = null
        } else if (typeof value === 'object') {
            result = value
        } else {
            throw new TypeError('Expected ' + key + ' to be object, got ' + typeof value)
        }
    } else {
        result = null
    }
    return result
}
