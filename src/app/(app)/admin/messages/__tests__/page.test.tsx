import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminMessagesPage from "@/app/(app)/admin/messages/page";

// Mock Firebase
jest.mock("firebase/database", () => {
  return {
    ref: jest.fn(),
    onValue: jest.fn((ref, callback) => {
      // Mock passing data immediately
      callback({
        val: () => ({
          msg1: {
            name: "John Doe",
            email: "john@example.com",
            message: "Hello world",
            createdAt: new Date().toISOString(),
          },
        }),
      });
      return jest.fn(); // Unsubscribe mock
    }),
    remove: jest.fn(),
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

describe("AdminMessagesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders messages from Firebase", async () => {
    render(<AdminMessagesPage />);
    
    // Check if the loaded data renders
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Hello world")).toBeInTheDocument();
    });
  });

  it("filters messages by search", async () => {
    render(<AdminMessagesPage />);
    
    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Search by name/i);
    fireEvent.change(searchInput, { target: { value: "Unknown User" } });
    
    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Your inbox is empty")).toBeInTheDocument();
  });
});
