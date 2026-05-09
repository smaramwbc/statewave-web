import "@testing-library/jest-dom/vitest";
import { beforeEach, vi } from "vitest";

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
