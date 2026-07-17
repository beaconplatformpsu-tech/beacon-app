import { normalizeAppRole } from "../roles";

describe("normalizeAppRole", () => {
  it("keeps admin roles as admin", () => {
    expect(normalizeAppRole("admin")).toBe("admin");
  });

  it("treats unsupported or legacy roles as student", () => {
    expect(normalizeAppRole("super_admin")).toBe("student");
    expect(normalizeAppRole("content_admin")).toBe("student");
    expect(normalizeAppRole("support_agent")).toBe("student");
  });

  it("keeps student roles as student", () => {
    expect(normalizeAppRole("student")).toBe("student");
  });
});
