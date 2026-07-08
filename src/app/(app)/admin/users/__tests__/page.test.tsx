import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminUsersPage from "@/app/(app)/admin/users/page";

jest.mock("firebase/database", () => {
  return {
    ref: jest.fn(),
    onValue: jest.fn((ref, callback) => {
      // Mock passing data immediately
      callback({
        val: () => ({
          user1: {
            email: "admin@example.com",
            displayName: "Admin User",
            role: "admin",
            createdAt: new Date().toISOString(),
            accountStatus: "active",
          },
          user2: {
            email: "student@example.com",
            displayName: "Student User",
            role: "student",
            createdAt: new Date().toISOString(),
            accountStatus: "suspended",
          },
        }),
      });
      return jest.fn(); // Unsubscribe mock
    }),
    update: jest.fn(),
  };
});

const mockToast = {
  success: jest.fn(),
  error: jest.fn(),
  warning: jest.fn(),
  info: jest.fn(),
};

jest.mock("@/hooks/use-custom-toast", () => ({
  useCustomToast: () => mockToast,
}));

describe("AdminUsersPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders users from Firebase", async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
      expect(screen.getByText("Student User")).toBeInTheDocument();
    });
  });

  it("filters users by search", async () => {
    render(<AdminUsersPage />);
    
    await waitFor(() => {
      expect(screen.getByText("Admin User")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name or email/i);
    fireEvent.change(searchInput, { target: { value: "Student" } });
    
    expect(screen.queryByText("Admin User")).not.toBeInTheDocument();
    expect(screen.getByText("Student User")).toBeInTheDocument();
  });
});
