import { describe, it, expect } from "vitest";

describe("App smoke tests", () => {
  it("modules can be imported", async () => {
    const mod = await import("../src/App");
    expect(mod.default).toBeDefined();
  });

  it("theme module exports expected interface", async () => {
    const mod = await import("../src/lib/theme");
    expect(mod.ThemeProvider).toBeDefined();
    expect(mod.useTheme).toBeDefined();
  });
});
