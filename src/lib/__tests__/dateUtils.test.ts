import { dateUtils } from "../dateUtils";

describe("dateUtils", () => {
  describe("formatStandard", () => {
    it("formats a valid ISO string correctly", () => {
      const date = new Date("2023-10-12T10:00:00Z").toISOString();
      expect(dateUtils.formatStandard(date)).toMatch(/Oct 12, 2023/);
    });

    it("returns empty string for null or undefined", () => {
      expect(dateUtils.formatStandard(null)).toBe("");
      expect(dateUtils.formatStandard(undefined)).toBe("");
    });
  });

  describe("isOverdue", () => {
    it("returns true for a past date that is not today", () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 2);
      expect(dateUtils.isOverdue(pastDate.toISOString())).toBe(true);
    });

    it("returns false for today", () => {
      const today = new Date();
      expect(dateUtils.isOverdue(today.toISOString())).toBe(false);
    });

    it("returns false for a future date", () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 2);
      expect(dateUtils.isOverdue(futureDate.toISOString())).toBe(false);
    });
  });
});
