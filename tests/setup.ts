import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

// Route components are lazy-loaded and the blog loader eagerly globs every
// .mdx post, so the first render of a heavy route has to compile and import
// a lot before the title lands. Testing Library's 1s default for waitFor is
// tight enough that adding a post can tip it over on a cold cache.
configure({ asyncUtilTimeout: 10_000 });

afterEach(() => cleanup());

// Stub `fetch` globally before every test so components that fire
// network calls during render (e.g. <HeroBackground> → fetchLiveData
// → /api/hero-data) get a deterministic, immediate non-success
// response instead of trying to hit http://localhost:3000 — which CI
// does not serve and which surfaces as an intermittent
// `ECONNREFUSED` from the unhandled in-flight fetch racing with
// vitest's teardown (issue #37).
//
// Tests that need to assert specific fetch behavior keep overriding
// the stub with `vi.spyOn(globalThis, 'fetch').mockImplementation(...)`
// or `vi.stubGlobal('fetch', ...)`; either works because vitest's
// `restoreAllMocks` / `unstubAllGlobals` restore the per-test override
// back to this default at teardown.
beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () =>
      new Response(JSON.stringify({ subjects: [] }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  );
});

// happy-dom ≥ 20.12 implements the browser contract for
// `Animation.cancel()`: the pending `animation.finished` promise REJECTS
// with an AbortError. In a real browser that rejection is routinely
// unobserved and harmless; under vitest it fails the run as an unhandled
// rejection during framer-motion's teardown, while every assertion
// passes. Defuse exactly that: pre-attach a catch to `finished` around
// cancel() (and swallow a synchronous AbortError for older happy-dom
// builds that threw instead). Remove once motion-dom guards its
// teardown against the cancel rejection.
const AnimationCtor = (globalThis as { Animation?: { prototype: Animation } }).Animation;
if (AnimationCtor) {
  const originalCancel = AnimationCtor.prototype.cancel;
  const swallowAbort = (error: unknown) => {
    if ((error as { name?: string })?.name !== "AbortError") throw error;
  };
  AnimationCtor.prototype.cancel = function cancelTolerantOfAbort(this: Animation) {
    try {
      this.finished?.catch?.(swallowAbort);
    } catch {
      /* finished getter itself may throw on detached animations */
    }
    try {
      originalCancel.call(this);
    } catch (error) {
      swallowAbort(error);
    }
  };
}
