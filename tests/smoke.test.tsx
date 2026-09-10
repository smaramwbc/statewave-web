import { describe, it, expect } from "vitest";

describe("App smoke tests", () => {
  // 20s, not the 5s default: this asserts that App's module graph *loads*,
  // and a cold full-suite run transforms it while thirty other files
  // compete for the same workers — the import itself takes ~20ms once warm.
  it("modules can be imported", async () => {
    const mod = await import("../src/App");
    expect(mod.default).toBeDefined();
  }, 20_000);

  it("theme module exports expected interface", async () => {
    const mod = await import("../src/lib/theme");
    expect(mod.ThemeProvider).toBeDefined();
    expect(mod.useTheme).toBeDefined();
  });
});
