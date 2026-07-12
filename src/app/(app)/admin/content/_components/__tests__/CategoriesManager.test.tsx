import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CategoriesManager } from "@/app/(app)/admin/content/_components/CategoriesManager";

// Mock Firebase
jest.mock("firebase/database", () => ({
  ref: jest.fn(),
  push: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

// Mock Toast
jest.mock("@/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
}));

const mockCategories = [
  { id: "cat1", name: "Software Engineering", description: "All about coding" },
  { id: "cat2", name: "Design", description: "UI/UX and Graphic Design" },
];

describe("CategoriesManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with categories", () => {
    render(<CategoriesManager careerCategories={mockCategories} academicCategories={[]} skillCategories={[]} />);
    expect(screen.getByText("Industry Domains")).toBeInTheDocument();
    expect(screen.getByText("Software Engineering")).toBeInTheDocument();
    expect(screen.getByText("Design")).toBeInTheDocument();
  });

  it("opens 'New Category' dialog on Add Category click", () => {
    render(<CategoriesManager careerCategories={mockCategories} academicCategories={[]} skillCategories={[]} />);
    const addButton = screen.getByText("Add Category");
    fireEvent.click(addButton);
    
    expect(screen.getByText("New Category")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Data Science")).toBeInTheDocument();
  });

  it("validates empty name on submit", async () => {
    render(<CategoriesManager careerCategories={mockCategories} academicCategories={[]} skillCategories={[]} />);
    fireEvent.click(screen.getByText("Add Category"));
    
    const saveButton = screen.getByText("Save Category");
    fireEvent.click(saveButton);
    
    // We can't strictly test toast execution without spying on the mock,
    // but we can ensure Firebase push is NOT called.
    const { push } = require("firebase/database");
    expect(push).not.toHaveBeenCalled();
  });

  it("calls push on valid submit", async () => {
    render(<CategoriesManager careerCategories={mockCategories} academicCategories={[]} skillCategories={[]} />);
    fireEvent.click(screen.getByText("Add Category"));
    
    const nameInput = screen.getByPlaceholderText("e.g. Data Science");
    fireEvent.change(nameInput, { target: { value: "New Domain" } });
    
    const saveButton = screen.getByText("Save Category");
    fireEvent.click(saveButton);
    
    const { push } = require("firebase/database");
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });

  // Since edit/delete are inside a DropdownMenu, radix-ui dropdowns require clicking triggers,
  // which can be tricky in jsdom without full pointer events. But we can ensure it renders the grid.
});
