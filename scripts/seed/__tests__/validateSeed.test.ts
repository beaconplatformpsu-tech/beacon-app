import { validateSeedPayload } from "../validateSeed";

describe("validateSeedPayload", () => {
  it("returns errors for an incomplete payload", () => {
    const errors = validateSeedPayload({});
    expect(Array.isArray(errors)).toBe(true);
    expect(errors.length).toBeGreaterThan(0);
  });
});
