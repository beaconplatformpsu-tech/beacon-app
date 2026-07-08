import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { PathsManager } from "@/app/(app)/admin/content/_components/PathsManager";

// Mock Firebase
jest.mock("firebase/database", () => ({
  ref: jest.fn(),
  push: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
  set: jest.fn(),
}));

jest.mock("@/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
}));

const mockPaths = [
  { id: "path1", title: "Frontend Developer", categoryId: "cat1", demandLevel: "High" },
];
const mockCategories = [{ id: "cat1", name: "Software Engineering" }];
const mockSkills = [{ id: "skill1", name: "React" }];
const mockResources: any[] = [];

describe("PathsManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders existing paths", () => {
    render(<PathsManager paths={mockPaths} categories={mockCategories} skills={mockSkills} resources={mockResources} />);
    expect(screen.getByText("Frontend Developer")).toBeInTheDocument();
  });

  it("opens 'New Career Path' dialog on Add Path click", () => {
    render(<PathsManager paths={mockPaths} categories={mockCategories} skills={mockSkills} resources={mockResources} />);
    fireEvent.click(screen.getByText("Add Path"));
    expect(screen.getByText("New Career Path")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Full Stack Developer")).toBeInTheDocument();
  });

  it("allows filling out the form and submitting", async () => {
    render(<PathsManager paths={mockPaths} categories={mockCategories} skills={mockSkills} resources={mockResources} />);
    fireEvent.click(screen.getByText("Add Path"));
    
    const titleInput = screen.getByPlaceholderText("e.g. Full Stack Developer");
    fireEvent.change(titleInput, { target: { value: "Backend Developer" } });
    
    fireEvent.click(screen.getByText("Save Path"));
    
    const { push } = require("firebase/database");
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });
});
