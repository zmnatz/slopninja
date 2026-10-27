import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}
globalThis.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

// jsdom has no canvas. This stub accepts any 2D drawing call without rendering anything.
function createContextStub(): CanvasRenderingContext2D {
  const target: Record<string | symbol, unknown> = {};
  return new Proxy(target, {
    get(obj, prop) {
      if (!(prop in obj)) obj[prop] = vi.fn();
      return obj[prop];
    },
  }) as unknown as CanvasRenderingContext2D;
}
HTMLCanvasElement.prototype.getContext = vi.fn(() =>
  createContextStub(),
) as unknown as HTMLCanvasElement["getContext"];
HTMLCanvasElement.prototype.toDataURL = vi.fn(() => "data:image/png;base64,");

Element.prototype.setPointerCapture = vi.fn();
Element.prototype.releasePointerCapture = vi.fn();
Element.prototype.hasPointerCapture = vi.fn(() => false);
