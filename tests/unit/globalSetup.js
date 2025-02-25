import {beforeEach, vi} from 'vitest'
import {CacheUtils} from "@/utils/cache/CacheUtils";
import * as ResizeObserverModule from 'resize-observer-polyfill';

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


global["ResizeObserver"] = ResizeObserverModule.default
