import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import AdminSettingsPage from "@/app/(app)/admin/settings/page";

jest.mock("firebase/database", () => {
  return {
    ref: jest.fn(),
    onValue: jest.fn((ref, callback) => {
      // Mock passing data immediately
      callback({
        val: () => ({
          platformName: "Beacon Platform",
          contactEmail: "support@beacon.com",
        }),
        exists: () => true,
      });
      return jest.fn(); // Unsubscribe mock
    }),
    update: jest.fn(),
    serverTimestamp: jest.fn(() => 'mock-timestamp')
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

describe("AdminSettingsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders settings from Firebase", async () => {
    render(<AdminSettingsPage />);
    
    await waitFor(() => {
      const nameInput = screen.getByDisplayValue("Beacon");
      expect(nameInput).toBeInTheDocument();
      
      const emailInput = screen.getByDisplayValue("support@beacon.com");
      expect(emailInput).toBeInTheDocument();
    });
  });

  it("allows updating settings", async () => {
    render(<AdminSettingsPage />);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue("Beacon")).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue("Beacon");
    fireEvent.change(nameInput, { target: { value: "New Platform Name" } });
    
    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);
    
    const { update } = require("firebase/database");
    await waitFor(() => {
      expect(update).toHaveBeenCalled();
    });
  });
});
