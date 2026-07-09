import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboard from "@/app/(app)/admin/page";

const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
};

jest.mock("@/hooks/use-custom-toast", () => ({
  useCustomToast: () => mockToast,
}));

jest.mock("firebase/database", () => ({
  ref: jest.fn((db, path) => path),
  query: jest.fn((ref) => ref),
  limitToLast: jest.fn(),
  get: jest.fn(async (refPath) => {
    if (refPath === "users") {
      return {
        exists: () => true,
        val: () => ({ user1: {}, user2: {}, user3: {} }),
      };
    } else if (refPath === "public_content/resources") {
      return {
        exists: () => true,
        val: () => ({ res1: {}, res2: {}, res3: {}, res4: {}, res5: {} }),
      };
    } else if (refPath === "system/support_messages") {
      return {
        exists: () => true,
        val: () => ({ msg1: {} }),
      };
    } else {
      return { exists: () => false, val: () => null };
    }
  }),
}));

describe("AdminDashboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the dashboard header", async () => {
    render(<AdminDashboard />);
    expect(screen.getByText("Admin Overview")).toBeInTheDocument();
    expect(screen.getByText("Real-time metrics and system management.")).toBeInTheDocument();
    expect(screen.getByText("System Online")).toBeInTheDocument();
  });

  it("displays the correct statistics from Firebase", async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      // 3 users
      expect(screen.getByText("Total Users").nextElementSibling).toHaveTextContent("3");
      // 5 resources
      expect(screen.getByText("Active Resources").nextElementSibling).toHaveTextContent("5");
      // 1 message
      expect(screen.getByText("User Feedback").nextElementSibling).toHaveTextContent("1");
    });
  });

  it("renders quick action links", async () => {
    render(<AdminDashboard />);

    // Link titles
    expect(screen.getByText("Manage Users")).toBeInTheDocument();
    expect(screen.getByText("Manage Content")).toBeInTheDocument();
    expect(screen.getByText("Support Messages")).toBeInTheDocument();
    
    // Link elements
    const links = screen.getAllByRole("link");
    expect(links.some((l: any) => l.getAttribute("href") === "/admin/users")).toBe(true);
    expect(links.some((l: any) => l.getAttribute("href") === "/admin/content")).toBe(true);
    expect(links.some((l: any) => l.getAttribute("href") === "/admin/messages")).toBe(true);
  });

  it("renders system health checks", async () => {
    render(<AdminDashboard />);

    expect(screen.getByText("Firebase Auth")).toBeInTheDocument();
    expect(screen.getByText("Realtime Database")).toBeInTheDocument();
    expect(screen.getByText("Cloud Storage")).toBeInTheDocument();
    expect(screen.getByText("API Servers")).toBeInTheDocument();
    
    // Check for "Operational" statuses
    const statuses = screen.getAllByText("Operational");
    expect(statuses.length).toBe(4);
  });
});
