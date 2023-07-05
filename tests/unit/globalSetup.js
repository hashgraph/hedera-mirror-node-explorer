import { beforeEach, vi } from 'vitest'
import {CacheUtils} from "@/utils/cache/CacheUtils";
import {TextEncoder, TextDecoder} from 'util';

beforeEach(() => {
    CacheUtils.clearAll()
})

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
    })),
});

Object.assign(global, { TextEncoder, TextDecoder });
