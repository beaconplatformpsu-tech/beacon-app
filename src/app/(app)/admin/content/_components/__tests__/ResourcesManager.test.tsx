import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ResourcesManager } from "@/app/(app)/admin/content/_components/ResourcesManager";

jest.mock("firebase/database", () => ({
  ref: jest.fn(),
  push: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
}));

jest.mock("@/lib/firebase/storage", () => ({
  uploadFileToFirebase: jest.fn().mockResolvedValue("https://example.com/file")
}));

jest.mock("@/hooks/use-custom-toast", () => ({
  useCustomToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
    info: jest.fn(),
  }),
}));

const mockResources = [{ id: "res1", title: "React Docs", url: "https://react.dev", resourceType: "Document" }];
const mockPaths: any[] = [];
const mockSkills: any[] = [];
const mockCategories: any[] = [];

describe("ResourcesManager", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders existing resources", () => {
    render(<ResourcesManager resources={mockResources} paths={mockPaths} skills={mockSkills} categories={mockCategories} />);
    expect(screen.getByText("React Docs")).toBeInTheDocument();
  });

  it("opens 'New Resource' dialog", () => {
    render(<ResourcesManager resources={mockResources} paths={mockPaths} skills={mockSkills} categories={mockCategories} />);
    fireEvent.click(screen.getByText("Add Resource"));
    expect(screen.getByText("New Resource")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. React Official Documentation")).toBeInTheDocument();
  });

  it("allows submitting a new resource link", async () => {
    render(<ResourcesManager resources={mockResources} paths={mockPaths} skills={mockSkills} categories={mockCategories} />);
    fireEvent.click(screen.getByText("Add Resource"));
    
    const titleInput = screen.getByPlaceholderText("e.g. React Official Documentation");
    fireEvent.change(titleInput, { target: { value: "Next.js Docs" } });
    
    const urlInput = screen.getByPlaceholderText("https://example.com/course");
    fireEvent.change(urlInput, { target: { value: "https://nextjs.org" } });
    
    fireEvent.click(screen.getByText("Save Resource"));
    
    const { push } = require("firebase/database");
    await waitFor(() => {
      expect(push).toHaveBeenCalled();
    });
  });
});
