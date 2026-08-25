import "@testing-library/jest-dom/vitest"

import { cleanup } from "@testing-library/react"
import { afterAll, afterEach, beforeAll, vi } from "vitest"

import { server } from "./server"

const nativeFetch = globalThis.fetch

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" })
  const interceptedFetch = globalThis.fetch

  globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    const resolvedInput =
      typeof input === "string" && input.startsWith("/")
        ? new URL(input, "http://localhost")
        : input

    return interceptedFetch(resolvedInput, init)
  }) as typeof fetch
})

afterEach(() => {
  cleanup()
  server.resetHandlers()
  vi.useRealTimers()
})

afterAll(() => {
  server.close()
  globalThis.fetch = nativeFetch
})

Object.defineProperty(window, "matchMedia", {
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    addEventListener: vi.fn(),
    addListener: vi.fn(),
    dispatchEvent: vi.fn(),
    matches: false,
    media: query,
    onchange: null,
    removeEventListener: vi.fn(),
    removeListener: vi.fn(),
  })),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, "scrollTo", {
  configurable: true,
  value: vi.fn(),
  writable: true,
})

Object.defineProperty(HTMLElement.prototype, "scrollIntoView", {
  configurable: true,
  value: vi.fn(),
  writable: true,
})

Object.defineProperties(HTMLElement.prototype, {
  hasPointerCapture: {
    configurable: true,
    value: vi.fn(() => false),
  },
  releasePointerCapture: {
    configurable: true,
    value: vi.fn(),
  },
  setPointerCapture: {
    configurable: true,
    value: vi.fn(),
  },
})

window.requestAnimationFrame = (callback: FrameRequestCallback) => {
  callback(0)
  return 0
}
window.cancelAnimationFrame = vi.fn()

class ResizeObserverMock implements ResizeObserver {
  readonly observedElements = new Set<Element>()

  disconnect() {
    this.observedElements.clear()
  }

  observe(target: Element) {
    this.observedElements.add(target)
  }

  unobserve(target: Element) {
    this.observedElements.delete(target)
  }
}

globalThis.ResizeObserver = ResizeObserverMock
