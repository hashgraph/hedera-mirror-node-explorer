declare const window: any

export function getEnv(name: string): string {
    return window?.configs?.[name] || process.env[name]
}